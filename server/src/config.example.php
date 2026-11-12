<?php
// Plantilla de configuración. Copia este archivo a `config.php` en este mismo
// directorio (`server/src/config.php`) para arrancar el backend en un clone
// limpio. `config.php` está en .gitignore porque admite valores locales.
//
// El backend lee las credenciales reales de `<repo>/.env` (plantilla: `.env.example`).
// Sin `.env`, caen a los defaults inofensivos de abajo.

$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue; // Saltar comentarios
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        if (!getenv($key)) {
            putenv("$key=$value");
        }
    }
}

return [
    'host'        => getenv('DB_HOST') ?: 'localhost',
    'dbname'      => getenv('DB_NAME') ?: '',
    'user'        => getenv('DB_USER') ?: '',
    'password'    => getenv('DB_PASSWORD') ?: '',
    'charset'     => 'utf8mb4',
    'admin_email' => getenv('ADMIN_EMAIL') ?: 'reservas@oceandrivecarental.com',
    'from_email'  => getenv('FROM_EMAIL') ?: 'reservas@oceandrivecarental.com'
];
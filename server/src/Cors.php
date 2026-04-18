<?php

// CRIT-02 FIX: CORS restringido a orígenes específicos (whitelist)

function handleCors() {
    $allowedOrigins = [
        'https://oceandrivecarental.com',
        'https://www.oceandrivecarental.com',
        'http://localhost:4200',       // Desarrollo Angular
        'http://localhost:4000',       // Desarrollo alternativo
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    }
    // Si el origen no está en la whitelist, NO se envía Access-Control-Allow-Origin
    // El navegador bloqueará la petición cross-origin automáticamente.

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Vary: Origin"); // Requerido para que los proxies/caches no mezclen respuestas CORS

    // Preflight request (OPTIONS) — responder con 204 No Content
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

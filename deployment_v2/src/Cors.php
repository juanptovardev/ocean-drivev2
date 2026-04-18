<?php

function handleCors() {
    // Permitir acceso desde cualquier origen (o especificar el dominio de producción)
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

    // Si es una solicitud OPTIONS (Preflight), terminar aquí con éxito
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

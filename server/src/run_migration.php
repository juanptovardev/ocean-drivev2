<?php
require_once __DIR__ . '/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $sql = file_get_contents(__DIR__ . '/update_schema_seasonal_rates.sql');
    $conn->exec($sql);

    echo "Migration executed successfully.\n";
} catch (Exception $e) {
    echo "Error executing migration: " . $e->getMessage() . "\n";
}

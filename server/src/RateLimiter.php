<?php

/**
 * INFO-02 FIX: Rate Limiter genérico.
 * 
 * Soporta múltiples "acciones" (login, register, booking, api_lookup, etc.)
 * con límites configurables por acción + IP.
 * 
 * Uso:
 *   $rl = new RateLimiter();
 *   if ($rl->isLimitReached($ip, 'register', 10, 3600)) { ... }
 *   $rl->registerAttempt($ip, 'register');
 */

class RateLimiter
{
    private $db;
    private $table = 'rate_limits';

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ensureTableExists();
    }

    private function ensureTableExists()
    {
        // Tabla genérica que soporta múltiples acciones
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            ip_address VARCHAR(45) NOT NULL,
            action VARCHAR(50) NOT NULL DEFAULT 'login',
            attempts INT DEFAULT 1,
            last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (ip_address, action)
        )";
        $this->db->exec($sql);

        // Mantener compatibilidad: si la tabla vieja login_attempts existe, migrar
        try {
            $check = $this->db->query("SHOW TABLES LIKE 'login_attempts'");
            if ($check->rowCount() > 0) {
                $this->db->exec("INSERT IGNORE INTO {$this->table} (ip_address, action, attempts, last_attempt) 
                                 SELECT ip_address, 'login', attempts, last_attempt FROM login_attempts");
            }
        } catch (Exception $e) {
            // Silenciar — tabla vieja podría no existir
        }
    }

    /**
     * Verificar si se alcanzó el límite de intentos.
     * 
     * @param string $ip       IP del cliente
     * @param string $action   Tipo de acción (login, register, booking, api_lookup, etc.)
     * @param int    $maxAttempts  Número máximo de intentos permitidos
     * @param int    $windowSeconds  Ventana de tiempo en segundos (default: 900 = 15 min)
     * @return bool  True si se alcanzó el límite
     */
    public function isLimitReached($ip, $action = 'login', $maxAttempts = 5, $windowSeconds = 900)
    {
        $sql = "SELECT attempts, last_attempt FROM {$this->table} WHERE ip_address = :ip AND action = :action";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':ip' => $ip, ':action' => $action]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            return false;
        }

        $attempts = $result['attempts'];
        $lastAttempt = strtotime($result['last_attempt']);
        $now = time();

        // Si pasó la ventana de tiempo, resetear
        if (($now - $lastAttempt) >= $windowSeconds) {
            $this->resetAttempts($ip, $action);
            return false;
        }

        // Si excede los intentos dentro de la ventana
        if ($attempts >= $maxAttempts) {
            return true;
        }

        return false;
    }

    /**
     * Registrar un intento.
     */
    public function registerAttempt($ip, $action = 'login')
    {
        $sql = "INSERT INTO {$this->table} (ip_address, action, attempts) 
                VALUES (:ip, :action, 1) 
                ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_attempt = CURRENT_TIMESTAMP";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':ip' => $ip, ':action' => $action]);
    }

    /**
     * Resetear intentos para una IP + acción.
     */
    public function resetAttempts($ip, $action = 'login')
    {
        $sql = "DELETE FROM {$this->table} WHERE ip_address = :ip AND action = :action";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':ip' => $ip, ':action' => $action]);
    }
}

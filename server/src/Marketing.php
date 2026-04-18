<?php

require_once __DIR__ . '/Mailer.php';

class Marketing
{
    private $db;
    private $conn;

    public function __construct()
    {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function create($name, $email, $phone)
    {
        $mailer = new Mailer();

        // Check if email already exists
        $stmt = $this->conn->prepare("SELECT id FROM marketing_subscribers WHERE email = :email");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            // Already subscribed, update details.
            $stmtUpdate = $this->conn->prepare("UPDATE marketing_subscribers SET name = :name, phone = :phone, updated_at = CURRENT_TIMESTAMP WHERE email = :email");
            $stmtUpdate->execute([':name' => $name, ':phone' => $phone, ':email' => $email]);

            // Notify Admin of interest (even if existing)
            $mailer->sendMarketingNotification($name, $email, $phone);
            return true;
        }

        $stmt = $this->conn->prepare("INSERT INTO marketing_subscribers (name, email, phone) VALUES (:name, :email, :phone)");
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone
        ]);

        // Notify Admin
        $mailer->sendMarketingNotification($name, $email, $phone);

        return $this->conn->lastInsertId();
    }

    public function getAll()
    {
        $stmt = $this->conn->query("SELECT * FROM marketing_subscribers ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

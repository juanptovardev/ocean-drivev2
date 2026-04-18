<?php

class ContactRequest
{
    private $db;
    private $conn;

    public function __construct()
    {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function create($data)
    {
        $stmt = $this->conn->prepare("INSERT INTO contact_requests (name, phone, email, city, date, time) VALUES (:name, :phone, :email, :city, :date, :time)");
        $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'] ?? '',
            ':email' => $data['email'],
            ':city' => $data['city'] ?? '',
            ':date' => $data['date'] ?? null,
            ':time' => $data['time'] ?? '12:00'
        ]);
        return $this->conn->lastInsertId();
    }
}

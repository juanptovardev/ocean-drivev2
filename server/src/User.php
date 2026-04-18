<?php
require_once __DIR__ . '/Database.php';

class User
{
    private $conn;

    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function create($name, $email, $password, $phone = '', $role = 'user', $nationality = 'Colombia', $docType = 'CC', $docNumber = '')
    {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (name, email, password_hash, phone, role, nationality, doc_type, doc_number) 
                VALUES (:name, :email, :hash, :phone, :role, :nat, :dtype, :dnum)";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':name' => $name,
                ':email' => $email,
                ':hash' => $hash,
                ':phone' => $phone,
                ':role' => $role,
                ':nat' => $nationality,
                ':dtype' => $docType,
                ':dnum' => $docNumber
            ]);
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Integrity constraint violation (duplicate email)
                throw new Exception("Email already registered");
            }
            throw $e;
        }
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = $data['name'];
        }
        if (isset($data['phone'])) {
            $fields[] = "phone = :phone";
            $params[':phone'] = $data['phone'];
        }
        if (isset($data['nationality'])) {
            $fields[] = "nationality = :nat";
            $params[':nat'] = $data['nationality'];
        }
        if (isset($data['doc_type'])) {
            $fields[] = "doc_type = :dtype";
            $params[':dtype'] = $data['doc_type'];
        }
        if (isset($data['doc_number'])) {
            $fields[] = "doc_number = :dnum";
            $params[':dnum'] = $data['doc_number'];
        }

        if (empty($fields))
            return true;

        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }

    public function findByEmail($email)
    {
        $sql = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    public function findById($id)
    {
        $sql = "SELECT id, name, email, phone, role, created_at FROM users WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function updateToken($id, $token)
    {
        // 2 hours expiration
        $expires = date('Y-m-d H:i:s', strtotime('+2 hours'));
        $sql = "UPDATE users SET api_token = :token, token_expires_at = :expires WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':token' => $token, ':expires' => $expires, ':id' => $id]);
    }

    public function findByToken($token)
    {
        $sql = "SELECT id, name, email, role, token_expires_at FROM users WHERE api_token = :token LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();

        if ($user) {
            $now = date('Y-m-d H:i:s');
            if ($user['token_expires_at'] && $now > $user['token_expires_at']) {
                return null; // Expired
            }
        }
        return $user;
    }
    public function setResetToken($email, $token)
    {
        $expires = date('Y-m-d H:i:s', strtotime('+2 hours'));
        $sql = "UPDATE users SET reset_token = :token, reset_token_expires_at = :expires WHERE email = :email";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':token' => $token, ':expires' => $expires, ':email' => $email]);
    }

    public function findByResetToken($token)
    {
        $sql = "SELECT id, reset_token_expires_at FROM users WHERE reset_token = :token LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();

        if ($user) {
            $now = date('Y-m-d H:i:s');
            if ($user['reset_token_expires_at'] && $now > $user['reset_token_expires_at']) {
                return null; // Expired
            }
        }
        return $user;
    }

    public function updatePassword($userId, $newHash)
    {
        $sql = "UPDATE users SET password_hash = :hash, reset_token = NULL, reset_token_expires_at = NULL WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':hash' => $newHash, ':id' => $userId]);
    }

    /**
     * Get all users, optionally filtered by role
     */
    public function getAll($role = null)
    {
        $sql = "SELECT id, name, email, phone, role, nationality, doc_type, doc_number, created_at FROM users";
        $params = [];
        
        if ($role !== null) {
            $sql .= " WHERE role = :role";
            $params[':role'] = $role;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Update user role (admin/user)
     */
    public function updateRole($id, $role)
    {
        if (!in_array($role, ['admin', 'user'])) {
            throw new Exception("Invalid role. Must be 'admin' or 'user'");
        }

        $sql = "UPDATE users SET role = :role WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':role' => $role, ':id' => $id]);
    }

    /**
     * Delete a user by ID
     */
    public function delete($id)
    {
        // First check if user exists
        $checkStmt = $this->conn->prepare("SELECT id FROM users WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        if (!$checkStmt->fetch()) {
            throw new Exception("User not found");
        }

        $sql = "DELETE FROM users WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}

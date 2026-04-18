<?php
require_once __DIR__ . '/Database.php';

class Category
{
    private $conn;

    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function getAll($adminMode = false)
    {
        $sql = "SELECT c.*, COALESCE((SELECT AVG(v.wash_price) FROM vehicles v WHERE v.category_id = c.id), 35000) as wash_price 
                FROM categories c";
        if (!$adminMode) {
            $sql .= " WHERE c.status = 'active'";
        }
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id, $adminMode = false)
    {
        $sql = "SELECT * FROM categories WHERE id = :id";
        if (!$adminMode) {
            $sql .= " AND status = 'active'";
        }
        $sql .= " LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $sql = "INSERT INTO categories (name, base_price, special_periods, luggage, image_url, description, passengers, transmission, stock, status) 
                VALUES (:name, :base_price, :special_periods, :luggage, :image, :desc, :passengers, :transmission, :stock, :status)";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':base_price' => $data['base_price'] ?? ($data['price_per_day'] ?? 0),
            ':special_periods' => (isset($data['special_periods']) && (is_array($data['special_periods']) || is_object($data['special_periods']))) ? json_encode($data['special_periods']) : ($data['special_periods'] ?? ($data['season_dates'] ?? null)),
            ':luggage' => $data['luggage'] ?? 2,
            ':image' => $data['image_url'] ?? '',
            ':desc' => $data['description'] ?? '',
            ':passengers' => $data['passengers'] ?? 4,
            ':transmission' => $data['transmission'] ?? 'auto',
            ':stock' => $data['stock'] ?? 1,
            ':status' => $data['status'] ?? 'active'
        ]);
        return $this->conn->lastInsertId();
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        // Allowed fields
        $allowed = ['name', 'base_price', 'special_periods', 'image_url', 'description', 'passengers', 'transmission', 'stock', 'status', 'luggage'];

        foreach ($data as $key => $value) {
            // Mapping for compatibility
            if ($key == 'price_per_day')
                $key = 'base_price';
            if ($key == 'season_dates')
                $key = 'special_periods';

            if (in_array($key, $allowed)) {
                $fields[] = "$key = :$key";
                if (is_array($value) || is_object($value)) {
                    $params[":$key"] = json_encode($value);
                } else {
                    $params[":$key"] = $value;
                }
            }
        }

        if (empty($fields))
            return false;

        $sql = "UPDATE categories SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id)
    {
        // For safety, we should probably check if there are vehicles attached,
        // but for now we follow simple delete.
        $sql = "DELETE FROM categories WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    public function updateStock($categoryId)
    {
        $sql = "UPDATE categories c 
                SET stock = (SELECT COUNT(*) FROM vehicles v WHERE v.category_id = c.id)
                WHERE c.id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $categoryId]);
    }

    public function syncAllStocks()
    {
        $sql = "UPDATE categories c 
                SET stock = (SELECT COUNT(*) FROM vehicles v WHERE v.category_id = c.id)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute();
    }
}

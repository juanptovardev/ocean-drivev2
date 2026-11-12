<?php
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Category.php';

class Vehicle
{
    private $conn;

    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // Get all vehicles for a specific category
    public function getByCategoryId($categoryId)
    {
        $sql = "SELECT * FROM vehicles WHERE category_id = :cid ORDER BY plate ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':cid' => $categoryId]);
        return $stmt->fetchAll();
    }

    public function create($data)
    {
        $sql = "INSERT INTO vehicles (category_id, plate, wash_price, status) VALUES (:cid, :plate, :wash_price, :status)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':cid' => $data['category_id'],
            ':plate' => $data['plate'],
            ':wash_price' => $data['wash_price'] ?? 35000,
            ':status' => $data['status'] ?? 'available'
        ]);
        $id = $this->conn->lastInsertId();

        // Update Stock
        $catModel = new Category();
        $catModel->updateStock($data['category_id']);

        return $id;
    }

    public function update($id, $data)
    {
        // Get current vehicle details to check for category change
        $sqlCurrent = "SELECT category_id FROM vehicles WHERE id = :id";
        $stmtCurrent = $this->conn->prepare($sqlCurrent);
        $stmtCurrent->execute([':id' => $id]);
        $current = $stmtCurrent->fetch();
        $oldCategoryId = $current ? $current['category_id'] : null;

        $fields = [];
        $params = [':id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, ['plate', 'category_id', 'wash_price', 'status'])) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value === '' ? null : $value;
            }
        }

        if (empty($fields))
            return false;

        $sql = "UPDATE vehicles SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $success = $stmt->execute($params);

        if ($success) {
            $catModel = new Category();
            // Update old category stock
            if ($oldCategoryId) {
                $catModel->updateStock($oldCategoryId);
            }
            // Update new category stock if it changed
            if (isset($data['category_id']) && $data['category_id'] != $oldCategoryId) {
                $catModel->updateStock($data['category_id']);
            }
        }

        return $success;
    }

    // Get future bookings for a specific vehicle to show in calendar
    public function getBookings($vehicleId)
    {
        // Include all relevant statuses for calendar display
        // Include all relevant statuses for calendar display
        $sql = "SELECT * 
                FROM bookings 
                WHERE vehicle_id = :vid 
                AND status IN ('confirmed', 'pending', 'verified', 'offline', 'maintenance', 'cancelled')
                ORDER BY start_date ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':vid' => $vehicleId]);
        return $stmt->fetchAll();
    }

    // Get the current status of a vehicle based on today's bookings
    public function getCurrentStatus($vehicleId)
    {
        $today = date('Y-m-d');

        // Check if there's an active maintenance block today
        $sql = "SELECT status FROM bookings 
                WHERE vehicle_id = :vid 
                AND :today BETWEEN DATE(start_date) AND DATE(end_date)
                AND status IN ('confirmed', 'pending', 'maintenance', 'offline')
                ORDER BY CASE 
                    WHEN status IN ('maintenance', 'offline') THEN 1 
                    ELSE 2 
                END
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':vid' => $vehicleId, ':today' => $today]);
        $result = $stmt->fetch();

        if ($result) {
            if ($result['status'] === 'maintenance' || $result['status'] === 'offline') {
                return 'maintenance';
            }
            return 'booked';
        }

        return 'available';
    }
    public function delete($id)
    {
        // Get category_id before deleting to update stock
        $sqlCurrent = "SELECT category_id FROM vehicles WHERE id = :id";
        $stmtCurrent = $this->conn->prepare($sqlCurrent);
        $stmtCurrent->execute([':id' => $id]);
        $current = $stmtCurrent->fetch();
        $categoryId = $current ? $current['category_id'] : null;

        $sql = "DELETE FROM vehicles WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $success = $stmt->execute([':id' => $id]);

        if ($success && $categoryId) {
            $catModel = new Category();
            $catModel->updateStock($categoryId);
        }

        return $success;
    }
}

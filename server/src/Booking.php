<?php
require_once __DIR__ . '/Database.php';

class Booking
{
    private $conn;

    public function __construct()
    {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function create($userId, $data)
    {
        try {
            $this->conn->beginTransaction();

            // Serialize bookings of the same category so two requests cannot take the
            // same vehicle (isVehicleAvailable reads without locking).
            $lockStmt = $this->conn->prepare("SELECT id FROM categories WHERE id = :cid FOR UPDATE");
            $lockStmt->execute([':cid' => $data['category_id']]);

            // Defaults for time
            $pickupTime = $data['pickup_time'] ?? '10:00';
            $dropoffTime = $data['dropoff_time'] ?? '10:00';

            // 1. Determine Vehicle Assignment
            $assignedVehicleId = null;

            if (!empty($data['force_vehicle_id'])) {
                // Admin Manual Booking: Force specific vehicle
                if ($this->isVehicleAvailable($data['force_vehicle_id'], $data['start_date'], $pickupTime, $data['end_date'], $dropoffTime)) {
                    $assignedVehicleId = $data['force_vehicle_id'];
                } else {
                    throw new Exception("El vehículo seleccionado no está disponible en estas fechas (verifique cruces de horario +2h).");
                }
            } else {
                // Standard Booking: Round Robin Logic

                // Get all active vehicles for this category
                $stmt = $this->conn->prepare("SELECT id, plate FROM vehicles WHERE category_id = :cid ORDER BY id ASC");
                $stmt->execute([':cid' => $data['category_id']]);
                $vehicles = $stmt->fetchAll();

                if (empty($vehicles)) {
                    throw new Exception("No active vehicles in this category.");
                }

                // Get last booked vehicle
                $stmtLast = $this->conn->prepare("SELECT vehicle_id FROM bookings WHERE category_id = :cid ORDER BY created_at DESC LIMIT 1");
                $stmtLast->execute([':cid' => $data['category_id']]);
                $lastVehicleId = $stmtLast->fetchColumn();

                $sortedVehicles = $vehicles;
                if ($lastVehicleId) {
                    $lastIndex = -1;
                    foreach ($vehicles as $i => $v) {
                        if ($v['id'] == $lastVehicleId) {
                            $lastIndex = $i;
                            break;
                        }
                    }

                    if ($lastIndex !== -1) {
                        $part1 = array_slice($vehicles, $lastIndex + 1);
                        $part2 = array_slice($vehicles, 0, $lastIndex + 1);
                        $sortedVehicles = array_merge($part1, $part2);
                    }
                }

                // Find first available vehicle
                foreach ($sortedVehicles as $vehicle) {
                    if ($this->isVehicleAvailable($vehicle['id'], $data['start_date'], $pickupTime, $data['end_date'], $dropoffTime)) {
                        $assignedVehicleId = $vehicle['id'];
                        break;
                    }
                }

                if (!$assignedVehicleId) {
                    throw new Exception("No vehicles available for these dates.");
                }
            }

            // Fetch wash price for the assigned vehicle
            $stmtV = $this->conn->prepare("SELECT wash_price FROM vehicles WHERE id = :vid");
            $stmtV->execute([':vid' => $assignedVehicleId]);
            $washRate = $stmtV->fetchColumn() ?: 0;

            // 4. Server-side pricing: total_price/daily_rate from the request are ignored
            $pricing = $this->calculatePrice($data, $washRate);
            $data['total_price'] = $pricing['total'];
            $data['daily_rate'] = $pricing['daily_rate'];
            $data['wash_rate'] = $pricing['wash'];

            // 5. Create Booking
            if (empty($data['code'])) {
                $data['code'] = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
            }

            // Map missing DB columns to notes field to avoid SQL errors
            $adminNotes = "";
            if (!empty($data['is_manual_admin_booking'])) {
                $adminNotes .= "[RESERVA MANUAL ADMINISTRATIVA]\n";
            }
            if (!empty($data['status'])) {
                $adminNotes .= "Estado: " . $data['status'] . "\n";
            }
            if (!empty($data['insurance_type'])) {
                $adminNotes .= "Seguro: " . $data['insurance_type'] . "\n";
            }
            
            $finalNotes = $adminNotes . ($data['notes'] ?? '');

            $sql = "INSERT INTO bookings (
                        user_id, category_id, vehicle_id, start_date, end_date, total_price, daily_rate, wash_rate, additional_costs,
                        pickup_location, dropoff_location, pickup_time, dropoff_time, 
                        customer_name, customer_email, customer_phone, customer_phone_code, 
                        customer_doc_type, customer_doc_number, customer_nationality, code, notes
                    ) VALUES (
                        :uid, :cid, :vid, :start, :end, :price, :daily_rate, :wash_rate, :additional_costs,
                        :pickup, :dropoff, :ptime, :dtime, 
                        :cname, :cemail, :cphone, :cphcode, 
                        :cdtype, :cdnum, :cnat, :code, :notes
                    )";

            // Prepare additional_costs as JSON string
            $additionalCosts = $data['additional_costs'] ?? null;
            if ($additionalCosts && !is_string($additionalCosts)) {
                $additionalCosts = json_encode($additionalCosts);
            }

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':uid' => $userId,
                ':cid' => $data['category_id'],
                ':vid' => $assignedVehicleId,
                ':start' => $data['start_date'],
                ':end' => $data['end_date'],
                ':price' => $data['total_price'] ?? 0,
                ':daily_rate' => $data['daily_rate'] ?? ($data['pricePerDay'] ?? null),
                ':wash_rate' => $data['wash_rate'] ?? ($data['washFee'] ?? $washRate),
                ':additional_costs' => $additionalCosts,
                ':pickup' => $data['pickup_location'] ?? '',
                ':dropoff' => $data['dropoff_location'] ?? '',
                ':ptime' => $pickupTime,
                ':dtime' => $dropoffTime,
                ':cname' => $data['customer_name'] ?? '',
                ':cemail' => $data['customer_email'] ?? '',
                ':cphone' => $data['customer_phone'] ?? '',
                ':cphcode' => $data['customer_phone_code'] ?? '',
                ':cdtype' => $data['customer_doc_type'] ?? '',
                ':cdnum' => $data['customer_doc_number'] ?? '',
                ':cnat' => $data['customer_nationality'] ?? '',
                ':code' => $data['code'],
                ':notes' => $finalNotes
            ]);
            $lastId = $this->conn->lastInsertId();

            $this->conn->commit();
            return $lastId;

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    /**
     * Single source of truth for money. Same rules as the browser
     * (src/services/booking.service.ts: calculateDays + calculateTotalValue) but
     * computed from the category row in the database, so a client cannot set the price.
     */
    public function calculatePrice($data, $washRate = null)
    {
        $start = new DateTime($data['start_date'] . ' ' . ($data['pickup_time'] ?? '10:00'));
        $end = new DateTime($data['end_date'] . ' ' . ($data['dropoff_time'] ?? '10:00'));

        $seconds = $end->getTimestamp() - $start->getTimestamp();
        $days = $seconds > 0 ? (int) ceil($seconds / 86400) : 1;
        if ($days < 1) {
            $days = 1;
        }

        $stmt = $this->conn->prepare("SELECT base_price, special_periods FROM categories WHERE id = :id");
        $stmt->execute([':id' => $data['category_id']]);
        $category = $stmt->fetch();
        if (!$category) {
            throw new Exception("Category not found.");
        }

        $basePrice = (float) ($category['base_price'] ?? 0);
        $periods = json_decode($category['special_periods'] ?? '[]', true);
        if (!is_array($periods)) {
            $periods = [];
        }

        // Special-season price per calendar day, like the browser does.
        $carTotal = 0.0;
        for ($i = 0; $i < $days; $i++) {
            $day = (clone $start)->modify("+$i day")->format('Y-m-d');
            $rate = $basePrice;

            foreach ($periods as $period) {
                if (!isset($period['price'])) {
                    continue;
                }
                if (!empty($period['dates']) && strpos($period['dates'], ' to ') !== false) {
                    list($from, $to) = explode(' to ', $period['dates'], 2);
                    if ($day >= trim($from) && $day <= trim($to)) {
                        $rate = (float) $period['price'];
                        break;
                    }
                } elseif (!empty($period['start']) && !empty($period['end'])) {
                    if ($day >= $period['start'] && $day <= $period['end']) {
                        $rate = (float) $period['price'];
                        break;
                    }
                }
            }

            $carTotal += $rate;
        }

        $total = $carTotal;

        // Full insurance is a flat 77.000 per day (same constant as the browser).
        if (($data['insurance_type'] ?? 'basic') === 'total') {
            $total += $days * 77000;
        }

        $wash = $washRate === null ? 0 : (float) $washRate;
        $total += $wash;

        // Dropoff in a different city.
        $pickupCity = $data['pickup_location'] ?? '';
        $dropCity = $data['dropoff_location'] ?? '';
        if ($pickupCity && $dropCity && $pickupCity !== $dropCity) {
            $cityFees = [
                'Cartagena' => 0,
                'Barranquilla' => 250000,
                'Santa Marta' => 350000,
                'Bogota' => 0,
                'Medellin' => 0,
                'Cali' => 0,
            ];
            $total += $cityFees[$dropCity] ?? 0;
        }

        return [
            'total' => round($total, 2),
            'daily_rate' => round($carTotal / $days, 2),
            'wash' => $wash,
            'days' => $days,
        ];
    }

    public function getById($id)
    {
        $sql = "SELECT b.*, c.name as category_name, v.plate 
                FROM bookings b 
                JOIN categories c ON b.category_id = c.id 
                LEFT JOIN vehicles v ON b.vehicle_id = v.id
                WHERE b.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    private function isVehicleAvailable($vehicleId, $startDate, $pickupTime, $endDate, $dropoffTime, $excludeBookingId = null)
    {
        // Calculate Requested Range with 2 Hour Buffer
        // We verify allowing a 2 hour gap between bookings.
        // Overlap Condition: 
        // (ExistingStart < NewEnd + 2h) AND (ExistingEnd > NewStart - 2h)
        // Note: NewStart = $startDate $pickupTime

        $sql = "SELECT COUNT(*) FROM bookings 
                WHERE vehicle_id = :vid 
                AND status IN ('confirmed', 'pending', 'maintenance')
                AND (
                    TIMESTAMP(start_date, IF(pickup_time = '' OR pickup_time IS NULL, '00:00:00', pickup_time)) < (TIMESTAMP(:end_dt, :end_tm) + INTERVAL 2 HOUR)
                    AND 
                    TIMESTAMP(end_date, IF(dropoff_time = '' OR dropoff_time IS NULL, '23:59:59', dropoff_time)) > (TIMESTAMP(:start_dt, :start_tm) - INTERVAL 2 HOUR)
                )";

        // When editing an existing booking, that same row must not count as a clash.
        if ($excludeBookingId) {
            $sql .= " AND id <> :exclude_id";
        }

        $stmt = $this->conn->prepare($sql);
        $params = [
            ':vid' => $vehicleId,
            ':start_dt' => $startDate,
            ':start_tm' => $pickupTime,
            ':end_dt' => $endDate,
            ':end_tm' => $dropoffTime
        ];
        if ($excludeBookingId) {
            $params[':exclude_id'] = $excludeBookingId;
        }
        $stmt->execute($params);
        return $stmt->fetchColumn() == 0;
    }

    public function getByUserId($userId)
    {
        $sql = "SELECT b.*, c.name as category_name, c.image_url 
                FROM bookings b 
                JOIN categories c ON b.category_id = c.id 
                WHERE b.user_id = :uid 
                ORDER BY b.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function getAll()
    {
        // LEFT JOIN on purpose: an INNER JOIN hid every booking whose user or
        // category row no longer exists, so the admin panel silently lost rows.
        $sql = "SELECT b.*, c.name as category_name, v.plate, u.email as user_email, u.name as user_name
                FROM bookings b
                LEFT JOIN categories c ON b.category_id = c.id
                LEFT JOIN vehicles v ON b.vehicle_id = v.id
                LEFT JOIN users u ON b.user_id = u.id";

        $sql .= " ORDER BY b.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getByCode($code)
    {
        // LEFT JOIN on purpose: the public ticket validator must still find a
        // booking whose user or category row was deleted later.
        $sql = "SELECT b.*, c.name as category_name, c.description as car_description, c.image_url, v.plate, c.name as car_model, c.transmission as car_class, 
                       u.name as customer_name, u.email as customer_email, u.phone as customer_phone 
                FROM bookings b 
                LEFT JOIN categories c ON b.category_id = c.id
                LEFT JOIN vehicles v ON b.vehicle_id = v.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.code = :code 
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':code' => $code]);
        return $stmt->fetch();
    }

    public function updateStatus($id, $status)
    {
        $sql = "UPDATE bookings SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }

    public function update($id, $data)
    {
        $booking = $this->getById($id);
        if (!$booking) {
            return false;
        }

        // Editing the dates or times was never re-checked against the other
        // bookings of the same vehicle, so an edit could create a double
        // booking. Reuse the create() lock + overlap check.
        $touchesSchedule = false;
        foreach (['start_date', 'end_date', 'pickup_time', 'dropoff_time'] as $key) {
            if (array_key_exists($key, $data)) {
                $touchesSchedule = true;
                break;
            }
        }

        $startDate = $data['start_date'] ?? $booking['start_date'] ?? '';
        $endDate = $data['end_date'] ?? $booking['end_date'] ?? '';
        $pickupTime = $data['pickup_time'] ?? $booking['pickup_time'] ?? '';
        $dropoffTime = $data['dropoff_time'] ?? $booking['dropoff_time'] ?? '';
        if ($pickupTime === '') {
            $pickupTime = '10:00';
        }
        if ($dropoffTime === '') {
            $dropoffTime = '10:00';
        }

        if (!$touchesSchedule || empty($booking['vehicle_id']) || $startDate === '' || $endDate === '') {
            return $this->applyUpdate($id, $data);
        }

        try {
            $this->conn->beginTransaction();

            // Same lock as create(): serialize the check against new bookings.
            $lockStmt = $this->conn->prepare("SELECT id FROM vehicles WHERE id = :vid FOR UPDATE");
            $lockStmt->execute([':vid' => $booking['vehicle_id']]);

            if (!$this->isVehicleAvailable($booking['vehicle_id'], $startDate, $pickupTime, $endDate, $dropoffTime, $id)) {
                throw new Exception("Las nuevas fechas se cruzan con otra reserva del mismo vehiculo.");
            }

            $result = $this->applyUpdate($id, $data);
            $this->conn->commit();
            return $result;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    private function applyUpdate($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        // Allowed fields to update
        $allowed = [
            'start_date',
            'end_date',
            'total_price',
            'pickup_location',
            'dropoff_location',
            'pickup_time',
            'dropoff_time',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_phone_code',
            'customer_doc_type',
            'customer_doc_number',
            'customer_nationality',
            'daily_rate',
            'notes',
            'category_id' // Added to allow vehicle changes
        ];

        foreach ($data as $key => $value) {
            // Support both internal field names
            if ($key === 'daily_rate' || $key === 'base_price' || $key === 'pricePerDay') {
                $fields[] = "daily_rate = :daily_rate";
                $params[':daily_rate'] = $value;
                continue;
            }
            if ($key === 'wash_rate' || $key === 'wash_price') {
                $fields[] = "wash_rate = :wash_rate";
                $params[':wash_rate'] = $value;
                continue;
            }
            if ($key === 'additional_costs') {
                $fields[] = "additional_costs = :additional_costs";
                // Store as JSON string
                $params[':additional_costs'] = is_string($value) ? $value : json_encode($value);
                continue;
            }
            if (in_array($key, $allowed)) {
                $fields[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE bookings SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($params);
    }

    public function createMaintenance($adminUserId, $vehicleId, $startDate, $endDate, $notes = '')
    {
        try {
            $this->conn->beginTransaction();

            // Lock the vehicle: the overlap check below must not race a new booking.
            $lockVehicle = $this->conn->prepare("SELECT id FROM vehicles WHERE id = :vid FOR UPDATE");
            $lockVehicle->execute([':vid' => $vehicleId]);

            // Refuse to block days that a customer already paid for.
            $stmtClash = $this->conn->prepare(
                "SELECT id, code
                 FROM bookings
                 WHERE vehicle_id = :vid
                   AND status IN ('confirmed', 'pending', 'active')
                   AND start_date <= :end
                   AND end_date >= :start
                 LIMIT 1"
            );
            $stmtClash->execute([':vid' => $vehicleId, ':start' => $startDate, ':end' => $endDate]);
            $clash = $stmtClash->fetch();
            if ($clash) {
                throw new Exception("No se puede bloquear: el vehiculo ya tiene la reserva {$clash['code']} en esas fechas.");
            }

            // Get category_id from vehicle (CRIT-04 FIX: prepared statement)
            $stmtCat = $this->conn->prepare("SELECT category_id FROM vehicles WHERE id = :vid");
            $stmtCat->execute([':vid' => $vehicleId]);
            $catId = $stmtCat->fetchColumn();

            // Get Admin Name
            $stmtAdmin = $this->conn->prepare("SELECT name FROM users WHERE id = :uid LIMIT 1");
            $stmtAdmin->execute([':uid' => $adminUserId]);
            $adminName = $stmtAdmin->fetchColumn() ?: 'Admin';
            $firstName = explode(' ', trim($adminName))[0];

            // Avoid double prefixes
            $prefix = "Mantenimiento / Ajuste de estado: ";
            $cleanNotes = trim($notes);
            $finalNotes = (stripos($cleanNotes, "Mantenimiento / Ajuste de estado") === 0) ? $cleanNotes : ($prefix . $cleanNotes);

            $sql = "INSERT INTO bookings (user_id, category_id, vehicle_id, start_date, end_date, total_price, status, pickup_location, dropoff_location, pickup_time, dropoff_time, notes, customer_name)
                    VALUES (:uid, :cid, :vid, :start, :end, 0, 'maintenance', 'TALLER/OFICINA', 'TALLER/OFICINA', '00:00:00', '23:59:59', :notes, :cname)";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':uid' => $adminUserId,
                ':cid' => $catId,
                ':vid' => $vehicleId,
                ':start' => $startDate,
                ':end' => $endDate,
                ':notes' => $finalNotes,
                ':cname' => $firstName
            ]);
            $bookingId = $this->conn->lastInsertId();

            // Check if currrent date is within range to update status immediately
            $today = date('Y-m-d');
            if ($today >= $startDate && $today <= $endDate) {
                // User requested: "se cambia el estado de disponible a mantemiento"
                $upd = $this->conn->prepare("UPDATE vehicles SET status = 'maintenance' WHERE id = :vid");
                $upd->execute([':vid' => $vehicleId]);
            }

            $this->conn->commit();
            return $bookingId;

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function createOverride($adminUserId, $vehicleId, $categoryId, $data)
    {
        try {
            $this->conn->beginTransaction();

            $status = $data['status'] ?? 'maintenance';

            // Current date/time (timezone already set globally in index.php)
            $now = date('Y-m-d');
            $nowTime = date('H:i:s');
            $nowForNote = date('d/m/Y');
            $nowTimeForNote = date('h:i A'); // 12-hour format for readability

            // SPECIAL HANDLING: Setting vehicle to "available"
            if ($status === 'available') {
                // 1. Release only the maintenance block that covers today.
                //    Deleting every maintenance row wiped the vehicle's history.
                $sqlDeleteMaint = "DELETE FROM bookings
                                   WHERE vehicle_id = :vid
                                   AND status = 'maintenance'
                                   AND start_date <= :today
                                   AND end_date >= :today";
                $stmtDelMaint = $this->conn->prepare($sqlDeleteMaint);
                $stmtDelMaint->execute([':vid' => $vehicleId, ':today' => $now]);

                // 2. Check if there's an active/confirmed booking that needs to be "interrupted"
                $sqlActiveBooking = "SELECT id, end_date, dropoff_time, notes 
                                     FROM bookings 
                                     WHERE vehicle_id = :vid 
                                     AND status IN ('confirmed', 'active', 'pending')
                                     AND start_date <= :today1
                                     AND end_date >= :today2
                                     LIMIT 1";
                $stmtActive = $this->conn->prepare($sqlActiveBooking);
                $stmtActive->execute([':vid' => $vehicleId, ':today1' => $now, ':today2' => $now]);
                $activeBooking = $stmtActive->fetch();

                if ($activeBooking) {
                    // Interrupt this booking: keep the contracted dates and record the
                    // early return in the note. Rewriting end_date used to destroy the
                    // only copy of the agreed drop-off (it survived as free text).
                    $originalEndDate = $activeBooking['end_date'];
                    $originalDropoffTime = $activeBooking['dropoff_time'] ?: '10:00:00';
                    $existingNotes = $activeBooking['notes'] ?? '';

                    // Format original dropoff time for display
                    $origTimeFormatted = date('h:i A', strtotime($originalDropoffTime));
                    $origDateFormatted = date('d/m/Y', strtotime($originalEndDate));

                    $interruptNote = "\n\n--- RESERVA INTERRUMPIDA ---\n";
                    $interruptNote .= "Entrega anticipada registrada: " . $nowForNote . " a las " . $nowTimeForNote . "\n";
                    $interruptNote .= "Fecha/hora contratada de devolución: " . $origDateFormatted . " a las " . $origTimeFormatted;

                    $newNotes = $existingNotes . $interruptNote;

                    // Cancelled rows do not occupy availability, so keeping the dates
                    // releases the vehicle without losing the contract data.
                    $sqlUpdateBooking = "UPDATE bookings
                                         SET status = 'cancelled', notes = :notes
                                         WHERE id = :bid";
                    $stmtUpdate = $this->conn->prepare($sqlUpdateBooking);

                    $stmtUpdate->execute([
                        ':notes' => $newNotes,
                        ':bid' => $activeBooking['id']
                    ]);
                }

                // Release the vehicle flag so the fleet view stops showing "taller".
                $updAvailable = $this->conn->prepare("UPDATE vehicles SET status = 'available' WHERE id = :vid");
                $updAvailable->execute([':vid' => $vehicleId]);

                $this->conn->commit();
                return 0; // No new booking created, just updated existing

            } else {
                // MAINTENANCE or other status: Original logic
                // Delete only non-customer bookings (maintenance, offline, available)
                // Replace the ones overlapping the new range; keep the rest of the history.
                $sqlDelete = "DELETE FROM bookings
                              WHERE vehicle_id = :vid
                              AND category_id = :cid
                              AND status IN ('maintenance', 'offline', 'available')
                              AND start_date <= :new_end
                              AND end_date >= :new_start";
                $stmtDel = $this->conn->prepare($sqlDelete);
                $stmtDel->execute([
                    ':vid' => $vehicleId,
                    ':cid' => $categoryId,
                    ':new_start' => $data['start_date'],
                    ':new_end' => $data['end_date']
                ]);

                // Get Admin Name
                $stmtAdmin = $this->conn->prepare("SELECT name FROM users WHERE id = :uid LIMIT 1");
                $stmtAdmin->execute([':uid' => $adminUserId]);
                $adminName = $stmtAdmin->fetchColumn() ?: 'Admin';
                $firstName = explode(' ', trim($adminName))[0];

                // Avoid double prefixes
                $prefix = "Mantenimiento / Ajuste de estado: ";
                $inputNotes = trim($data['notes'] ?? '');
                $finalNotes = (stripos($inputNotes, "Mantenimiento / Ajuste de estado") === 0) ? $inputNotes : ($prefix . $inputNotes);

                $sqlInsert = "INSERT INTO bookings (user_id, category_id, vehicle_id, start_date, end_date, total_price, status, notes, customer_name, pickup_location, dropoff_location)
                              VALUES (:uid, :cid, :vid, :start, :end, 0, :status, :notes, :cname, 'TALLER/OFICINA', 'TALLER/OFICINA')";

                $stmtIns = $this->conn->prepare($sqlInsert);
                $stmtIns->execute([
                    ':uid' => $adminUserId,
                    ':cid' => $categoryId,
                    ':vid' => $vehicleId,
                    ':start' => $data['start_date'],
                    ':end' => $data['end_date'],
                    ':status' => $status,
                    ':notes' => $finalNotes,
                    ':cname' => $firstName
                ]);
                $newId = $this->conn->lastInsertId();

                $this->conn->commit();
                return $newId;
            }

        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function getAvailability($startDate, $endDate, $pickupTime = '10:00', $dropoffTime = '10:00')
    {
        // 1. Get all categories and their vehicle count, including average wash_price
        $sql = "SELECT c.id, c.name, c.image_url, c.base_price, c.special_periods, c.description, c.passengers, c.luggage, c.transmission, 
                       COUNT(v.id) as total_units, COALESCE(AVG(v.wash_price), 35000) as wash_price
                FROM categories c
                LEFT JOIN vehicles v ON c.id = v.category_id
                WHERE c.status = 'active'
                GROUP BY c.id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $categories = $stmt->fetchAll();

        // 2. For each category, get how many units are occupied in this range (Time-Aware + 2h Buffer)
        // Overlap: (ExistingStart < NewEnd + 2h) AND (ExistingEnd > NewStart - 2h)
        // We use COALESCE/IFNULL to handle maintenance blocks that might lack specific times.
        $overlapSql = "SELECT category_id, COUNT(id) as occupied_units
                       FROM bookings
                       WHERE status IN ('confirmed', 'pending', 'maintenance')
                       AND (
                            TIMESTAMP(start_date, IFNULL(NULLIF(pickup_time, ''), '00:00:00')) < (TIMESTAMP(:end_dt, :end_tm) + INTERVAL 2 HOUR)
                            AND 
                            TIMESTAMP(end_date, IFNULL(NULLIF(dropoff_time, ''), '23:59:59')) > (TIMESTAMP(:start_dt, :start_tm) - INTERVAL 2 HOUR)
                       )
                       GROUP BY category_id";

        $stmt = $this->conn->prepare($overlapSql);
        $stmt->execute([
            ':start_dt' => $startDate,
            ':start_tm' => $pickupTime,
            ':end_dt' => $endDate,
            ':end_tm' => $dropoffTime
        ]);
        $occupied = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // [cat_id => count]

        $results = [];
        foreach ($categories as $cat) {
            $catId = $cat['id'];
            $occupiedCount = $occupied[$catId] ?? 0;
            $availableCount = max(0, $cat['total_units'] - $occupiedCount);

            $results[] = [
                'id' => (int) $catId,
                'name' => $cat['name'],
                'image_url' => $cat['image_url'],
                'base_price' => (float) $cat['base_price'],
                'wash_price' => (float) ($cat['wash_price'] ?? 35000),
                'special_periods' => json_decode($cat['special_periods'] ?? '[]'),

                // Specs
                'description' => $cat['description'] ?? '',
                'passengers' => $cat['passengers'] ?? 4,
                'luggage' => $cat['luggage'] ?? 2,
                'transmission' => $cat['transmission'] ?? 'Automática',

                'total' => (int) $cat['total_units'],
                'occupied' => (int) $occupiedCount,
                'available' => (int) $availableCount,
                'is_available' => $availableCount > 0
            ];
        }

        return $results;
    }
    public function delete($id)
    {
        $sql = "DELETE FROM bookings WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    public function cancel($id, $isUserAction = false)
    {
        // Get current booking details
        $sqlInfo = "SELECT * FROM bookings WHERE id = :id";
        $stmtInfo = $this->conn->prepare($sqlInfo);
        $stmtInfo->execute([':id' => $id]);
        $booking = $stmtInfo->fetch();

        if (!$booking) {
            return false;
        }

        $nowFormatted = date('d/m/Y h:i A');

        // Parse Dates safely
        $startStr = isset($booking['start_date']) ? date('d/m/Y', strtotime($booking['start_date'])) : 'Unknown';
        $pickupTimeStr = isset($booking['pickup_time']) ? date('h:i A', strtotime($booking['pickup_time'])) : '10:00 AM';

        $endStr = isset($booking['end_date']) ? date('d/m/Y', strtotime($booking['end_date'])) : 'Unknown';
        $dropoffTimeStr = isset($booking['dropoff_time']) ? date('h:i A', strtotime($booking['dropoff_time'])) : '10:00 AM';

        $noteHeader = $isUserAction ? "CANCELADA POR EL USUARIO" : "CANCELADA POR ADMINISTRADOR";

        $appendNotes = "\n\n--- $noteHeader ---\n";
        $appendNotes .= "Fecha de cancelación: $nowFormatted\n";
        $appendNotes .= "Recogida liberada.";

        $currentNotes = isset($booking['notes']) ? $booking['notes'] : '';
        $newNotes = $currentNotes . $appendNotes;

        // We PRESERVE the original start/end dates so they can be viewed in history.
        // The 'cancelled' status is sufficient to free up the slot in availability checks.
        $sqlUpdate = "UPDATE bookings 
                      SET status = 'cancelled', 
                          notes = :notes 
                      WHERE id = :id";

        $stmt = $this->conn->prepare($sqlUpdate);
        return $stmt->execute([
            ':notes' => $newNotes,
            ':id' => $id
        ]);
    }
}

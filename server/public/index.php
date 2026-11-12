<?php
ini_set('display_errors', 0);
ob_start();

// Set timezone to Colombia (Bogota) for all date/time operations
date_default_timezone_set('America/Bogota');

// Para debugging extremo si el catch no funciona:
// ini_set('display_errors', 1); error_reporting(E_ALL);
// Cargar dependencias
require_once __DIR__ . '/../src/Cors.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/User.php';
require_once __DIR__ . '/../src/Category.php'; // Formerly Vehicle.php
require_once __DIR__ . '/../src/Vehicle.php'; // Formerly VehicleInstance.php
require_once __DIR__ . '/../src/Booking.php';
require_once __DIR__ . '/../src/Auth.php';
require_once __DIR__ . '/../src/Mailer.php';
require_once __DIR__ . '/../src/RateLimiter.php';
require_once __DIR__ . '/../src/Marketing.php';

// Manejar CORS
handleCors();

// Respuesta JSON por defecto
header('Content-Type: application/json');

// Security Headers
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Router simple
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Detectar base path dinámicamente para soportar subcarpetas o root
$scriptName = $_SERVER['SCRIPT_NAME'];
$baseDir = dirname($scriptName);
// Normalizar slashes
$baseDir = str_replace('\\', '/', $baseDir);

// Asegurar que baseDir no interfiera si es root
if ($baseDir === '/')
    $baseDir = '';

if (strpos($requestUri, $baseDir) === 0) {
    $requestUri = substr($requestUri, strlen($baseDir));
}

// Fallback: Remove /index.php if it remains (for servers without .htaccess)
if (stripos($requestUri, '/index.php') === 0) {
    $requestUri = substr($requestUri, 10); // Length of '/index.php'
}

// Limpiar Query Parameters (?foo=bar)
if (($pos = strpos($requestUri, '?')) !== false) {
    $requestUri = substr($requestUri, 0, $pos);
}

// Asegurar que requestUri empiece con / y no termine con / (a menos que sea solo /)
if (empty($requestUri) || $requestUri[0] !== '/') {
    $requestUri = '/' . $requestUri;
}
if ($requestUri !== '/') {
    $requestUri = rtrim($requestUri, '/');
}

// Helper para obtener JSON input
function getJsonInput()
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Helper para enviar respuesta
function jsonResponse($data, $code = 200)
{
    if (ob_get_length())
        ob_clean();
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Helper para autenticación
function authenticate()
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $userModel = new User();
        $user = $userModel->findByToken($token);
        if ($user) {
            return $user;
        }
    }

    jsonResponse(['error' => 'Unauthorized'], 401);
}

function requireAuth()
{
    return authenticate();
}

function getUserSession()
{
    return authenticate();
}

function requireAdmin()
{
    $user = authenticate();
    if ($user['role'] !== 'admin') {
        jsonResponse(['error' => 'Forbidden'], 403);
    }
    return $user;
}

// LOGGING DEBUGGER
function logDebug($msg)
{
    $date = date('Y-m-d H:i:s');
    file_put_contents(__DIR__ . '/debug_log.txt', "[$date] $msg" . PHP_EOL, FILE_APPEND);
}

// Rutas
try {
    // 1. Auth: Registro
    if ($method === 'POST' && $requestUri === '/auth/register') {
        // INFO-02 FIX: Rate limiting en registro (10 intentos / 30 min por IP)
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $rateLimiter = new RateLimiter();
        if ($rateLimiter->isLimitReached($ip, 'register', 10, 1800)) {
            jsonResponse(['error' => 'Demasiados intentos de registro. Intenta de nuevo en 30 minutos.'], 429);
        }
        $rateLimiter->registerAttempt($ip, 'register');

        $input = getJsonInput();
        // MED-06 FIX: No loguear passwords — se sanitiza el input antes de escribir al log
        $safeInput = $input;
        if (isset($safeInput['password'])) $safeInput['password'] = '***REDACTED***';
        logDebug("Register attempt: " . json_encode($safeInput));

        if (empty($input['email']) || empty($input['password']) || empty($input['name'])) {
            logDebug("Register error: Missing fields");
            jsonResponse(['error' => 'Missing fields'], 400);
        }

        logDebug("Validating password strength...");
        $pwdCheck = Auth::validatePasswordStrength($input['password']);
        if ($pwdCheck !== true) {
            logDebug("Password weak: $pwdCheck");
            jsonResponse(['error' => $pwdCheck], 400);
        }

        $userModel = new User();
        try {
            logDebug("Creating user in DB...");
            $userId = $userModel->create(
                $input['name'],
                $input['email'],
                $input['password'],
                $input['phone'] ?? '',
                'user', // role
                $input['nationality'] ?? 'Colombia',
                $input['docType'] ?? 'CC',
                $input['docNumber'] ?? ''
            );

            // Auto-login: Generate Token
            $token = Auth::generateToken();
            $userModel->updateToken($userId, $token);

            // Fetch created user details (optional, or just construct from input)
            // But fetching ensures we have DB defaults if any
            $newUser = $userModel->findById($userId);
            // Note: findById might not return custom fields unless updated. Let's rely on standard find logic or refresh User model.
            // User::findById currently selects: id, name, email, phone, role, created_at. 
            // It might miss nationality/doc. Let's update User::findById if needed, OR just pass back what we have.
            // Actually, for the frontend state, passing back what we just saved is fine.

            logDebug("User created ID: $userId");
            jsonResponse([
                'message' => 'User created',
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'name' => $input['name'],
                    'email' => $input['email'],
                    'role' => 'user',
                    'phone' => $input['phone'] ?? '',
                    'nationality' => $input['nationality'] ?? 'Colombia',
                    'doc_type' => $input['docType'] ?? 'CC',
                    'doc_number' => $input['docNumber'] ?? ''
                ]
            ], 201);
        } catch (Exception $e) {
            logDebug("DB Error creating user: " . $e->getMessage());
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 2. Auth: Login
    if ($method === 'POST' && $requestUri === '/auth/login') {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $rateLimiter = new RateLimiter();

        if ($rateLimiter->isLimitReached($ip)) {
            jsonResponse(['error' => 'Demasiados intentos fallidos. Por favor, intenta de nuevo en 15 minutos.'], 429);
        }

        $input = getJsonInput();
        $userModel = new User();
        $user = $userModel->findByEmail($input['email'] ?? '');

        if ($user && Auth::verifyPassword($input['password'] ?? '', $user['password_hash'])) {
            $rateLimiter->resetAttempts($ip);
            $token = Auth::generateToken();
            $userModel->updateToken($user['id'], $token);

            jsonResponse([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'phone' => $user['phone'],
                    'nationality' => $user['nationality'],
                    'doc_type' => $user['doc_type'],
                    'doc_number' => $user['doc_number']
                ]
            ]);
        } else {
            $rateLimiter->registerAttempt($ip);
            jsonResponse(['error' => 'Credenciales inválidas'], 401);
        }
    }

    // 2b. Auth: Forgot Password
    if ($method === 'POST' && $requestUri === '/auth/forgot-password') {
        $input = getJsonInput();
        $email = $input['email'] ?? '';
        if (empty($email)) {
            jsonResponse(['error' => 'Email is required'], 400);
        }

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if ($user) {
            $token = Auth::generateToken(16); // 32 chars
            $userModel->setResetToken($email, $token);

            $mailer = new Mailer();
            $mailer->sendPasswordReset($email, $token);
        }

        // Always return success to prevent email enumeration
        jsonResponse(['message' => 'Si el correo está registrado, recibirás un enlace pronto.']);
    }

    // 2c. Auth: Reset Password
    if ($method === 'POST' && $requestUri === '/auth/reset-password') {
        $input = getJsonInput();
        $token = $input['token'] ?? '';
        $newPassword = $input['password'] ?? '';

        if (empty($token) || empty($newPassword)) {
            jsonResponse(['error' => 'Token and password are required'], 400);
        }

        $pwdCheck = Auth::validatePasswordStrength($newPassword);
        if ($pwdCheck !== true) {
            jsonResponse(['error' => $pwdCheck], 400);
        }

        $userModel = new User();
        $user = $userModel->findByResetToken($token);

        if ($user) {
            $hash = Auth::hashPassword($newPassword);
            $userModel->updatePassword($user['id'], $hash);
            jsonResponse(['message' => 'Contraseña actualizada con éxito']);
        } else {
            jsonResponse(['error' => 'Token inválido o expirado'], 400);
        }
    }

    // 3. Categories (Client: List)
    // NOTE: Client asks for '/vehicles' but we return Categories now.
    if ($method === 'GET' && ($requestUri === '/vehicles' || $requestUri === '/vehicles/')) {
        $catModel = new Category();
        $cats = $catModel->getAll(); // Active only
        jsonResponse($cats);
    }

    // 4. Categories (Client: Get One)
    if ($method === 'GET' && preg_match('#^/vehicles/(\d+)$#', $requestUri, $matches)) {
        $catId = $matches[1];
        $catModel = new Category();
        $cat = $catModel->getById($catId);

        if ($cat) {
            jsonResponse($cat);
        } else {
            jsonResponse(['error' => 'Category not found'], 404);
        }
    }

    // 5. Bookings: Create (Protected OR Guest w/ auto-register)
    if ($method === 'POST' && $requestUri === '/bookings') {
        // INFO-02 FIX: Rate limiting en creación de reservas (20 / hora por IP)
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $rlBooking = new RateLimiter();
        if ($rlBooking->isLimitReached($ip, 'booking', 20, 3600)) {
            jsonResponse(['error' => 'Demasiadas reservas desde esta IP. Intenta más tarde.'], 429);
        }
        $rlBooking->registerAttempt($ip, 'booking');

        $input = getJsonInput();
        $user = null;

        // 1. Check Auth Header first
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $userModel = new User();
            $user = $userModel->findByToken($matches[1]);
        }

        // 2. Validate strict requirements
        $catId = $input['category_id'] ?? $input['vehicle_id'] ?? null;
        if (empty($catId) || empty($input['start_date']) || empty($input['end_date'])) {
            $missing = [];
            if (empty($catId))
                $missing[] = 'category_id';
            if (empty($input['start_date']))
                $missing[] = 'start_date';
            if (empty($input['end_date']))
                $missing[] = 'end_date';
            jsonResponse(['error' => 'Missing booking details: ' . implode(', ', $missing)], 400);
        }

        $customer = $input['customerDetails'] ?? [];
        $email = $customer['email'] ?? '';

        if (empty($email)) {
            jsonResponse(['error' => 'Email is required'], 400);
        }

        // 3. User Resolution Logic
        $userModel = new User();
        $existingUser = $userModel->findByEmail($email);

        if ($user) {
            // Case A: User is logged in. 
            // Optional: Update their info if provided and missing
            // $userModel->update($user['id'], ...);
        } else {
            // Case B: Guest
            if ($existingUser) {
                // Email exists but not logged in -> Require Login
                jsonResponse(['error' => 'REQUIRE_LOGIN', 'message' => 'User exists'], 401);
            } else {
                // Create New User
                $name = $customer['fullName'] ?? 'Guest';
                $phone = ($customer['ddi'] ?? '') . ($customer['phone'] ?? '');
                // Generate a temporary password or assume managed flow
                $tempPass = bin2hex(random_bytes(8));

                try {
                    $userId = $userModel->create(
                        $name,
                        $email,
                        $tempPass,
                        $phone,
                        'user',
                        $customer['nationality'] ?? 'Colombia',
                        $customer['docType'] ?? 'CC',
                        $customer['docNumber'] ?? ''
                    );

                    $token = Auth::generateToken();
                    $userModel->updateToken($userId, $token);
                    $user = ['id' => $userId, 'token' => $token];
                    // Send email with credentials here in real app
                } catch (Exception $e) {
                    jsonResponse(['error' => "Error creating user: " . $e->getMessage()], 500);
                }
            }
        }

        $input['category_id'] = $catId;

        // Map frontend fields to DB fields
        $input['insurance_type'] = $input['insurance'] ?? 'basic';

        // Map pickup/dropoff times
        $input['pickup_time'] = $input['pickup_time'] ?? $input['pickup']['time'] ?? '10:00';
        $input['dropoff_time'] = $input['dropoff_time'] ?? $input['dropoff']['time'] ?? '10:00';

        // Map customer doc snapshot
        $input['customer_doc_type'] = $customer['docType'] ?? '';
        $input['customer_doc_number'] = $customer['docNumber'] ?? '';

        $bookingModel = new Booking();
        try {
            $bookingId = $bookingModel->create($user['id'], $input);

            // Send Confirmation Email
            try {
                $bookingDetails = $bookingModel->getById($bookingId);
                $mailer = new Mailer();

                // Always notify on public bookings; optional on manual dashboard bookings
                $isManual = !empty($input['is_manual_admin_booking']);

                if ($isManual) {
                    // For manual bookings, check the flags properly (handle bool, string, int)
                    $notifyAdmin = isset($input['notify_admin']) && filter_var($input['notify_admin'], FILTER_VALIDATE_BOOLEAN);
                    $notifyUser = isset($input['notify_user']) && filter_var($input['notify_user'], FILTER_VALIDATE_BOOLEAN);
                } else {
                    // Public bookings always notify both
                    $notifyAdmin = true;
                    $notifyUser = true;
                }

                $mailer->sendBookingConfirmation($bookingDetails, $email, [], $notifyAdmin, $notifyUser);
            } catch (Exception $mailEx) {
                // Log mail error but don't fail the booking response
                logDebug("Error sending booking email: " . $mailEx->getMessage());
            }

            jsonResponse([
                'message' => 'Booking confirmed',
                'id' => $bookingId,
                'user_token' => $user['token'] ?? null // Return token if new user
            ], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 6. Bookings: My History (Protected)
    if ($method === 'GET' && $requestUri === '/bookings/my-history') {
        $user = authenticate();
        $bookingModel = new Booking();
        $history = $bookingModel->getByUserId($user['id']);
        jsonResponse($history);
    }

    // 6a. Bookings: Check Availability (MUST be before generic :code route!)
    if ($method === 'GET' && $requestUri === '/bookings/availability') {
        $startDate = $_GET['start_date'] ?? '';
        $endDate = $_GET['end_date'] ?? '';
        $pickupTime = $_GET['pickup_time'] ?? '10:00';
        $dropoffTime = $_GET['dropoff_time'] ?? '10:00';

        if (empty($startDate) || empty($endDate)) {
            jsonResponse(['error' => 'Dates are required'], 400);
        }

        $bookingModel = new Booking();
        $availability = $bookingModel->getAvailability($startDate, $endDate, $pickupTime, $dropoffTime);
        jsonResponse($availability);
    }

    // Client: Cancel Booking
    if ($method === 'POST' && preg_match('#^/client/bookings/(\d+)/cancel$#', $requestUri, $matches)) {
        requireAuth();
        $user = getUserSession(); // Get logged in user
        $bookingId = $matches[1];
        $bookingModel = new Booking();

        // Verify ownership
        $booking = $bookingModel->getById($bookingId);
        if (!$booking || $booking['user_id'] != $user['id']) {
            jsonResponse(['error' => 'Unauthorized'], 403);
        }

        // Perform cancellation
        $success = $bookingModel->cancel($bookingId, true);
        jsonResponse(['success' => $success]);
    }

    // 6b. Bookings: Get by Code (Public wrapper for validator)
    // HIGH-03 FIX: Limitar datos expuestos + rate limiting
    if ($method === 'GET' && preg_match('#^/bookings/([a-zA-Z0-9]+)$#', $requestUri, $matches)) {
        // INFO-02 FIX: Rate limiting en lookup público (30 intentos / 15 min por IP)
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $rlLookup = new RateLimiter();
        if ($rlLookup->isLimitReached($ip, 'api_lookup', 30, 900)) {
            jsonResponse(['error' => 'Demasiadas consultas. Intenta de nuevo en 15 minutos.'], 429);
        }
        $rlLookup->registerAttempt($ip, 'api_lookup');

        $code = $matches[1];
        $bookingModel = new Booking();
        $booking = $bookingModel->getByCode($code);
        if ($booking) {
            // HIGH-03 FIX: Solo retornar campos necesarios para el validador público
            // NO exponer: teléfono completo, documento, email completo
            $safeBooking = [
                'code'             => $booking['code'] ?? '',
                'status'           => $booking['status'] ?? '',
                'start_date'       => $booking['start_date'] ?? '',
                'end_date'         => $booking['end_date'] ?? '',
                'pickup_location'  => $booking['pickup_location'] ?? '',
                'dropoff_location' => $booking['dropoff_location'] ?? '',
                'pickup_time'      => $booking['pickup_time'] ?? '',
                'dropoff_time'     => $booking['dropoff_time'] ?? '',
                'category_name'    => $booking['category_name'] ?? $booking['car_model'] ?? '',
                'car_description'  => $booking['car_description'] ?? '',
                'image_url'        => $booking['image_url'] ?? '',
                'plate'            => $booking['plate'] ?? '',
                'total_price'      => $booking['total_price'] ?? '',
                'daily_rate'       => $booking['daily_rate'] ?? '',
                // Nombre parcialmente enmascarado
                'customer_name'    => $booking['customer_name'] 
                    ? substr($booking['customer_name'], 0, 3) . str_repeat('*', max(0, strlen($booking['customer_name']) - 3))
                    : '',
                // Email parcialmente enmascarado (ej: br***@hotmail.com)
                'customer_email'   => $booking['customer_email']
                    ? preg_replace('/^(.{2})[^@]*(@.*)$/', '$1***$2', $booking['customer_email'])
                    : '',
            ];
            jsonResponse($safeBooking);
        } else {
            jsonResponse(['error' => 'Not found'], 404);
        }
    }

    // Client: Update Booking
    if ($method === 'POST' && preg_match('#^/client/bookings/(\d+)/update$#', $requestUri, $matches)) {
        requireAuth();
        $user = getUserSession();
        $bookingId = $matches[1];
        $bookingModel = new Booking();

        // Verify ownership
        $booking = $bookingModel->getById($bookingId);
        if (!$booking || $booking['user_id'] != $user['id']) {
            jsonResponse(['error' => 'Unauthorized'], 403);
        }

        $input = getJsonInput();
        try {
            $success = $bookingModel->update($bookingId, $input);
            jsonResponse(['success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 6c. Bookings: Send PDF Ticket (Called from Frontend)
    if ($method === 'POST' && $requestUri === '/bookings/send-ticket-email') {
        $input = getJsonInput();
        $code = $input['code'] ?? '';
        $pdfBase64 = $input['pdf'] ?? '';

        if (empty($code) || empty($pdfBase64)) {
            jsonResponse(['error' => 'Code and PDF data are required'], 400);
        }

        $bookingModel = new Booking();
        $booking = $bookingModel->getByCode($code);

        if (!$booking) {
            jsonResponse(['error' => 'Booking not found'], 404);
        }

        // Clean base64 if it has prefix (data:application/pdf;base64,...)
        if (strpos($pdfBase64, ',') !== false) {
            $pdfBase64 = explode(',', $pdfBase64)[1];
        }

        $pdfContent = base64_decode($pdfBase64);

        $attachments = [
            [
                'content' => $pdfContent,
                'name' => "Reserva-$code.pdf",
                'type' => 'application/pdf'
            ]
        ];

        $mailer = new Mailer();
        // Since this is the "official" ticket email, we can call the same confirmation method
        // which now supports attachments.
        $mailer->sendBookingConfirmation($booking, $booking['customer_email'], $attachments);

        jsonResponse(['message' => 'Email sent with attachment']);
    }

    // --- ADMIN ROUTES ---



    // 7. Admin: Get Bookings
    if ($method === 'GET' && $requestUri === '/admin/bookings') {
        requireAdmin();
        $bookingModel = new Booking();
        $bookings = $bookingModel->getAll();
        jsonResponse($bookings);
    }

    // 7b. Admin: Create Booking (Forced reservation by admin)
    if ($method === 'POST' && $requestUri === '/admin/bookings') {
        requireAdmin();
        $input = getJsonInput();

        // Validate required fields
        $vehicleId = $input['force_vehicle_id'] ?? $input['vehicle_id'] ?? null;
        $categoryId = $input['category_id'] ?? $vehicleId ?? null;

        if (empty($vehicleId) && empty($categoryId)) {
            jsonResponse(['error' => '400 Bad Request: Se requiere vehicle_id, force_vehicle_id o category_id'], 400);
        }

        if (empty($input['start_date']) || empty($input['end_date'])) {
            jsonResponse(['error' => '400 Bad Request: Las fechas (start_date, end_date) son requeridas'], 400);
        }

        // Customer validation (required for admin booking)
        $customerEmail = $input['customer_email'] ?? $input['customerDetails']['email'] ?? '';
        $customerName = $input['customer_name'] ?? $input['customerDetails']['fullName'] ?? 'Cliente Admin';

        if (empty($customerEmail)) {
            jsonResponse(['error' => '400 Bad Request: Email del cliente es requerido (customer_email)'], 400);
        }

        // Find or create user
        $userModel = new User();
        $user = $userModel->findByEmail($customerEmail);

        if (!$user) {
            // Create new user for this booking
            $phone = $input['customer_phone'] ?? $input['customerDetails']['phone'] ?? '';
            $ddi = $input['customer_phone_code'] ?? $input['customerDetails']['ddi'] ?? '';
            $tempPass = bin2hex(random_bytes(8));

            try {
                $userId = $userModel->create(
                    $customerName,
                    $customerEmail,
                    $tempPass,
                    $ddi . $phone,
                    'user',
                    $input['customer_nationality'] ?? 'Colombia',
                    $input['customer_doc_type'] ?? 'CC',
                    $input['customer_doc_number'] ?? ''
                );

                $token = Auth::generateToken();
                $userModel->updateToken($userId, $token);
                $user = ['id' => $userId, 'token' => $token];
            } catch (Exception $e) {
                jsonResponse(['error' => 'Error al crear usuario: ' . $e->getMessage()], 500);
            }
        } else {
            $user = ['id' => $user['id'], 'token' => null];
        }

        // Prepare booking input
        $bookingInput = [
            'category_id' => $categoryId,
            'force_vehicle_id' => $vehicleId,
            'start_date' => $input['start_date'],
            'end_date' => $input['end_date'],
            'pickup_time' => $input['pickup_time'] ?? '10:00',
            'dropoff_time' => $input['dropoff_time'] ?? '10:00',
            'pickup_location' => $input['pickup_location'] ?? 'Cartagena',
            'dropoff_location' => $input['dropoff_location'] ?? 'Cartagena',
            'total_price' => $input['total_price'] ?? 0,
            'daily_rate' => $input['daily_rate'] ?? 0,
            'wash_rate' => $input['wash_rate'] ?? 0,
            'insurance_type' => $input['insurance'] ?? 'basic',
            'customer_doc_type' => $input['customer_doc_type'] ?? '',
            'customer_doc_number' => $input['customer_doc_number'] ?? '',
            'status' => $input['status'] ?? 'confirmed',
            'is_manual_admin_booking' => true,
            'notes' => $input['notes'] ?? ''
        ];

        // Parse additional_costs if string
        if (!empty($input['additional_costs'])) {
            if (is_string($input['additional_costs'])) {
                $bookingInput['additional_costs'] = $input['additional_costs'];
            } else {
                $bookingInput['additional_costs'] = json_encode($input['additional_costs']);
            }
        }

        $bookingModel = new Booking();
        try {
            $bookingId = $bookingModel->create($user['id'], $bookingInput);

            // Send notifications if requested
            $notifyAdmin = !empty($input['notify_admin']);
            $notifyUser = !empty($input['notify_user']);

            if ($notifyAdmin || $notifyUser) {
                try {
                    $bookingDetails = $bookingModel->getById($bookingId);
                    $mailer = new Mailer();
                    $mailer->sendBookingConfirmation($bookingDetails, $customerEmail, [], $notifyAdmin, $notifyUser);
                } catch (Exception $mailEx) {
                    logDebug("Error sending booking email: " . $mailEx->getMessage());
                }
            }

            jsonResponse([
                'message' => 'Reserva creada exitosamente',
                'id' => $bookingId
            ], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => '400 Business Logic: ' . $e->getMessage()], 400);
        }
    }

    // 8. Admin: Validate/Update Booking
    if ($method === 'POST' && preg_match('#^/admin/bookings/(\d+)/status$#', $requestUri, $matches)) {
        requireAdmin();
        $input = getJsonInput();
        if (!in_array($input['status'], ['confirmed', 'cancelled', 'pending', 'completed'])) {
            jsonResponse(['error' => 'Invalid status'], 400);
        }
        $bookingModel = new Booking();
        $success = $bookingModel->updateStatus($matches[1], $input['status']);
        jsonResponse(['success' => $success]);
    }

    // 9. Admin: Categories (List all including inactive) - Mapped to /admin/vehicles for compatibility
    if ($method === 'GET' && $requestUri === '/admin/vehicles') {
        requireAdmin();
        $catModel = new Category();
        $cats = $catModel->getAll(true); // true = adminMode
        jsonResponse($cats);
    }

    // 9c. Admin: Delete Category
    if ($method === 'DELETE' && preg_match('#^/admin/vehicles/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $catModel = new Category();
        try {
            $success = $catModel->delete($matches[1]);
            jsonResponse(['success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 9b. Admin: Create Category (with image upload)
    if ($method === 'POST' && $requestUri === '/admin/vehicles') {
        requireAdmin();

        // Use $_POST for data instead of getJsonInput() because we're using FormData
        $data = $_POST;
        $file = $_FILES['image'] ?? null;

        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $allowedExtensions = ['webp'];
            $fileInfo = pathinfo($file['name']);
            $extension = strtolower($fileInfo['extension']);

            if (!in_array($extension, $allowedExtensions)) {
                jsonResponse(['error' => 'Solo se permiten archivos .webp'], 400);
            }

            $uploadDir = __DIR__ . '/uploads/vehicles/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileName = uniqid() . '.webp';
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // Save relative path for frontend compatibility
                $data['image_url'] = 'server/public/uploads/vehicles/' . $fileName;
            } else {
                jsonResponse(['error' => 'Error al mover el archivo subido'], 500);
            }
        }

        $catModel = new Category();
        try {
            $id = $catModel->create($data);
            jsonResponse(['message' => 'Category created', 'id' => $id, 'image_url' => $data['image_url'] ?? ''], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 10. Admin: Update Category
    if ($method === 'POST' && preg_match('#^/admin/vehicles/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $catId = $matches[1];

        // Check if FormData (multipart) is used
        $input = getJsonInput();
        if (empty($input) && (!empty($_POST) || !empty($_FILES))) {
            $input = $_POST;

            // Handle Image Upload if present
            $file = $_FILES['image'] ?? null;
            if ($file && $file['error'] === UPLOAD_ERR_OK) {
                $allowedExtensions = ['webp'];
                $fileInfo = pathinfo($file['name']);
                $extension = strtolower($fileInfo['extension']);

                if (!in_array($extension, $allowedExtensions)) {
                    jsonResponse(['error' => 'Solo se permiten archivos .webp'], 400);
                }

                $uploadDir = __DIR__ . '/uploads/vehicles/';
                // Ensure dir exists (re-using create logic logic essentially)
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                $fileName = uniqid() . '.webp';
                $targetPath = $uploadDir . $fileName;

                if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                    $input['image_url'] = 'server/public/uploads/vehicles/' . $fileName;
                }
            }

            // Handle special_periods JSON parsing if it came as string from FormData
            if (isset($input['special_periods']) && is_string($input['special_periods'])) {
                $decoded = json_decode($input['special_periods'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $input['special_periods'] = $decoded;
                }
            }
        }

        $catModel = new Category();
        $success = $catModel->update($catId, $input);
        jsonResponse(['success' => $success]);
    }

    // 11. Admin: Create Admin User
    if ($method === 'POST' && $requestUri === '/admin/users') {
        requireAdmin();
        $input = getJsonInput();
        if (empty($input['email']) || empty($input['password']) || empty($input['name'])) {
            jsonResponse(['error' => 'Missing fields'], 400);
        }

        // HIGH-05 FIX: Validar fortaleza de contraseña también para admin users
        $pwdCheck = Auth::validatePasswordStrength($input['password']);
        if ($pwdCheck !== true) {
            jsonResponse(['error' => $pwdCheck], 400);
        }

        $userModel = new User();
        try {
            $userId = $userModel->create($input['name'], $input['email'], $input['password'], $input['phone'] ?? '', 'admin');
            jsonResponse(['message' => 'Admin user created', 'id' => $userId], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 11a. Admin: Get All Users (with optional role filter)
    if ($method === 'GET' && $requestUri === '/admin/users') {
        requireAdmin();
        $role = $_GET['role'] ?? null;

        $userModel = new User();
        $users = $userModel->getAll($role);
        jsonResponse($users);
    }

    // 11b. Admin: Update User Role
    if ($method === 'POST' && preg_match('#^/admin/users/(\d+)/role$#', $requestUri, $matches)) {
        $admin = requireAdmin();
        $userId = $matches[1];
        $input = getJsonInput();

        if (empty($input['role'])) {
            jsonResponse(['error' => 'Role is required'], 400);
        }

        // Prevent admin from demoting themselves
        if ($userId == $admin['id'] && $input['role'] !== 'admin') {
            jsonResponse(['error' => 'No puedes quitarte el rol de administrador a ti mismo'], 403);
        }

        $userModel = new User();
        try {
            $success = $userModel->updateRole($userId, $input['role']);
            jsonResponse(['success' => $success, 'message' => 'Rol actualizado']);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 11c. Admin: Delete User
    if ($method === 'DELETE' && preg_match('#^/admin/users/(\d+)$#', $requestUri, $matches)) {
        $admin = requireAdmin();
        $userId = $matches[1];

        // Prevent admin from deleting themselves
        if ($userId == $admin['id']) {
            jsonResponse(['error' => 'No puedes eliminarte a ti mismo'], 403);
        }

        $userModel = new User();
        try {
            $success = $userModel->delete($userId);
            jsonResponse(['success' => $success, 'message' => 'Usuario eliminado']);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 12. Admin: Get Vehicles (Specific Instances) by Category - Enhanced with status
    if ($method === 'GET' && preg_match('#^/admin/vehicles/(\d+)/instances$#', $requestUri, $matches)) {
        requireAdmin();
        $vehModel = new Vehicle();
        $vehicles = $vehModel->getByCategoryId($matches[1]);

        // Enhance each vehicle with calculated status and stats
        $today = date('Y-m-d');
        $db = new Database();
        $conn = $db->getConnection();

        foreach ($vehicles as &$vehicle) {
            $vid = $vehicle['id'];

            // Get current status based on today's bookings
            $vehicle['current_status'] = $vehModel->getCurrentStatus($vid);

            // Calculate upcoming_count (total confirmed bookings, excluding maintenance)
            $stmtCount = $conn->prepare("SELECT COUNT(*) FROM bookings WHERE vehicle_id = :vid AND status IN ('confirmed', 'pending') AND end_date >= :today");
            $stmtCount->execute([':vid' => $vid, ':today' => $today]);
            $vehicle['upcoming_count'] = (int) $stmtCount->fetchColumn();

            // Calculate month_bookings_count (Bookings active in current month)
            $startOfMonth = date('Y-m-01');
            $endOfMonth = date('Y-m-t');
            $stmtMonth = $conn->prepare("SELECT COUNT(*) FROM bookings WHERE vehicle_id = :vid AND status IN ('confirmed', 'pending', 'completed', 'verified') AND (DATE(start_date) <= :eom AND DATE(end_date) >= :som)");
            $stmtMonth->execute([':vid' => $vid, ':eom' => $endOfMonth, ':som' => $startOfMonth]);
            $vehicle['month_bookings_count'] = (int) $stmtMonth->fetchColumn();

            // Calculate days_off (total maintenance/offline days)
            $stmtDays = $conn->prepare("SELECT SUM(DATEDIFF(end_date, start_date) + 1) FROM bookings WHERE vehicle_id = :vid AND status IN ('maintenance', 'offline')");
            $stmtDays->execute([':vid' => $vid]);
            $vehicle['days_off'] = (int) $stmtDays->fetchColumn();

            // Status label for display
            $statusLabels = [
                'available' => 'Disponible',
                'booked' => 'Reservado Hoy',
                'maintenance' => 'Mantenimiento'
            ];
            $vehicle['status_label'] = $statusLabels[$vehicle['current_status']] ?? 'Disponible';
        }

        jsonResponse($vehicles);
    }

    // 13. Admin: Create Vehicle Instance
    if ($method === 'POST' && $requestUri === '/admin/instances') {
        requireAdmin();
        $input = getJsonInput();
        // client sends vehicle_id (category) and identifier (plate)
        // Map vehicle_id -> category_id, identifier -> plate
        if (empty($input['vehicle_id']) || empty($input['identifier'])) {
            jsonResponse(['error' => 'Missing fields'], 400);
        }

        $data = [
            'category_id' => $input['vehicle_id'],
            'plate' => $input['identifier'],
            'status' => $input['status'] ?? 'available', // mapped from is_active?
            'wash_price' => $input['wash_price'] ?? 35000
        ];

        $vehModel = new Vehicle();
        try {
            $id = $vehModel->create($data);
            jsonResponse(['message' => 'Vehicle created', 'id' => $id], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 14. Admin: Get Vehicle Bookings (For Calendar)
    if ($method === 'GET' && preg_match('#^/admin/instances/(\d+)/bookings$#', $requestUri, $matches)) {
        requireAdmin();
        $vehicleId = $matches[1];
        logDebug("Getting bookings for vehicle ID: $vehicleId");

        $vehModel = new Vehicle();
        $bookings = $vehModel->getBookings($vehicleId);

        logDebug("Found " . count($bookings) . " bookings for vehicle $vehicleId");
        if (count($bookings) > 0) {
            logDebug("First booking: " . json_encode($bookings[0]));
        }

        jsonResponse($bookings);
    }

    // 14a. Admin: Get Single Booking
    if ($method === 'GET' && preg_match('#^/admin/bookings/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $bookingId = $matches[1];

        $bookingModel = new Booking();
        $booking = $bookingModel->getById($bookingId);
        if ($booking) {
            jsonResponse($booking);
        } else {
            jsonResponse(['error' => 'Booking not found'], 404);
        }
    }

    // 14b. Admin: Update Booking Details
    if ($method === 'POST' && preg_match('#^/admin/bookings/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $bookingId = $matches[1];
        $input = getJsonInput();

        $bookingModel = new Booking();
        try {
            $success = $bookingModel->update($bookingId, $input);

            // Re-send notifications if selected during update
            $notifyAdmin = !empty($input['notify_admin']) && $input['notify_admin'] === true;
            $notifyUser = !empty($input['notify_user']) && $input['notify_user'] === true;

            if ($notifyAdmin || $notifyUser) {
                $bookingDetails = $bookingModel->getById($bookingId);
                $mailer = new Mailer();
                $mailer->sendBookingConfirmation(
                    $bookingDetails,
                    $bookingDetails['customer_email'],
                    [],
                    $notifyAdmin,
                    $notifyUser
                );
            }

            jsonResponse(['success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 14c. Admin: Delete Booking
    if ($method === 'DELETE' && preg_match('#^/admin/bookings/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $bookingId = $matches[1];

        $bookingModel = new Booking();
        try {
            $success = $bookingModel->delete($bookingId);
            jsonResponse(['success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 15. Admin: Create Maintenance Block
    if ($method === 'POST' && preg_match('#^/admin/instances/(\d+)/maintenance$#', $requestUri, $matches)) {
        $admin = requireAdmin();
        $input = getJsonInput();
        if (empty($input['start_date']) || empty($input['end_date'])) {
            jsonResponse(['error' => 'Missing fields'], 400);
        }
        $bookingModel = new Booking();
        try {
            $id = $bookingModel->createMaintenance($admin['id'], $matches[1], $input['start_date'], $input['end_date'], $input['notes'] ?? '');
            jsonResponse(['message' => 'Block created', 'id' => $id], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 16. Admin: Override Instance Status (DELETE + INSERT)
    if ($method === 'POST' && preg_match('#^/admin/instances/(\d+)/override$#', $requestUri, $matches)) {
        $admin = requireAdmin();
        $input = getJsonInput();

        if (empty($input['category_id']) || empty($input['start_date']) || empty($input['end_date'])) {
            jsonResponse(['error' => 'Missing fields (category_id, start_date, end_date)'], 400);
        }

        $bookingModel = new Booking();
        try {
            $id = $bookingModel->createOverride($admin['id'], $matches[1], $input['category_id'], $input);
            jsonResponse(['message' => 'Override successful', 'id' => $id], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 17. Admin: Update Vehicle Instance (Costs/Details)
    // 17. Admin: Update Vehicle Instance (Costs/Details)
    if ($method === 'POST' && preg_match('#^/admin/instances/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $input = getJsonInput();
        $vehModel = new Vehicle();
        try {
            $success = $vehModel->update($matches[1], $input);
            jsonResponse(['success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 18. Admin: Delete Vehicle Instance
    if ($method === 'DELETE' && preg_match('#^/admin/instances/(\d+)$#', $requestUri, $matches)) {
        requireAdmin();
        $vehModel = new Vehicle();
        try {
            $success = $vehModel->delete($matches[1]);
            jsonResponse(['success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 20. Marketing: Subscribe
    if ($method === 'POST' && $requestUri === '/marketing/subscribe') {
        $input = getJsonInput();
        if (empty($input['email'])) {
            jsonResponse(['error' => 'Email is required'], 400);
        }

        $marketing = new Marketing();
        try {
            $success = $marketing->create(
                $input['name'] ?? '',
                $input['email'],
                $input['phone'] ?? ''
            );
            jsonResponse(['message' => 'Subscribed successfully', 'success' => $success]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }

    // 19. Admin: Setup Schema (Fix DB Structure)
    if ($method === 'POST' && $requestUri === '/admin/system/setup-schema') {
        requireAdmin();
        $db = new Database();
        $conn = $db->getConnection();
        $updates = [];

        try {
            // 1. Check & Add 'wash_price' to 'vehicles'
            $stmt = $conn->query("SHOW COLUMNS FROM vehicles LIKE 'wash_price'");
            if ($stmt->rowCount() == 0) {
                $conn->exec("ALTER TABLE vehicles ADD COLUMN wash_price DECIMAL(10,2) DEFAULT 0.00");
                $updates[] = "Added 'wash_price' to vehicles table";
            }

            // 3. Check & Add 'luggage' to 'categories'
            $stmt = $conn->query("SHOW COLUMNS FROM categories LIKE 'luggage'");
            if ($stmt->rowCount() == 0) {
                $conn->exec("ALTER TABLE categories ADD COLUMN luggage INT DEFAULT 2");
                $updates[] = "Added 'luggage' to categories table";
            }

            // 5. Check & Add 'daily_rate' to 'bookings'
            $stmt = $conn->query("SHOW COLUMNS FROM bookings LIKE 'daily_rate'");
            if ($stmt->rowCount() == 0) {
                $conn->exec("ALTER TABLE bookings ADD COLUMN daily_rate DECIMAL(15,2) DEFAULT NULL");
                $updates[] = "Added 'daily_rate' to bookings table";
            }

            // 6. Check & Add 'price_per_day' to 'vehicles' (Instance Override)
            $stmt = $conn->query("SHOW COLUMNS FROM vehicles LIKE 'price_per_day'");
            if ($stmt->rowCount() == 0) {
                $conn->exec("ALTER TABLE vehicles ADD COLUMN price_per_day DECIMAL(15,2) DEFAULT NULL");
                $updates[] = "Added 'price_per_day' to vehicles table";
            }

            // 8. Ensure 'transmission' is VARCHAR to avoid ENUM issues
            // We just run this blindly or check type. Running modify is generally safe if compatible.
            $conn->exec("ALTER TABLE categories MODIFY COLUMN transmission VARCHAR(50) DEFAULT 'Automática'");
            $updates[] = "Ensured 'transmission' is VARCHAR(50)";

            // 3. Create marketing_subscribers table
            $conn->exec("CREATE TABLE IF NOT EXISTS marketing_subscribers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
            $updates[] = "Checked/Created 'marketing_subscribers' table";

            // 4. Create contact_requests table
            $conn->exec("CREATE TABLE IF NOT EXISTS contact_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(50),
                email VARCHAR(100) NOT NULL,
                city VARCHAR(100),
                date DATE,
                time VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
            // 5. Sync Category Stocks
            $catModel = new Category();
            $catModel->syncAllStocks();
            $updates[] = "Synchronized all category stocks based on vehicle count";

            jsonResponse(['success' => true, 'updates' => $updates]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    // 21. Marketing: Contact Request (Promotional)
    if ($method === 'POST' && $requestUri === '/marketing/contact-request') {
        require_once __DIR__ . '/../src/ContactRequest.php';

        $input = getJsonInput();
        // Validation
        if (empty($input['email']) || empty($input['name'])) {
            jsonResponse(['error' => 'Name and Email are required'], 400);
        }

        $contact = new ContactRequest();
        try {
            $id = $contact->create($input);

            // Notify Admin
            $mailer = new Mailer();
            $mailer->sendContactRequestNotification($input);

            jsonResponse(['message' => 'Request sent', 'id' => $id]);
        } catch (Exception $e) {
            jsonResponse(['error' => $e->getMessage()], 400);
        }
    }


    // Root
    if ($requestUri === '/' || $requestUri === '') {
        // Opción A: Si es la raíz, servir la APP Angular
        // Opción B: Si quieres que la raíz sea solo API info, deja el jsonResponse.
        // Asumiendo que quieres que la web cargue:
        if (file_exists(__DIR__ . '/../../index.html')) {
            readfile(__DIR__ . '/../../index.html');
            exit;
        }
    }

    // 9.404 Not Found (Fallback - Debug Mode)
    // If no route matched above:
    // HIGH-02 FIX: Eliminado debug_info que exponía estructura del servidor
    jsonResponse(['error' => 'Not found'], 404);

} catch (Throwable $e) {
    // HIGH-01 FIX: Log completo internamente, pero NO exponer stack trace al cliente
    $msg = "FATAL ERROR: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine();
    if (function_exists('logDebug')) {
        logDebug($msg);
    } else {
        $date = date('Y-m-d H:i:s');
        @file_put_contents(__DIR__ . '/debug_log.txt', "[$date] $msg" . PHP_EOL, FILE_APPEND);
    }

    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    exit;
}

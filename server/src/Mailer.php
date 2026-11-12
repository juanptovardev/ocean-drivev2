<?php

class Mailer
{
    private $adminEmail;
    private $fromEmail;

    public function __construct()
    {
        $config = require __DIR__ . '/config.php';
        $this->adminEmail = $config['admin_email'] ?? 'juanpa.tovarh@gmail.com';
        $this->fromEmail = $config['from_email'] ?? 'noreply@oceandrivecarental.com';

        if (strpos($this->fromEmail, '@') === false) {
            $this->fromEmail = 'noreply@' . $this->fromEmail;
        }
    }

    private function log($msg)
    {
        $date = date('Y-m-d H:i:s');
        file_put_contents(__DIR__ . '/../public/debug_log.txt', "[$date] $msg" . PHP_EOL, FILE_APPEND);
    }

    private function send($to, $subject, $htmlMessage, $attachments = [])
    {
        $boundary = md5(time());
        $headers = "From: Ocean Drive <" . $this->fromEmail . ">\r\n";
        $headers .= "Reply-To: " . $this->fromEmail . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $body = "--" . $boundary . "\r\n";
        $body .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $htmlMessage . "\r\n\r\n";

        foreach ($attachments as $file) {
            if (empty($file['content']))
                continue;
            $content = chunk_split(base64_encode($file['content']));
            $body .= "--" . $boundary . "\r\n";
            $body .= "Content-Type: " . $file['type'] . "; name=\"" . $file['name'] . "\"\r\n";
            $body .= "Content-Disposition: attachment; filename=\"" . $file['name'] . "\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $body .= $content . "\r\n\r\n";
        }
        $body .= "--" . $boundary . "--";

        $result = mail($to, $subject, $body, $headers);
        $this->log("Email to: $to | Subject: $subject | Result: " . ($result ? 'SUCCESS' : 'FAILURE'));
        return $result;
    }

    public function sendBookingConfirmation($booking, $userEmail, $attachments = [], $notifyAdmin = false, $notifyUser = true)
    {
        if (!$booking)
            return false;

        // Variables comunes
        $code = $booking['code'];
        // Use customer_name from booking first (Manual/Guest), fallback to user_name (Registered)
        $customerName = !empty($booking['customer_name']) ? $booking['customer_name'] : ($booking['user_name'] ?? 'Cliente');
        $vehicle = $booking['category_name'] ?? 'Vehículo';
        $plate = $booking['plate'] ?? 'Pendiente';
        $total = number_format($booking['total_price'], 0, ',', '.');
        $startStr = date('d/m/Y', strtotime($booking['start_date'])) . " (" . $booking['pickup_time'] . ")";
        $endStr = date('d/m/Y', strtotime($booking['end_date'])) . " (" . $booking['dropoff_time'] . ")";
        $pickupLoc = $booking['pickup_location'];
        $dropoffLoc = $booking['dropoff_location'];
        $doc = ($booking['customer_doc_type'] ?? 'ID') . ": " . ($booking['customer_doc_number'] ?? '---');

        // Construct phone
        $phone = ($booking['customer_phone_code'] ?? '') . ' ' . ($booking['customer_phone'] ?? ($booking['user_phone'] ?? '---'));

        $status = strtoupper($booking['status'] ?? 'PENDIENTE');
        $reportTime = date('Y-m-d H:i:s');

        // --- 1. PLANTILLA PARA EL CLIENTE (PREMIUM / AMABLE) ---
        $htmlClient = "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;800&display=swap');
                body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Outfit', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #F8FAFC; padding-bottom: 40px; }
                .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Outfit', Helvetica, Arial, sans-serif; color: #334155; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.04); }
                .header { background: linear-gradient(135deg, #002B5B 0%, #0F172A 100%); padding: 50px 40px; text-align: center; position: relative; }
                .logo-container { margin-bottom: 20px; display: inline-block; padding: 10px; }
                .header-title { color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
                .header-subtitle { color: #94A3B8; font-size: 16px; margin-top: 10px; font-weight: 300; }
                
                .content-section { padding: 40px; }
                .greeting-text { font-size: 18px; color: #334155; line-height: 1.6; margin-bottom: 30px; text-align: center; }
                
                .booking-card { background-color: #F1F5F9; border-radius: 20px; padding: 0; overflow: hidden; margin-bottom: 30px; border: 1px solid #E2E8F0; }
                .booking-header { background-color: #E2E8F0; padding: 15px 30px; text-align: center; border-bottom: 1px solid #CBD5E1; }
                .booking-label { font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 2px; }
                .booking-code { font-size: 36px; font-weight: 900; color: #FF6F61; margin: 5px 0 0 0; letter-spacing: 2px; }
                
                .vehicle-info { padding: 30px; text-align: center; border-bottom: 1px dashed #CBD5E1; }
                .vehicle-name { font-size: 22px; font-weight: 800; color: #0F172A; text-transform: uppercase; margin: 0; }
                .vehicle-tag { display: inline-block; background: #DBEAFE; color: #1E40AF; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 8px; text-transform: uppercase; }

                .logistics-grid { width: 100%; border-spacing: 0; margin-top: 0; }
                .logistics-td { width: 50%; padding: 25px; vertical-align: top; }
                .logistics-col-left { border-right: 1px dashed #CBD5E1; }
                
                .logistics-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .logistics-date { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 4px 0; }
                .logistics-loc { font-size: 13px; color: #64748B; line-height: 1.4; margin: 0; }
                
                .price-section { background-color: #FFF7ED; border-radius: 16px; padding: 25px; text-align: center; border: 1px solid #FFEDD5; margin-bottom: 30px; }
                .price-label { font-size: 12px; color: #9A3412; font-weight: 600; margin-bottom: 5px; text-transform: uppercase; }
                .price-total { font-size: 28px; font-weight: 900; color: #C2410C; margin: 0; }

                .help-box { background-color: #ffffff; padding: 20px; border-radius: 16px; text-align: center; border: 1px solid #F1F5F9; margin-top: 20px; }
                .help-text { font-size: 13px; color: #64748B; margin-bottom: 15px; }
                .contact-btn { display: inline-block; background-color: #002B5B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 13px; }

                .footer { padding: 30px; text-align: center; font-size: 11px; color: #94A3B8; background-color: #F8FAFC; }
                .footer-links a { color: #64748B; text-decoration: none; margin: 0 8px; }
            </style>
        </head>
        <body>
            <div class='wrapper'>
                <table class='main-table' align='center'>
                    <!-- Header -->
                    <tr>
                        <td class='header'>
                            <div class='logo-container'>
                                <img src='https://oceandrivecarental.com/assets/imgs/logo/correo/LogotipoPositivo.png' width='180' alt='Ocean Drive'>
                            </div>
                            <h1 class='header-title'>¡Tu aventura comienza aquí!</h1>
                            <p class='header-subtitle'>Hola $customerName, tu reserva está confirmada</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class='content-section'>
                            <p class='greeting-text'>Gracias por elegirnos para tu viaje. Hemos preparado todo para que tu experiencia sea impecable. Aquí tienes el resumen de tu reserva confirmada.</p>
                            
                            <!-- Booking Card -->
                            <div class='booking-card'>
                                <div class='booking-header'>
                                    <span class='booking-label'>Código de Reserva</span>
                                    <p class='booking-code'>$code</p>
                                </div>
                                
                                <div class='vehicle-info'>
                                    <p class='vehicle-name'>$vehicle</p>
                                    <span class='vehicle-tag'>Confirmado</span>
                                </div>

                                <table class='logistics-grid'>
                                    <tr>
                                        <!-- Pickup -->
                                        <td class='logistics-td logistics-col-left'>
                                            <span class='logistics-label' style='color:#059669;'>● RECOGIDA</span>
                                            <p class='logistics-date'>$startStr</p>
                                            <p class='logistics-loc'>📍 $pickupLoc</p>
                                        </td>
                                        <!-- Dropoff -->
                                        <td class='logistics-td'>
                                            <span class='logistics-label' style='color:#EF4444;'>● DEVOLUCIÓN</span>
                                            <p class='logistics-date'>$endStr</p>
                                            <p class='logistics-loc'>📍 $dropoffLoc</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Payment Info -->
                            <div class='price-section'>
                                <p class='price-label'>Valor Total Estimado</p>
                                <p class='price-total'>COP $$total</p>
                            </div>

                            <!-- Help / CTA -->
                            <div class='help-box'>
                                <p class='help-text'>¿Tienes alguna pregunta o necesitas modificar tu viaje? Estamos aquí para ayudarte.</p>
                                <a href='https://wa.me/573017441319' class='contact-btn'>Contactar Soporte</a>
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class='footer'>
                            <p>&copy; " . date('Y') . " Ocean Drive Car Rental. Todos los derechos reservados.</p>
                            <p class='footer-links'>
                                <a href='https://oceandrivecarental.com'>Sitio Web</a> • 
                                <a href='https://oceandrivecarental.com/terminos'>Términos</a>
                            </p>
                            <p>Cartagena de Indias, Colombia</p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>";

        // --- 2. PLANTILLA PARA EL STAFF (OPERATIVA/ADMIN) ---
        $htmlAdmin = "
        <!DOCTYPE html><html><head><meta charset='utf-8'></head>
        <body style='margin:0;padding:0;background-color:#f1f5f9;font-family: Arial, sans-serif;'>
            <table width='100%' style='max-width:650px;margin:20px auto;background:#ffffff;border:1px solid #e2e8f0;'>
                <tr><td style='padding:20px;background:#002B5B;color:#fff;'>
                    <table width='100%'><tr>
                        <td style='font-size:14px;font-weight:bold;'>OCEAN DRIVE</td>
                        <td align='right' style='font-size:12px;font-weight:bold;letter-spacing:1px;'>NUEVA SOLICITUD INGRESADA</td>
                    </tr></table>
                </td></tr>
                <tr><td style='padding:30px;'>
                    <h2 style='margin:0 0 20px 0;color:#0f172a;font-size:18px;border-bottom:2px solid #f1f5f9;padding-bottom:10px;'>REPORTE DE RESERVA #$code</h2>
                    
                    <h3 style='font-size:11px;color:#64748B;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px;'>SECCIÓN 1: DATOS DEL CLIENTE</h3>
                    <table width='100%' style='background:#f8fafc;padding:15px;margin-bottom:25px;'>
                        <tr><td width='35%' style='font-size:12px;color:#64748B;'>Nombre:</td><td style='font-size:13px;font-weight:bold;'>$customerName</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Documento:</td><td style='font-size:13px;font-weight:bold;'>$doc</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Teléfono:</td><td style='font-size:13px;font-weight:bold;'><a href='tel:$phone' style='color:#002B5B;text-decoration:none;'>$phone</a></td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Email:</td><td style='font-size:13px;font-weight:bold;'>$userEmail</td></tr>
                    </table>

                    <h3 style='font-size:11px;color:#64748B;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px;'>SECCIÓN 2: LOGÍSTICA</h3>
                    <table width='100%' style='background:#f8fafc;padding:15px;margin-bottom:25px;'>
                        <tr><td width='35%' style='font-size:12px;color:#64748B;'>Recogida:</td><td style='font-size:13px;font-weight:bold;'>$startStr</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Lugar:</td><td style='font-size:13px;'>$pickupLoc</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;padding-top:10px;'>Entrega:</td><td style='font-size:13px;font-weight:bold;padding-top:10px;'>$endStr</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Lugar:</td><td style='font-size:13px;'>$dropoffLoc</td></tr>
                    </table>

                    <h3 style='font-size:11px;color:#64748B;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px;'>SECCIÓN 3: UNIDAD Y FINANZAS</h3>
                    <table width='100%' style='background:#f8fafc;padding:15px;margin-bottom:30px;'>
                        <tr><td width='35%' style='font-size:12px;color:#64748B;'>Vehículo/Cat:</td><td style='font-size:13px;font-weight:bold;'>$vehicle</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Placa Asignada:</td><td style='font-size:13px;color:#FF6F61;font-weight:bold;'>$plate</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>VALOR TOTAL:</td><td style='font-size:16px;color:#002B5B;font-weight:900;'>COP \$$total</td></tr>
                        <tr><td style='font-size:12px;color:#64748B;'>Estado Sistema:</td><td style='font-size:11px;'><span style='background:#e2e8f0;padding:2px 6px;border-radius:4px;'>$status</span></td></tr>
                    </table>

                    <div style='text-align:center;'>
                        <a href='https://oceandrivecarental.com/admin' style='background:#002B5B;color:#fff;padding:15px 30px;text-decoration:none;font-weight:bold;font-size:13px;border-radius:5px;display:inline-block;'>IR AL PANEL DE ADMINISTRACIÓN</a>
                    </div>
                </td></tr>
                <tr><td style='padding:15px;background:#f8fafc;text-align:center;font-size:10px;color:#94a3b8;'>
                    Reporte automático generado el $reportTime. Ocean Drive Monitoring System.
                </td></tr>
            </table>
        </body></html>";

        // Enviar a Cliente
        if ($notifyUser) {
            $this->send($userEmail, "¡Todo listo! Tu reserva #$code ha sido confirmada", $htmlClient, $attachments);
        }

        // Enviar a Staff
        if ($notifyAdmin) {
            $subjectAdmin = "[NUEVA RESERVA] #$code - $customerName - $vehicle";
            $this->send($this->adminEmail, $subjectAdmin, $htmlAdmin, $attachments);
        }
    }

    public function sendPasswordReset($email, $token)
    {
        $resetUrl = "https://oceandrivecarental.com/login?token=" . $token;
        $html = "<h2>Recuperar Acceso</h2><p>Haz clic para restablecer:</p><a href='$resetUrl'>Restablecer Contraseña</a>";
        return $this->send($email, "Recuperación de Acceso - Ocean Drive", $html);
    }

    // Strip CR/LF and control chars so user text cannot inject mail headers.
    private function headerSafe($value)
    {
        return trim(preg_replace('/[\r\n\t\x00]+/', ' ', (string) $value));
    }

    public function sendMarketingNotification($name, $email, $phone)
    {
        $date = date('d/m/Y - h:i A');
        $name = $this->headerSafe($name);
        $subject = "💎 Nuevo Lead: Interesado en Descuentos - $name";

        // Clean phone for whatsapp link (remove non-digits ideally, but ltrim + helps)
        $waPhone = preg_replace('/[^0-9]/', '', $phone);

        $html = "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
                body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Outfit', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #F8FAFC; padding-bottom: 40px; }
                .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
                
                /* Header */
                .header { background: linear-gradient(135deg, #002B5B 0%, #0F172A 100%); padding: 60px 40px; text-align: center; position: relative; }
                .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 10px; background: linear-gradient(to right, #FF6F61, #FF8F84); }
                .header-icon { font-size: 48px; margin-bottom: 15px; display: block; animation: float 3s ease-in-out infinite; }
                .header-title { color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 1px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
                .header-subtitle { color: #FF6F61; font-size: 13px; margin-top: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; background: rgba(255,255,255,0.1); display: inline-block; padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(5px); }

                /* Content */
                .content-section { padding: 40px; }
                .intro-text { font-size: 16px; color: #475569; line-height: 1.6; text-align: center; margin-bottom: 35px; }
                
                /* Profile Card */
                .profile-card { background-color: #F8FAFC; border-radius: 20px; padding: 0; border: 1px solid #E2E8F0; text-align: left; overflow: hidden; }
                .data-row { padding: 20px 25px; border-bottom: 1px solid #E2E8F0; display: table; width: 100%; box-sizing: border-box; transition: background 0.3s; }
                .data-row:hover { background-color: #F1F5F9; }
                .data-row:last-child { border-bottom: none; }
                
                .data-icon { display: table-cell; width: 30px; vertical-align: middle; font-size: 20px; padding-right: 15px; color: #64748B; }
                .data-content { display: table-cell; vertical-align: middle; }
                
                .data-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; display: block; }
                .data-value { font-size: 16px; font-weight: 600; color: #0F172A; display: block; text-decoration: none; word-break: break-all; }
                .highlight { color: #002B5B; }
                
                /* Actions */
                .action-area { margin-top: 40px; text-align: center; }
                .btn { display: inline-block; padding: 18px 36px; background-color: #002B5B; color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 14px; letter-spacing: 1px; transition: all 0.3s; box-shadow: 0 10px 25px rgba(0, 43, 91, 0.25); border: 1px solid rgba(255,255,255,0.1); }
                .btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0, 43, 91, 0.35); background-color: #003670; }
                .btn-secondary { display: block; margin-top: 15px; color: #64748B; text-decoration: none; font-size: 12px; font-weight: 600; }

                /* Footer */
                .footer { background-color: #F8FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0; }
                .footer-text { font-size: 11px; color: #94A3B8; font-weight: 500; font-style: italic; }
                .timestamp { display: inline-block; padding: 6px 16px; background-color: #E2E8F0; border-radius: 20px; color: #64748B; font-size: 10px; font-weight: 700; margin-top: 15px; letter-spacing: 0.5px; }

            </style>
        </head>
        <body>
            <div class='wrapper'>
                <table class='main-table' align='center'>
                    <tr>
                        <td class='header'>
                            <span class='header-icon'>💎</span>
                            <h1 class='header-title'>Nuevo Lead VIP</h1>
                            <p class='header-subtitle'>Interesado en Descuentos</p>
                        </td>
                    </tr>
                    <tr>
                        <td class='content-section'>
                            <p class='intro-text'>¡Excelente noticia! Un nuevo usuario se ha registrado en nuestra base de datos buscando <b>beneficios exclusivos</b>. Conecta ahora para cerrar una reserva.</p>
                            
                            <div class='profile-card'>
                                <div class='data-row'>
                                    <div class='data-icon'>👤</div>
                                    <div class='data-content'>
                                        <span class='data-label'>Nombre del Interesado</span>
                                        <span class='data-value'>$name</span>
                                    </div>
                                </div>
                                <div class='data-row'>
                                    <div class='data-icon'>aaa</div>
                                    <div class='data-content'>
                                        <span class='data-label'>Correo Electrónico</span>
                                        <a href='mailto:$email' class='data-value highlight'>$email</a>
                                    </div>
                                </div>
                                <div class='data-row'>
                                    <div class='data-icon'>📱</div>
                                    <div class='data-content'>
                                        <span class='data-label'>WhatsApp / Teléfono</span>
                                        <a href='https://wa.me/$waPhone' class='data-value highlight'>$phone</a>
                                    </div>
                                </div>
                            </div>

                            <div class='action-area'>
                                <a href='mailto:$email?subject=¡Bienvenido a Ocean Drive! Aquí tienes tu descuento exclusivo' class='btn'>ENVIAR OFERTA AHORA</a>
                                <a href='https://wa.me/$waPhone' class='btn-secondary'>O contactar por WhatsApp</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class='footer'>
                            <p class='footer-text'>Ocean Drive Marketing Intelligence System</p>
                            <span class='timestamp'>Recibido: $date</span>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
        ";

        return $this->send($this->adminEmail, $subject, $html);
    }

    public function sendContactRequestNotification($data)
    {
        $date = date('d/m/Y - h:i A');
        $name = $this->headerSafe($data['name']);
        $subject = "🚀 Solicitud de Acompañamiento - $name";
        $waPhone = preg_replace('/[^0-9]/', '', $data['phone'] ?? '');

        // Concept Idea Design for Accompaniment
        $html = "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
                body { margin: 0; padding: 0; background-color: #1E293B; font-family: 'Outfit', sans-serif; }
                .main-table { background: #ffffff; max-width: 600px; margin: 30px auto; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .header-bg { background: linear-gradient(135deg, #FF6F61 0%, #D94636 100%); padding: 50px 30px; text-align: center; color: white; }
                .profile-pic { width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto -40px auto; display: flex; align-items: center; justify-content: center; font-size: 35px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); position: relative; z-index: 10; }
                .content { padding: 50px 40px 30px 40px; background: white; text-align: center; }
                
                .tag { background: #F1F5F9; color: #475569; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; }
                .title { font-size: 24px; font-weight: 800; color: #1E293B; margin: 0 0 10px 0; line-height: 1.2; }
                .subtitle { font-size: 14px; color: #64748B; margin: 0 0 30px 0; }
                
                .info-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 30px; }
                .info-cell { display: table-cell; width: 50%; background: #F8FAFC; padding: 15px; border-radius: 12px; text-align: left; vertical-align: top; }
                .info-label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px; }
                .info-val { font-size: 15px; font-weight: 600; color: #334155; }
                
                .cta-btn { background: #0F172A; color: white; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2); transition: transform 0.2s; }
                .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(15, 23, 42, 0.3); }

                .footer { background: #F1F5F9; padding: 20px; text-align: center; color: #94A3B8; font-size: 11px; }
            </style>
        </head>
        <body>
            <table width='100%' class='main-table' align='center' cellpadding='0' cellspacing='0'>
                <tr>
                    <td class='header-bg'>
                        <div style='font-size: 12px; font-weight: 700; opacity: 0.8; letter-spacing: 2px; text-transform: uppercase;'>Nueva Solicitud</div>
                        <h1 style='font-size: 28px; font-weight: 900; margin: 5px 0 0 0;'>Planner Request</h1>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class='profile-pic'>🚀</div>
                        <div class='content'>
                            <span class='tag'>Prioridad Alta</span>
                            <h2 class='title'>$name necesita acompañamiento</h2>
                            <p class='subtitle'>El cliente ha solicitado asistencia personalizada para su viaje en <strong>{$data['city']}</strong>.</p>
                            
                            <div class='info-grid'>
                                <div class='info-cell'>
                                    <span class='info-label'>Fecha Estimada</span>
                                    <div class='info-val'>📅 {$data['date']}</div>
                                    <div class='info-val' style='font-size: 12px; color: #64748B; margin-top:2px;'>⏰ {$data['time']}</div>
                                </div>
                                <div class='info-cell'>
                                    <span class='info-label'>Destino</span>
                                    <div class='info-val'>📍 {$data['city']}</div>
                                </div>
                            </div>

                            <div class='info-grid' style='margin-top: -20px;'>
                                <div class='info-cell' style='width: 100%;'>
                                    <span class='info-label'>Contacto</span>
                                    <div class='info-val' style='margin-bottom: 5px;'>📧 {$data['email']}</div>
                                    <div class='info-val'>📱 <a href='https://wa.me/$waPhone' style='color:#FF6F61;text-decoration:none;'>{$data['phone']}</a></div>
                                </div>
                            </div>

                            <a href='https://wa.me/$waPhone?text=Hola $name, recibimos tu solicitud de acompañamiento en Ocean Drive. ¿Cómo podemos ayudarte?' class='cta-btn'>INICIAR ASESORÍA POR WHATSAPP</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class='footer'>
                        Recibido el $date • Ocean Drive Concept System
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";

        return $this->send($this->adminEmail, $subject, $html);
    }
}

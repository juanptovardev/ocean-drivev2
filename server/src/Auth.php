<?php

class Auth
{
    // Hashear contraseña (Algo seguro: BCRYPT o ARGON2)
    public static function hashPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    // Verificar contraseña
    public static function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }

    // Generar un token aleatorio simple (para sesiones/cookies)
    public static function generateToken($length = 32)
    {
        return bin2hex(random_bytes($length));
    }

    public static function validatePasswordStrength($password)
    {
        if (strlen($password) < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return "La contraseña debe contener al menos una letra mayúscula.";
        }
        if (!preg_match('/[a-z]/', $password)) {
            return "La contraseña debe contener al menos una letra minúscula.";
        }
        if (!preg_match('/[0-9]/', $password)) {
            return "La contraseña debe contener al menos un número.";
        }
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            return "La contraseña debe contener al menos un carácter especial (!@#$%^&*...).";
        }
        return true;
    }
}

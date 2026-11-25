# Ocean Drive

**Versión:** 1.1.0
SPA de alquiler de vehículos para el Caribe colombiano, con API PHP y base de datos MySQL.

## Stack

- Angular 19, TypeScript y Tailwind CSS 3.4
- API REST en PHP 8.2 (`server/public/index.php`)
- MySQL/MariaDB mediante PDO

## Requisitos

- Node.js 20 y npm
- PHP 8.2 con PDO MySQL para ejecutar el backend
- MySQL o MariaDB

## Desarrollo

```bash
git clone https://github.com/juanptovardev/ocean-drivev2.git
cd ocean-drivev2
npm ci
npm start
```

La SPA queda en `http://localhost:4200`. **El proxy de desarrollo apunta a la API de producción** (`proxy.conf.json`). No uses datos de producción para probar escrituras. Para ejecutar el backend local, configura `.env` y `server/src/config.php` desde `server/src/config.example.php`; inicia PHP con `npm run server:dev` y ajusta el proxy al servidor local antes de probar la integración.

## Comandos

| Comando | Uso |
|---|---|
| `npm start` | Servidor Angular con proxy |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run build:prod` | Build Angular de producción |
| `npm run server:dev` | Servidor PHP local en el puerto 8000 |
| `php -l <archivo.php>` | Validar sintaxis de un archivo PHP |

`npm test` todavía no ejecuta una suite: es un stub. La CI ejecuta `npm ci`, `npm run typecheck`, `npm run build:prod` y lint de sintaxis PHP.

## Configuración local del backend

```bash
cp .env.example .env
cp server/src/config.example.php server/src/config.php
```

Completa las variables de base de datos en `.env`. No subas `.env`, `server/src/config.php` ni credenciales.

## Estructura principal

- `src/`: SPA Angular (rutas, páginas, componentes y servicios)
- `server/public/`: front controller y reglas Apache
- `server/src/`: modelos y configuración PHP
- `public/`: archivos estáticos copiados al build Angular

## Seguridad

Reporta vulnerabilidades de forma privada al mantenedor. No incluyas secretos, datos de clientes ni material de `_no_publicar/` en issues o pull requests.

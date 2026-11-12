# AGENTS.md — Ocean Drive v2

Alquiler de vehículos (Caribe colombiano): SPA **Angular 19** (`src/`) + API **PHP 8.2** monolítica (`server/`) sobre MySQL. Sin monorepo: un solo `package.json` en la raíz.

## Comandos (verificados localmente)

```bash
npm install                # local (ver nota de lockfile abajo)
npm start                  # ng serve :4200 con proxy (ver Gotchas)
npm run typecheck          # tsc --noEmit
npm run build:prod         # ng build --configuration production → dist/ocean-drive-rent
npm run server:dev         # php -S 0.0.0.0:8000 -t server/public (backend local)
php -l server/src/Database.php   # lint PHP manual (CI hace find sobre todo server/)
```

**Orden de verificación (lo que exige CI, `.github/workflows/ci.yml`):**
1. `npm run typecheck`
2. `npm run build:prod` (falla si se pasa de presupuestos de bundle)
3. PHP: `find server -name "*.php" -exec php -l {} \;`

**No hay test runner.** `npm test` es un stub (`echo ... && exit 0`) — no confíes en que "los tests pasaron".

## Gotchas (leer antes de tocar nada)

- **El dev server habla con la API de PRODUCCIÓN.** `proxy.conf.json` manda `/api` y `/server` a `https://oceandrivecarental.com`, y `ApiService.getApiUrl()` (src/services/api.service.ts) devuelve `/api` solo si el puerto es 4200. `npm start` NO usa `server:dev`. Para probar el backend local hay que cambiar el `target` del proxy.
- **Modo demo silencioso.** Login `admin` (o `admin@oceandrive.com`, `demo`, `administrador`) con pass `1234` fija `DEMO_TOKEN` y TODOS los métodos de `ApiService` devuelven mocks (sin tocar la BD). Además muchos métodos hacen `catchError(() => of([]))`: un endpoint roto puede parecer "vacío, sin errores". Si algo "no guarda/no carga", descarta demo mode y el `catchError` antes de culpar al backend.
- **Sesión de 2 h.** El token caduca por `loginTime` en localStorage (`TOKEN_EXPIRATION_MS`); logout forzado con redirección a `/login`.
- **`server/src/config.php` NO está en el repo** (gitignorado por credenciales) pero `Database.php` y `Mailer.php` lo hacen `require` directo: sin él, el backend muere con fatal. Clone limpio → `cp server/src/config.example.php server/src/config.php` (plantilla trackeada; lee `['host','dbname','charset','user','password','admin_email','from_email']` de `<repo>/.env`). Plantilla de variables: `.env.example` → `.env`.
- **`package-lock.json` está en `.gitignore` y sin trackear, pero CI ejecuta `npm ci`** (que exige lockfile). Si tocas dependencias, considera commitear el lockfile o el CI fallará.
- **Router PHP = un solo `server/public/index.php`** con cadenas de `if` en orden. El orden importa (p. ej. `/bookings/availability` debe ir ANTES de `/bookings/:code`, si no, se traga como código). Respuestas vía `jsonResponse()` (hace `exit`).
- **Z horaria fija**: `date_default_timezone_set('America/Bogota')` en `index.php` y `SET time_zone = '-05:00'` en PDO — la lógica de fechas de reservas la asume.
- **`tsc --noEmit` no valida templates Angular**; eso lo hace `build:prod` (`strictTemplates: true`). Corre ambos.
- **Presupuestos de build prod**: estilos por componente máx 4 KB (warn) / 8 KB (error) — CSS de componentes grandes rompe el build.
- **Tailwind es v3.4** (`tailwind.config.js` + `package.json`); el README dice "v4" — miente. El CSS global está en `src/styles.css`.
- **`_no_publicar/` está gitignorado**: material privado (pentest, scanners, datos de clientes). Jamás commitear ni copiar de ahí al código del producto. Igual `.env`, `server/src/config.php` y `debug_log.txt`.

## Convenciones del repo (CONTRIBUTING.md, verificadas)

- Componentes **standalone + `ChangeDetectionStrategy.OnPush`** (default del scaffolder en `angular.json`); estado de UI con **Signals** antes que suscripciones RxJS.
- **TypeScript estricto** (`strict`, `strictTemplates`, `noPropertyAccessFromIndexSignature`) — castear/safe-access con cuidado.
- Commits **Conventional Commits** (`feat:`/`fix:`/`docs:`/...). Ramas: `feat/<nombre>`, `fix/<nombre>`, `refactor/<nombre>`.
- Ramas: `main` = producción protegida; integración en `develop`/`ocean` (CI dispara en `main, master, develop, ocean`).
- Backend: PDO con prepared statements obligatorio; sanitizar inputs en capa de servicio.
- Subida de imágenes de vehículos: **solo `.webp`** (validado en `index.php`).

## Mandatory AI Stack (GLOBAL, no exceptions)

4 capas obligatorias EN TODA SESIÓN, activas en `~/.config/opencode/opencode.json`
(`plugin: ["context-mode"]` + `mcp.headroom`); regla completa en
`~/.config/opencode/AGENTS.md` → "Mandatory AI Stack — GLOBAL":

1. **Ponytail** — escalera YAGNI antes de escribir código (repo → stdlib → plataforma →
   dependencia instalada → 1 línea → mínimo que funcione + 1 test si hay bucle/parseo/dinero).
   Revisiones: `/ponytail-review`, `/ponytail-audit`. Regla del 80%: reutilizar > reescribir.
2. **anti-slop** — modo `during` global (`%APPDATA%\antislop\settings.json`); al cerrar trabajo
   UI/copy, reportar su Delivery Gate PASS/FAIL. Él filtra; la dirección visual la dan
   `DESIGN.md` / `CONSISTENCIA_VISUAL.md` — nunca compiten.
3. **context-mode** — Think-in-Code MANDATORIO: `ctx_execute` / `ctx_batch_execute` / `ctx_search`
   para análisis. `curl`/fetch inline BLOQUEADO (`ctx_fetch_and_index`). Artefactos → ARCHIVOS.
4. **headroom** — MCP `headroom_retrieve`. `headroom wrap` PROHIBIDO (reescribe base URL → 401
   con providers custom kiosapi/nusa/unorouter/nectere/nvidia).

Salud: `context-mode doctor` (PASS) · `headroom --version` (0.41.0+) ·
`%APPDATA%\antislop\settings.json` = `during`. Incumplir cualquiera de las 4 = STOP y escalar.

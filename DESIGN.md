# DESIGN.md — Ocean Drive (sistema visual real, medido del código)

> Generado el 2026-11-12 por extracción mecánica sobre `src/` + `index.html` (79 archivos, 1.651.786 caracteres).
> No hay `PRODUCT.md`: este archivo documenta **lo que existe**, no una intención de marca.
> Cualquier valor aquí está respaldado por conteo real; si un número no aparece, no se inventó.

## 1. Paleta observada (48 hex distintos)

| Rol | Hex | Usos | Nota |
|---|---|---|---|
| Marca primaria (navy) | `#002b5b` | 394 | color dominante del producto |
| Acento (coral) | `#ff6f61` | 308 | CTAs y destacados |
| Navy claro | `#1a3f6f` | 32 | variante de superficies |
| Navy profundo | `#003875` | 10 | hover/estados |
| Azul hielo | `#b3e5ff` | 39 | fondos suaves |
| Coral claro | `#ff8a75` | 13 | hover del acento |
| Blanco roto | `#fbfbfd` | 9 | superficie base |
| Fondo frío | `#f7f9fc` | 7 | secciones alternas |
| Slate (bordes/texto) | `#cbd5e1` / `#e2e8f0` / `#94a3b8` | 8 / 8 / 7 | grises funcionales |
| Oscuro | `#0f1420` / `#050914` | 6 / 4 | usados en 2 archivos |
| Terceros (no marca) | `#25d366` (WhatsApp) / `#e1306c` (Instagram) | 9 / 5 | iconos sociales, no tokens |

Regla: los 3 primeros son el sistema. Todo hex nuevo fuera de esta tabla es deuda.

## 2. Tipografía (3 familias, sin sistema)

- **Poppins** — cargada en `index.html:158`; familia de marca.
- **Inter** — `comentarios.component.ts:77` (2 usos).
- **Open Sans** — `faq.component.html:12` (12 usos).
- 19 usos de `font-display` repartidos en 4 archivos; 0 usos de `font-variant-numeric: tabular-nums` (problema en columnas de precio).
- Escala implícita por utilidades Tailwind (`text-xs`…`text-6xl`), sin tokens declarados.

Decisión pendiente: una sola familia de UI (Poppins para display + una sans para texto) o declarar el trio como intencional.

## 3. Forma y profundidad (medido)

- Radios: `rounded-full` 273 · `rounded-xl` 252 · `rounded-lg` 163 · `rounded-2xl` 85 · `rounded-md` 46 · `rounded-3xl` 5 · `rounded-sm` 2.
  → Escala permitida: `xl` (default de tarjeta), `lg` (controles), `full` (pills/avatares). `2xl/3xl` solo en hero.
- Sombras: `shadow-sm` 134 · `2xl` 78 · `lg` 67 · `xl` 66 · `md` 21 · `inner` 4.
  → Escala permitida: `sm` (reposo), `lg` (hover), `2xl` (overlay). `xl` y `md` son ruido a consolidar.
- Gradientes: 78 `bg-gradient-to-*`; 10 textos con `bg-clip-text` (`confirmation:35`, `login:57`).
- `backdrop-blur`: 86 usos en 27 archivos → no es excepción, es el default: consolidar a un solo nivel.
- Bordes de color laterales (`border-l-4`/`border-r-*`): 33 usos en 14 archivos.

## 4. Breakpoints reales (mobile-first)

`md:` 327 · `lg:` 109 · `sm:` 24 · `xl:` 7 · `2xl:` 15.
→ El sistema es **md-first**: diseñar en 375 px, validar en 768 px, cerrar en 1024 px. `xl` casi no se usa.
49 anchos fijos `w-[NNNpx]`/`min-w-[NNNpx]` en 16 archivos son la principal fuente de rotura; 0 usos de `dvh` con 3 `100vh`.

## 5. Movimiento

- 298 usos de `animate-*` en 40 archivos; 13 `animate-bounce`; 18 `animate-spin`.
- 364 `transition-all` (Tailwind) → prohibido como default: declarar propiedad.
- `transition: all` real en `src/styles.css:539` y `politicas.component.ts:270`; `transition: width, height` en `styles.css:905`.
- **0** `prefers-reduced-motion` en todo el repo.
- Regla: animar solo `transform`/`opacity`, interrumpible, y con alternativa intencional bajo reduced-motion (no kill global de `0.01ms`).

## 6. Foco y teclado

- 1 solo `focus-visible` (`src/styles.css:865`) frente a 123 `outline-none`.
- 62 botones icon-only sin `aria-label` ni `title`.
- 0 `aria-live`, 0 `aria-hidden`, 0 `touch-action`, 0 handlers `touch*`, 0 skip link, 0 `role` fuera de `styles.css:538,544`.
- 214 `(click)` sobre `<div>`/`<span>` en 21 archivos.
- Regla: `outline-none` solo con reemplazo `focus-visible:ring-*`; acción = `<button>`; navegación = `[routerLink]`.

## 7. Formularios y dinero

- 26 `required`, 37 `type="email|tel|number|date"`, 58 `[disabled]`.
- **0** `autocomplete`, **0** `label for`/`htmlFor`, **0** `spellcheck`, **0** aviso de cambios sin guardar (`beforeunload`/`CanDeactivate`) pese a que el estado de reserva vive en `localStorage` (`booking.service.ts:52-91`).
- 64 `alert(` para errores; 0 `aria-live` para anunciarlos.
- Precios: sin `tabular-nums`; el total se calcula **solo en el navegador** (`booking.service.ts:241-310`) y el servidor acepta `total_price` del request.

## 8. Iconografía e imágenes

- 46 `<img>`, 32 con `alt` ⇒ **14 sin alt** (`profile:41`, `brand-slider:21,27,37,41,51,55,65,69`, `comentarios:46`, `contact-promo:227`, `vehicles.component.html:50`, `vehicles3.html:60`, `vehicles4.html:61`).
- 1 solo `loading="lazy"` (`location-map:26`).
- Iconos por SVG inline y, en varios sitios, por emoji.
- `index.html`: 0 favicon, 0 `meta description`, 0 `og:`/`twitter:`.

## 9. Convenciones de implementación (no negociables)

1. Componentes **standalone** + `ChangeDetectionStrategy.OnPush`; estado de UI con **Signals**.
2. Sin hex literales nuevos: usar la paleta de §1.
3. Sin familias nuevas: §2.
4. Sin `transition: all` ni `transition-all` en código nuevo.
5. Todo control interactivo con foco visible y nombre accesible.
6. Todo error de formulario: inline + `aria-live` + foco al primer campo inválido.
7. Precio mostrado con `tabular-nums` y calculado/validado en servidor.

## 10. Deuda declarada (fuera de este documento)

- `darkMode: 'class'` en `tailwind.config.js` con solo 11 usos `dark:` en 2 archivos, `theme.extend.colors` vacío y `prefers-color-scheme` únicamente en `index.html:112,131` → decidir: completar o eliminar.
- 919 hex literales + 84 `rgb()/rgba()` en 46 archivos; 0 variables CSS reales (las 13 existentes viven en `src/services/prueba.html`, archivo sin referencias).
- `src/services/prueba.html` y `run_migration.php` son residuos sin uso verificado.
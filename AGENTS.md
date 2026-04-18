# AGENTS.md - Ocean Drive Car Rental

## Descripción del Proyecto
Aplicación SPA Angular 19+ (Zoneless) con Tailwind CSS para alquiler de vehículos en el Caribe Colombiano.

## Comandos Esenciales

### Instalación y Desarrollo
```bash
# Instalar dependencias y verificar
npm install
ng version

# Servidores de desarrollo
npm start              # localhost:4200
npm run network        # red accesible (0.0.0.0)

# Build
npm run build         # producción
npm run watch         # desarrollo continuo
```

### Testing y Verificación
```bash
# Tests
npm test              # todos los tests
ng test --watch       # modo watch
ng test --include=src/app/pages/home/home.component.spec.ts  # test específico
ng test --code-coverage  # con cobertura

# Type checking y builds
npx tsc --noEmit      # verificar tipos
ng build --dry-run    # verificar builds sin ejecutar
```

### Angular CLI
```bash
ng generate component componentes/nombre-componente
ng generate service servicios/nuevo-servicio
ng generate page pages/nueva-pagina
```

## Arquitectura
```
src/
├── app/              # Componentes reutilizables
├── pages/            # Páginas (home, admin, booking, etc.)
├── components/       # Componentes standalone
├── services/         # Servicios inyectables
├── guards/           # Guards de rutas
├── interceptors/     # HTTP interceptors
└── data/             # Datos estáticos
```

## Convenciones de Código

### Componentes Angular
- **SIEMPRE** usar `standalone: true` con `ChangeDetectionStrategy.OnPush`
- Usar `inject()` en lugar de constructor para dependencias
- Imports explícitos en `imports: []` siguiendo orden:
  1. Angular core (`@angular/core`)
  2. Angular common (`@angular/common`, `@angular/router`, `@angular/forms`)
  3. Bibliotecas de terceros (`rxjs`)
  4. Imports del proyecto (`services/`, `components/`, `pages/`)

### Signals
- Preferir `signal()` para estado mutable, `computed()` para valores derivados
- Evitar mutaciones directas sobre `.value`, usar `.set()`, `.update()`

### Nomenclatura
| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos componente | kebab-case | `header.component.ts` |
| Clases componente | PascalCase | `HeaderComponent` |
| Servicios | PascalCase + suffix | `ApiService`, `BookingService` |
| Interfaces/Tipos | PascalCase | `NavItem`, `UserData` |
| Variables/Métodos | camelCase | `isActive`, `userName`, `getData()` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Selectores | kebab-case | `app-header`, `app-vehicles` |

### Imports y TypeScript
- Orden: Angular core → Angular common → terceros → proyecto
- `strict: true` habilitado: tipos explícitos, evitar `any`
- Usar `?.` y `??` para null safety

### Templates
- Nueva sintaxis Angular 17+: `@if`, `@for`, `@switch`
- Tailwind CSS para estilos (clases utilitarias)
- Preferir `[routerLink]` sobre `(click)` + router.navigate()

### Servicios
- `@Injectable({ providedIn: 'root' })` para servicios globales
- Métodos tipados con valores de retorno explícitos
- Manejo de errores con try/catch y logging

### Rutas
- Lazy loading para páginas pesadas
- Guards para rutas protegidas (auth, admin)
- Proxy para desarrollo: `proxy.conf.json`

## Workflow para Agentes

### Antes de Comenzar
1. **SIEMPRE** ejecutar `npm install` si `node_modules` no existe o si `package.json` cambió
2. Verificar tests actuales con `npm test`
3. Revisar lint de tipos con `npx tsc --noEmit`

### Durante Desarrollo
1. Usar `npm run watch` para builds incrementales
2. Mantener servidor local con `npm start` para preview
3. Ejecutar tests específicos durante desarrollo

### Antes de Finalizar
1. Ejecutar todos los tests: `npm test`
2. Verificar build de producción: `npm run build`
3. Correr type checking: `npx tsc --noEmit`

## Configuración Crítica

### angular.json
- Prefijo de componente: `app`
- Cambio de detección: OnPush (auto-configurado)
- Budgets: 4kb warning, 8kb error para estilos de componente

### tsconfig.json
- Target: ES2022, Module: ES2022
- Strict mode habilitado
- Strict templates habilitado

### Proxy
- `proxy.conf.json` para desarrollo (evita CORS)
- Variables de entorno para URLs de API

## Documentación y Planes

### Reglas de Planes
- **SIEMPRE** redactar planes en **ESPAÑOL**
- **SIEMPRE** exportar a carpeta `/planes`
- Formato: `XXX-nombre-descriptivo.md` (ej: `001-fix-login.md`)
- Contenido:
  1. Descripción del problema/objetivo
  2. Cambios propuestos (Frontend y Backend)
  3. Plan de verificación manual y automatizada

## Errores Comunes que Evitar
1. No usar `standalone: true` en componentes
2. Usar constructor en lugar de `inject()`
3. Mutar directamente `.value` en signals
4. Usar sintaxis antigua `*ngIf`, `*ngFor`
5. No ejecutar tests antes de finalizar
6. No verificar tipos con `npx tsc --noEmit`

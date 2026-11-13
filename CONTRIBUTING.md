# Contribución a Ocean Drive Car Rental

Gracias por tu interés en contribuir a **Ocean Drive Car Rental**. Para mantener la calidad, estabilidad y seguridad en un entorno de nivel empresarial, solicitamos a todos los colaboradores seguir estas pautas.

---

## 1. Flujo de Trabajo Git (Branching Strategy)

- **`main`**: Rama protegida de producción. Todo código aquí debe estar listo para despliegue y haber pasado CI.
- **`develop` / `ocean`**: Ramas de integración activa.
- **`feat/<nombre-de-la-feature>`**: Nuevas funcionalidades (ej. `feat/dynamic-pricing`).
- **`fix/<nombre-del-bug>`**: Corrección de errores (ej. `fix/calendar-timezone`).
- **`refactor/<nombre>`**: Mejoras de código o refactorización sin cambios en comportamiento.

---

## 2. Convención de Commits (Conventional Commits)

Utilizamos el estándar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva característica para el usuario o sistema
- `fix:` Corrección de un bug
- `docs:` Cambios exclusivamente en documentación
- `style:` Formato, espacios, punto y coma (sin cambios en la lógica)
- `refactor:` Refactorización de código que no arregla un bug ni agrega una funcionalidad
- `perf:` Mejora de rendimiento
- `test:` Adición o corrección de pruebas
- `chore:` Tareas de mantenimiento, dependencias o configuración del repositorio

**Ejemplo:**
```bash
git commit -m "feat(booking): add date range validation in reservation form"
```

---

## 3. Checklist Pre-Commit / Pre-PR Obligatorio

Antes de solicitar revisión o hacer push a ramas compartidas, ejecuta localmente:

1. **Verificación de Tipos TypeScript:**
   ```bash
   npm run typecheck
   ```
   *(Debe finalizar con código de salida 0 sin advertencias de tipos)*

2. **Compilación de Producción:**
   ```bash
   npm run build:prod
   ```
   *(Debe compilar todos los bundles sin errores de presupuesto ni resolución de módulos)*

3. **Revisión de Seguridad:**
   - Asegúrate de no incluir claves, tokens o cadenas de conexión en el código.
   - Verifica que `.env` permanezca excluido por `.gitignore`.
   - Utiliza `.env.example` para documentar cualquier nueva variable de entorno requerida.

---

## 4. Estándares de Código

- **Angular 19+ Standalone Components**: Todo nuevo componente debe ser Standalone con `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Signals Reactivos**: Prioriza el uso de Angular Signals (`signal`, `computed`, `effect`) sobre suscripciones manuales de RxJS cuando se maneje estado de UI.
- **Backend PHP 8.2+**: Usa sentencias preparadas (PDO) obligatoriamente. Valida y sanitiza inputs en capa de servicio y controladores.

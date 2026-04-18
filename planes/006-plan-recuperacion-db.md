# Plan de Recuperación y Alternativas de Base de Datos

Ante la pérdida de acceso al hosting y a la base de datos actual de **Ocean Drive**, este plan propone dos alternativas principales para restaurar el sistema utilizando el código fuente que aún conservas localmente.

## User Review Required

> [!IMPORTANT]
> **Pérdida de Datos**: Dado que perdiste el acceso a la base de datos, los datos históricos (reservas pasadas, usuarios registrados) se perderán a menos que tengas un respaldo (SQL dump). Este plan se enfoca en restaurar la **funcionalidad** y la **estructura** para que el negocio siga operando.

> [!WARNING]
> Necesitarás un nuevo proveedor de hosting (ej. Hostinger, SiteGround, o un VPS) si decides seguir con la arquitectura PHP actual.

## Propuestas de Solución

### Alternativa 1: Re-despliegue en un nuevo Hosting PHP (Recomendado para rapidez)
Dado que ya tienes el código del backend en la carpeta `/server`, solo necesitamos reconstruir la estructura de la base de datos en un nuevo servidor MySQL.

#### [NEW] [schema_completo.sql](file:///c:/Users/juanp_8h8f07l/OneDrive/Desktop/ocean-drivev2/planes/006-reconstruccion-db.md)
Crearé un script SQL exhaustivo basado en tus modelos PHP (`User.php`, `Booking.php`, `Category.php`, etc.) para que puedas crear las tablas en cualquier servidor MySQL.

#### [MODIFY] [config.php](file:///c:/Users/juanp_8h8f07l/OneDrive/Desktop/ocean-drivev2/server/src/config.php)
Actualizaremos este archivo con las credenciales de tu nueva base de datos.

---

### Alternativa 2: Migración a Supabase (Backend as a Service)
Si prefieres no volver a lidiar con hostings PHP y servidores MySQL, podemos migrar la lógica a Supabase. 

- **Ventajas**: Base de datos gestionada, autenticación integrada, y no necesitas un servidor PHP (puedes hostear el frontend en Vercel/Netlify gratis).
- **Esfuerzo**: Requiere reescribir `api.service.ts` en Angular para usar el cliente de Supabase.

---

### Alternativa 3: Mock Backend con JSON Server (Para desarrollo inmediato)
Si solo necesitas que la app funcione localmente para mostrarla o probar cambios visuales sin un backend real por ahora.

## Pasos Inmediatos Sugeridos

1. **Analizar Esquema**: Terminaré de leer los modelos PHP para generar el SQL de creación de tablas.
2. **Generar Script SQL**: Te entregaré el archivo `.sql` listo para importar.
3. **Guía de Configuración**: Te daré los pasos para apuntar tu App de Angular al nuevo servidor.

## Preguntas Abiertas

1. **¿Tienes algún respaldo (archivo .sql) de la base de datos anterior?** Si lo tienes, podemos recuperar la información. Si no, empezaremos con la base de datos vacía.
2. **¿Ya tienes un nuevo hosting contratado o prefieres recomendaciones?**
3. **¿Te gustaría explorar la migración a Supabase para evitar depender de un hosting PHP en el futuro?**

## Plan de Verificación

### Verificación Manual
- Intentar realizar una conexión con el script `test_db.php` (ya existente en tu root) una vez configures el nuevo hosting.
- Ejecutar el comando `npm start` y verificar que los errores de conexión de la API cambien de "404/Connection Refused" a respuestas válidas.
- Probar el flujo de Login con un usuario admin creado manualmente en la nueva DB.

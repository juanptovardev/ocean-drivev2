# Plan de Recuperación: Migración a Supabase

Dado que no tienes acceso a cPanel ni a la plataforma MySQL, la mejor alternativa para recuperar la operatividad de **Ocean Drive** es migrar a **Supabase**. Esto elimina la necesidad de gestionar servidores PHP y bases de datos MySQL tradicionales.

## User Review Required

> [!IMPORTANT]
> **Sin Servidor PHP**: Con esta migración, ya no necesitaremos el código de la carpeta `/server` en producción. La App de Angular se comunicará directamente con Supabase.

> [!WARNING]
> **Configuración de Seguridad**: Tendremos que configurar las políticas de seguridad (RLS) en Supabase para que nadie pueda borrar datos sin permiso, igual que hacíamos en el backend PHP.

## Propuesta Técnica: Supabase

### 1. Reconstrucción de la Base de Datos
Crearé un script SQL basado en tus modelos PHP actuales para que la estructura sea idéntica. Esto incluye las tablas de `users`, `bookings`, `categories`, `vehicles`, `marketing_subscribers` y `contact_requests`.

### 2. Integración en Angular
- Instalaremos el cliente oficial de Supabase.
- Crearemos un `SupabaseService` que maneje la lógica de Auth y CRUD.
- Modificaremos gradualmente el `api.service.ts` para que use Supabase por debajo, minimizando errores en los componentes.

## Pasos Inmediatos

1.  **Registro**: Crea una cuenta gratuita en [supabase.com](https://supabase.com).
2.  **Nuevo Proyecto**: Crea un proyecto llamado "Ocean Drive".
3.  **SQL Editor**: Copia y pega el script que te daré en el editor SQL de Supabase.
4.  **Credenciales**: Pásame la `URL` y la `Anon Key` de tu proyecto (están en Settings -> API).

## Preguntas Abiertas

1.  **¿Estás de acuerdo con este cambio de arquitectura?** Es lo más práctico para recuperar el control sin depender de un hosting tradicional.
2.  **¿Tienes alguna preferencia sobre dónde alojar el frontend (Angular)?** (Recomiendo Vercel, Netlify o Firebase Hosting, todos tienen planes gratuitos excelentes).

## Plan de Verificación

### Verificación Manual
- Crear un usuario desde la consola de Supabase y probar el login en la app.
- Realizar una reserva de prueba y verificar que aparezca en la tabla `bookings` de Supabase.

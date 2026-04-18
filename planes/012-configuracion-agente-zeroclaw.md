# Guía Global de ZeroClaw: Configuración y Uso 24/7

Esta guía explica cómo utilizar ZeroClaw de forma **global** en tu sistema. Ahora que el binario está en tu `PATH`, puedes invocarlo desde **cualquier carpeta** simplemente escribiendo `zeroclaw`.

---

## 🚀 1. Instalación Global Verificada
ZeroClaw ahora reside en: `C:\Users\juanp_8h8f07l\zeroclaw_bin\zeroclaw.exe`.
Esa carpeta ha sido añadida a tu variable de entorno `PATH` de usuario.

> [!IMPORTANT]
> Para que el cambio surta efecto, **debes cerrar y volver a abrir tu terminal (PowerShell o VS Code)**. Esto permite que Windows reconozca el nuevo comando global.

---

## 🧠 2. Configuración Centralizada
Toda tu "inteligencia" reside en una ubicación global:
*   **Configuración:** `C:\Users\juanp_8h8f07l\.zeroclaw\config.toml`
*   **Memoria e Identidad:** `C:\Users\juanp_8h8f07l\.zeroclaw\workspace\`

### Directiva de Autonomía Total
He configurado tu agente con **Autonomía Full**. Esto significa que puede:
1.  Leer y editar archivos en cualquier carpeta donde lo invoques.
2.  Ejecutar comandos de terminal (PowerShell/CMD) automáticamente.
3.  Aprender y recordar datos del proyecto sin intervención humana.

---

## 🛠️ 3. Comandos Globales (Uso desde cualquier lugar)

Ya no necesitas escribir rutas largas. Usa estos comandos directamente:

### Verificación Inicial
```powershell
zeroclaw --version
```

### Iniciar el Cerebro (Daemon 24/7)
Este es el comando más importante. Corre el servidor de IA y el Dashboard web:
```powershell
zeroclaw daemon
```
*   **Dashboard Web:** Con el daemon corriendo, abre `http://127.0.0.1:42617` en tu navegador para ver el chat, los logs y la memoria.

### Hablar con el Agente (Modo Rápido)
```powershell
zeroclaw agent -m "Analiza los archivos de este directorio y dime si hay vulnerabilidades"
```

### Actualizar Catálogo de Modelos (NVIDIA)
Si quieres ver qué nuevos modelos ha lanzado NVIDIA:
```powershell
zeroclaw models refresh --provider nvidia
```

---

## 🛡️ 4. Seguridad y Autonomía
Al estar en modo global, ten en cuenta:
1.  **Contexto de Carpeta:** Si corres `zeroclaw agent` en la carpeta `ocean-drivev2`, el agente considerará esa carpeta como su contexto inmediato de trabajo.
2.  **Seguridad:** El agente tiene prohibido por defecto tocar carpetas sensibles como Windows o archivos de programa, pero tiene permiso total en tus documentos y proyectos.

> [!TIP]
> Puedes añadir "**Skills**" (habilidades) globales instalándolas desde GitHub:
> `zeroclaw skills install https://github.com/usuario/mi-habilidad-pentesting`

# 🛡️ Guía del Laboratorio Aislado: Kali Linux VM + Tor (Entorno Seguro)

## Análisis de Viabilidad y Seguridad
**¿Es posible?** Absolutamente. Es la arquitectura estándar utilizada por profesionales en Ciberseguridad e instituciones educativas.  
**¿Es seguro?** Sí. Aislar el entorno de ataque (Kali Linux) en una Máquina Virtual alojada en un disco duro externo permite "Air-gapping físico" del almacenamiento. Si el alumno comete un error, se infecta con malware durante un análisis, o corrompe las configuraciones de red, el sistema operativo base (Host) del computador de estudio permanecerá 100% intacto y a salvo. 

---

## 💻 1. Requisitos de Infraestructura
*   **Hardware:** Disco Duro Externo (Preferiblemente SSD conectado por USB 3.0/Type-C para evitar cuellos de botella en la Máquina Virtual).
*   **Software Base:** VirtualBox de Oracle o VMware Workstation Player (gratuitos).
*   **Imagen del OS:** ISO oficial de **Kali Linux** versión `Installer` o `Pre-built VM`.

---

## ⚙️ 2. Montaje de la Máquina Virtual en el Disco Externo
El objetivo es que los archivos pesados `.vdi` (Disco Virtual) vivan fuera del PC de la escuela/alumno.

1.  Abre VirtualBox y ve a **Archivo > Preferencias**.
2.  En la ruta **"Default Machine Folder"**, escoge una carpeta *dentro del Disco Duro Externo* (Ej: `D:\VM_Labs`).
3.  Crea la máquina asegurando poner la memoria RAM a recomendación (mínimo 4GB).
4.  **Network Setup (Vital para el aislamiento):** 
    *   Configura el adaptador de red gráfica de VirtualBox en modo **"NAT"**.
    *   *Explicación para el alumno:* El modo NAT aísla la IP de la VM. La VM puede navegar y salir a internet para hablar con el WAF del host, pero el resto de las computadoras locales no pueden entrar a la VM.

---

## 🧅 3. Configuración del Demonio Tor (Control y Aislamiento)
Una vez instalado Kali Linux en el disco externo, procedemos a configurar el demonio de seguridad a nivel "Root".

1. **Instalación:**
   Abre la terminal de Kali y ejecuta:
   ```bash
   sudo apt update
   sudo apt install tor proxychains4 jq -y
   ```

2. **Apertura del "ControlPort" (Para la rotación de IPs):**
   Edita el archivo de configuración maestro de Tor usando nano:
   ```bash
   sudo nano /etc/tor/torrc
   ```
   *Quita el símbolo `#` a las siguientes líneas o agrégalas al final:*
   ```text
   ControlPort 9051
   CookieAuthentication 1
   ```

3. **Iniciando el Motor Oculto:**
   ```bash
   sudo systemctl enable tor
   sudo systemctl restart tor
   ```

---

## 🚀 4. Protocolo de Ataque Controlado (Para el Alumno)
Con el entorno portátil listo y aislado del disco C:, el alumno puede iniciar cualquier prueba de Pentesting sin tocar su instalación personal.

**Validación Práctica:**
El alumno debe ejecutar este script para comprobar que la Máquina Virtual logra cambiar de identidad web físicamente:

```bash
#!/bin/bash
# test_rotacion_kali.sh

for i in {1..5}; do
    # Usar SOCKS5 a través del servicio Tor local
    IP=$(curl -s --socks5-hostname 127.0.0.1:9050 https://httpbin.org/ip | jq -r '.origin')
    echo "Identidad Web $i: $IP"
    
    # Hablar con el puerto 9051 del Demonio Tor en Kali para renovar Circuito
    echo -e "AUTHENTICATE \"\"\r\nsignal NEWNYM\r\nQUIT" | nc 127.0.0.1 9051 > /dev/null 2>&1
    sleep 3
done
```

---

## 🩺 5. Buenas Prácticas y Sanidad del Laboratorio
Como profesor, exígele al alumno que aplique las siguientes reglas en el disco:
1.  **Snapshots (Instantáneas):** Apenas el alumno termine de instalar Kali y Tor, en VirtualBox debe ir a "Tomar Instantánea". Si en futuros laboratorios rompe el sistema operativo, basta con volver a este punto de restauración limpio en 5 segundos.
2.  **Desconexión Segura:** Siempre debe usar el comando genérico `sudo poweroff` en la terminal o apagar desde la interfaz antes de desconectar el cable USB del disco externo; hacerlo a la fuerza corrompe los clústeres del disco VDI casi de forma instantánea.

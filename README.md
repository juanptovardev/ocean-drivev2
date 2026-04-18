# Ocean Drive Car Rental 🚗✨

<div align="center">
  <img src="https://img.shields.io/badge/Angular-v19+-DD0031?style=for-the-badge&logo=angular" alt="Angular">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Zoneless_Ready-FF6F61?style=for-the-badge" alt="Zoneless Ready">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License">
</div>

<div align="center">
  <strong>✨ Aplicación empresarial moderna para gestión de alquiler de vehículos premium ✨</strong>
</div>

<br>

<p align="center">
  <img src="https://via.placeholder.com/800x400/1A3F6F/FFFFFF?text=Ocean+Drive+Car+Rental+Demo" alt="Ocean Drive Preview">
</p>

## 🌊 Descripción Profesional

**Ocean Drive Car Rental** es una plataforma de nivel empresarial especializada en el alquiler de vehículos premium en el Caribe Colombiano. Esta aplicación SPA (Single Page Application) combina las últimas tecnologías de frontend con una experiencia de usuario de clase mundial, diseñada para manejar la complejidad de reservas, inventarios y gestión administrativa.

### 🏆 Características Principales

- **🚀 Frontend Moderno**: Angular 19+ con arquitectura Zoneless y Componentes Standalone
- **🎨 Diseño Premium**: Sistema de animaciones fluidas y micro-interacciones profesionales
- **📱 Panel Administrativo Completo**: Gestión de vehículos, reservas, disponibilidad y tarifas dinámicas
- **🌍 Internacionalización**: Soporte completo para español e inglés
- **⚡ Optimización de Rendimiento**: ChangeDetectionStrategy.OnPush y Signals Reactivos
- **📲 Responsive**: Diseño completamente adaptativo para cualquier dispositivo

## 🏗️ Arquitectura Técnica

```bash
src/
├── app/              # Componentes reutilizables
├── pages/            # Páginas de la aplicación
│   ├── admin/        # Panel de administración empresarial
│   ├── booking/      # Flujo de reservas completo
│   ├── home/         # Landing page premium
│   └── profile/      # Gestión de usuario
├── components/       # Componentes standalone reutilizables
├── services/         # Servicios inyectables (API, Booking, etc.)
├── guards/           # Protección de rutas (Auth, Admin)
├── interceptors/     # HTTP Interceptors
├── data/             # Datos estructurados
├── assets/           # Recursos multimedia
└── styles.css        # Sistema de Animaciones Premium
```

## 🚀 Empezando

### Requisitos del Sistema
- **Node.js v18+** (Recomendado v20+)
- **npm v9+** o **yarn v1.22+**
- **Angular CLI v19+**

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ocean-drive-rent.git
cd ocean-drive-rent

# 2. Instalar dependencias
npm install

# 3. Verificar ambiente
ng version

# 4. Iniciar servidor de desarrollo
npm start
# La aplicación estará disponible en http://localhost:4200/
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo (localhost:4200) |
| `npm run network` | Servidor accesible desde red (0.0.0.0:4200) |
| `npm run build` | Build de producción optimizado |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | Ejecutar suite de tests |
| `ng test --watch` | Tests en modo desarrollo |
| `npx tsc --noEmit` | Verificación de tipos TypeScript |

## 🛠️ Tecnologías Clave

- **Angular 19+**: Framework principal con Signals y Standalone Components
- **Tailwind CSS v4**: Sistema de estilos utilitarios responsivos
- **RxJS v7.8**: Programación reactiva y manejo de eventos
- **TypeScript v5.6**: Tipado estático estricto
- **Angular Signals**: Gestión de estado moderna y eficiente
- **PHP Backend**: API robusta para operaciones empresariales

## 📊 Características Adicionales

### Panel Administrativo
- Gestión visual de disponibilidad con calendario interactivo
- Sistema de tarifas dinámicas por temporada
- Control de inventario en tiempo real
- Monitoreo de reservas activas y pendientes

### UX/UI Premium
- Sistema de animaciones profesionales (`ease-apple`, `ease-spring`)
- View Transitions API nativas del navegador
- Estados de carga con skeletons y shimmer effects
- Micro-interacciones (`hover-lift`, `hover-glow`)

### Seguridad y Escalabilidad
- Guards de autenticación y autorización
- PHP Backend orientado a objetos
- Arquitectura modular escalable
- Optimización de bundles y rendimiento

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

**Por favor, seguir las convenciones de código descritas en [AGENTS.md](AGENTS.md)**

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

Proyecto desarrollado con arquitectura empresarial y prácticas de desarrollo modernas.

## 📞 Contacto

Para consultas técnicas o información sobre el proyecto:
- 📧 Email: desarrollo@oceandrive.com.co
- 🌐 Website: [oceandrive.com.co](https://oceandrive.com.co)

---

<div align="center">
  <sub>Desarrollado con ❤️ y arquitectura profesional para el Caribe Colombiano</sub>
</div>
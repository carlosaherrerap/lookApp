# Schedule's v2.0 🚀

**Schedule's** es un ecosistema digital avanzado diseñado para la gestión eficiente de visitas de campo, cobranzas y seguimiento de productividad en tiempo real. Inspirado en la estética profesional de Adobe/Lightroom, ofrece herramientas potentes tanto para trabajadores en ruta como para administradores.

---

## 💻 Plataforma Web (Admin)
Portal centralizado para la supervisión y planificación estratégica.

- **Tecnologías**: React 18, Vite, TypeScript, Lucide Icons, Vanilla CSS.
- **Funciones Principales**:
  - **Dashboard Inteligente**: Visualización de métricas de cumplimiento y estados de visitas.
  - **Gestión de Trabajadores**: Control de acceso y asignación de zonas.
  - **Planificación de Rutas**: Creación de rutas geolocalizadas con cálculo de distancias.
  - **Diseño Adobe**: Interfaz minimalista en tonos profundos (Adobe Dark) y Cyan para máxima legibilidad.

---

## 📱 Aplicación Móvil (Worker)
Herramienta de campo con capacidades offline-first y geolocalización precisa.

- **Tecnologías**: React Native (Expo SDK 54), TypeScript, SQLite (Local), Axios, Lucide Icons.
- **Funciones Principales**:
  - **Navegación v2.0**: Estructura de pestañas dividida en:
    - **Rutas**: Lista personal de clientes asignados.
    - **Mundo**: Vista global competitiva para captar clientes cercanos no programados.
    - **Estados**: Registro de asistencia (Inicio, Refrigerio, Fin de Jornada).
  - **Métricas de Eficiencia**: Cronómetros automáticos para medir el tiempo de traslado y el tiempo de permanencia con el cliente.
  - **Ficha Crediticia Editable**: Formulario dinámico para actualizar historial de pagos, saldos y condiciones contables en el sitio.
  - **Competitividad "En Camino"**: Botón para bloquear clientes en tiempo real, evitando que otros trabajadores se dirijan al mismo punto.

---

## ⚙️ Backend (API Server)
El motor que sincroniza los datos y gestiona la lógica de negocio.

- **Tecnologías**: NestJS, TypeORM, PostgreSQL, PostGIS, JWT Auth, Socket.io (Real-time).
- **Funciones Principales**:
  - **Sincronización Inteligente**: Manejo de reportes masivos con control de integridad.
  - **PostGIS Integration**: Consultas espaciales para validar que los reportes se realicen en la ubicación correcta del cliente.
  - **Lógica de Bloqueo**: Gestión de estados competitivos (`EN CAMINO`) para optimizar el despliegue del personal.
  - **Tracking de Productividad**: Registro de tardanzas, alertas de inactividad (idle) y tiempos de ejecución.

---

## 🗄️ Base de Datos
- **PostgreSQL**: Almacenamiento relacional robusto.
- **Tablas v2.0**:
  - `client_credit_info`: Historial financiero extendido.
  - `productivity_logs`: Seguimiento de KPIs de trabajadores.
  - `visit_reports`: Versión extendida con soporte para fotos y métricas de tiempo.

---

**Schedule's** es más que un gestor de mapas; es una solución integral para maximizar la productividad y transparencia en operaciones de campo.
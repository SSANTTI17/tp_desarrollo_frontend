La aplicación fue desarrollada utilizando Next.js 14 (App Router) y TypeScript, con Tailwind CSS para el diseño de la interfaz. Este frontend consume una API REST desarrollada en Java con Spring Boot.
Tecnologias Utilizadas: Next.js 14, TypeScript, Tailwind CSS, React Hook Form + Zod, SweetAlert2

El sistema cubre los principales flujos de trabajo requeridos:
1. Gestión de Sesión Incluye un login validado contra base de datos y protección de rutas privadas. Implementé una lógica de "primer uso": si el backend reporta que no hay usuarios, se permite el acceso con credenciales de administrador por defecto para crear el primer conserje.
2. Huéspedes Permite el alta, baja y modificación de pasajeros. El formulario de alta contempla datos personales y fiscales (CUIT, posición frente al IVA). Incluye un buscador con filtros por nombre, apellido y documento.
3. Reservas Desarrollé una grilla de disponibilidad interactiva que permite seleccionar rangos de fechas y habitaciones para crear reservas en lote. También cuenta con un módulo para buscar reservas por huésped y cancelarlas, liberando el stock.
4. Estado del Hotel Visualización del estado de las habitaciones (disponible, ocupada, reservada o mantenimiento) en un rango de fechas determinado. Las vistas están separadas por categorías de habitación mediante pestañas.
5. Facturación El módulo de checkout permite buscar a los ocupantes actuales de una habitación, generar una pre-visualización de la factura (incluyendo estadía y consumos) y confirmarla. Se agregó la opción de facturar a un tercero (razón social diferente al huésped).

Instalación y Ejecución
Para ejecutar el proyecto en un entorno local:
Asegúrate de tener Node.js instalado.
Clona este repositorio e ingresa a la carpeta.
Instala las dependencias ejecutando npm install.
Verifica que la URL del backend esté configurada correctamente en src/api/apiClient.ts (por defecto apunta a localhost:8080).
Levanta el servidor de desarrollo con el comando npm run dev.
Accede a la aplicación desde el navegador en http://localhost:3000.

Nota sobre Configuración Inicial
Si la base de datos del backend está vacía, el sistema forzará un flujo de configuración inicial. Debes ingresar en el login con el usuario "admin" y la contraseña "admin". Esto te redirigirá automáticamente a la pantalla de creación de conserje para que registres al primer usuario real del sistema.

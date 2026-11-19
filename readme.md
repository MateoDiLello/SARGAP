# SARGAP — Sistema de Acceso y Registro con Gestión Automatizada de Personas

Sistema integral de control de acceso escolar basado en tecnología **RFID**, microcontroladores **ESP32**, una **API REST en Java (Spring Boot)**, base de datos **PostgreSQL** y un **panel web** de administración en tiempo real.

---

## Arquitectura del Proyecto

El repositorio está organizado como un **Monorepo** dividido en tres módulos principales:

* **`/Firmware/SargapReaderExpo`:** Código en C++ (PlatformIO) para ESP32. Gestiona la lectura de tarjetas RFID (MFRC522), sincronización de fecha y hora exacta mediante reloj en tiempo real (RTC DS3231), comunicación HTTP/mDNS con el servidor y retroalimentación sonora/visual (buzzer y LEDs).
* **`/Backend/esp32API`:** API REST desarrollada en Java con Spring Boot y Spring Data JPA. Valida tarjetas, verifica permisos granulares por sector, registra el historial de ingresos en PostgreSQL y expone endpoints para el frontend.
* **`/Frontend`:** Interfaz web moderna, responsiva y accesible (HTML5, CSS3, JavaScript Vanilla) para monitorear ingresos en vivo, dar de alta tarjetas mediante captura automática de UID y administrar roles y espacios habilitados.

---

## Esquema de Conexiones (Hardware ESP32)

| Componente | Pin del Módulo | Pin ESP32 (GPIO) | Protocolo / Función |
| :--- | :--- | :--- | :--- |
| **Lector RFID RC522** | SDA (SS) | GPIO 5 | SPI |
| **Lector RFID RC522** | SCK | GPIO 18 | SPI |
| **Lector RFID RC522** | MOSI | GPIO 23 | SPI |
| **Lector RFID RC522** | MISO | GPIO 19 | SPI |
| **Lector RFID RC522** | RST | GPIO 4 | Digital Out |
| **Reloj RTC DS3231** | SDA | GPIO 21 | I2C |
| **Reloj RTC DS3231** | SCL | GPIO 22 | I2C |
| **LED Verde (Permitido)** | Ánodo (+) | GPIO 25 | Digital Out |
| **LED Rojo (Denegado)** | Ánodo (+) | GPIO 26 | Digital Out |
| **Buzzer Pasivo/Activo** | Señal (+) | GPIO 27 | PWM / Digital Out |

---

## Instalación y Configuración

Por motivos de seguridad, los archivos con credenciales locales están excluidos en `.gitignore`. Antes de ejecutar el proyecto, crea los archivos reales a partir de las plantillas incluidas:

### 1. Base de Datos (PostgreSQL)
1. Asegúrate de tener el servicio de PostgreSQL activo en el puerto `5432`.
2. Crea una base de datos vacía (por ejemplo, `sargap_db`). Hibernate generará automáticamente las tablas `usuarios_rfid` y `registros_acceso` al iniciar el backend.

### 2. Backend (Spring Boot)
1. Navega a `Backend/esp32API/src/main/resources/`.
2. Copia `application.properties.example` y renómbralo a `application.properties`.
3. Completa tus credenciales locales de PostgreSQL (`url`, `username`, `password`).
4. Ejecuta la aplicación desde IntelliJ IDEA o mediante Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

### 3. Firmware (ESP32 / PlatformIO)
1. Navega a `Firmware/SargapReaderExpo/`.
2. Copia `.env.example` y renómbralo a `.env`.
3. Configura tu red Wi-Fi, la URL de tu servidor Java y el nombre del sector donde estará ubicado el lector:
   ```env
   WIFI_SSID = "TU_RED_WIFI"
   WIFI_PASSWORD = "TU_CONTRASEÑA"
   SERVER_URL = "http://TU_IP_LOCAL:8080/api/v1/acceso/verificar"
   NOMBRE_LECTOR = "Entrada Principal"
   ```
4. Compila y sube el firmware al ESP32 utilizando **PlatformIO** en VS Code.

### 4. Frontend (Panel Web)
1. Abre `Frontend/pages/index.html` utilizando un servidor local (por ejemplo, la extensión **Live Server** en VS Code en el puerto `5500`).
2. Verifica que `API_BASE_URL` en el archivo JavaScript apunte a la dirección de tu servidor Spring Boot (`http://localhost:8080/api/v1`).

---

## Endpoints Principales de la API

* `POST /api/v1/acceso/verificar` — Recibe `{ uid, lector, fechaHora }` desde el ESP32, evalúa permisos por sala y guarda el evento.
* `GET /api/v1/registros` — Devuelve el historial completo de lecturas ordenado de más reciente a más antiguo.
* `GET /api/v1/acceso/usuarios` — Lista el padrón de tarjetas registradas y sus espacios habilitados.
* `POST /api/v1/acceso/usuarios` — Registra un nuevo usuario con validación de nombre y UID único.
* `PUT /api/v1/acceso/usuarios/{id}` — Actualiza nombre, UID, rol, espacios habilitados o estado de la tarjeta.
* `DELETE /api/v1/acceso/usuarios/{id}` — Elimina un usuario del padrón.

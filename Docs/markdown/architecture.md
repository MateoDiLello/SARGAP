# SARGAP — Arquitectura del Sistema

**Estado:** Borrador  
**Propósito del documento:** Definir la arquitectura, responsabilidades, flujo de comunicación y principales restricciones técnicas de SARGAP antes de su implementación.

## 1. Propósito

SARGAP es un sistema de control de acceso y registro de asistencia/eventos orientado a instituciones educativas.

El sistema identifica a los usuarios mediante tarjetas RFID, procesa las solicitudes de acceso a través de un dispositivo embebido, comunica el evento resultante a un servidor y almacena la información en una base de datos central.

El sistema también proporciona una interfaz web a través de la cual los usuarios autorizados pueden consultar y gestionar la información generada por el sistema de control de acceso.

La arquitectura está diseñada para separar las responsabilidades de hardware, firmware, backend, base de datos y frontend, de modo que cada subsistema pueda evolucionar de forma independiente.

## 2. Descripción General del Sistema

A alto nivel, SARGAP está compuesto por cinco subsistemas principales:

* **Dispositivo SARGAP**
  * Lector RFID
  * Microcontrolador
  * Reloj en tiempo real
  * Actuador de control de acceso
  * Componentes de retroalimentación para el usuario
  * Conectividad de red
* **Firmware**
  * Controla el dispositivo físico.
  * Lee tarjetas RFID.
  * Obtiene la fecha y la hora.
  * Se comunica con el backend.
  * Controla el actuador y los componentes de retroalimentación.
* **Backend / API**
  * Recibe solicitudes de los dispositivos SARGAP.
  * Valida la información entrante.
  * Aplica la lógica de la aplicación.
  * Se comunica con la base de datos.
  * Expone la información al frontend.
* **Base de Datos**
  * Almacena usuarios, tarjetas, dispositivos y registros de acceso/eventos.
  * Proporciona almacenamiento centralizado persistente.
* **Frontend Web**
  * Permite a los usuarios autorizados consultar y gestionar la información del sistema.
  * Utiliza la API del backend en lugar de acceder directamente a la base de datos.

La relación general es:

```text
                    ┌─────────────────────┐
                    │    Frontend Web     │
                    └──────────┬──────────┘
                               │
                               │ API
                               ▼
                    ┌─────────────────────┐
                    │      Backend        │
                    │        API          │
                    └──────────┬──────────┘
                               │
                               │ Acceso a base de datos
                               ▼
                    ┌─────────────────────┐
                    │   Base de Datos     │
                    └─────────────────────┘
                               ▲
                               │
                          Red / API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Dispositivo SARGAP  │
                    │                     │
                    │ RFID → MCU → Wi-Fi  │
                    └─────────────────────┘
```

El dispositivo no debe comunicarse directamente con la base de datos.

## 3. Componentes Principales

### 3.1 Dispositivo SARGAP

El dispositivo físico SARGAP es responsable de interactuar con el usuario y el mecanismo de control de acceso.

Sus componentes definidos actualmente son:

* Lector RFID (RC522)
* Microcontrolador (planeado actualmente en torno al ESP32)
* Reloj en tiempo real (RTC)
* Servomotor utilizado para simular el mecanismo de acceso
* Zumbador (buzzer) para retroalimentación del usuario
* Conectividad Wi-Fi

El modelo exacto de microcontrolador y la configuración final del hardware quedan sujetos a validación.

### 3.2 Firmware

El firmware es el software ejecutado por el microcontrolador.

Sus responsabilidades incluyen:

* Detectar una tarjeta RFID.
* Leer el UID de la tarjeta.
* Obtener la fecha y hora actual del RTC.
* Preparar la información requerida por el backend.
* Comunicarse con el backend a través de la red.
* Procesar la respuesta del backend.
* Activar o denegar el acceso según el resultado recibido.
* Controlar el servo.
* Controlar el zumbador.
* Gestionar fallas de comunicación.

El firmware no debe contener responsabilidades que correspondan al backend o a la base de datos.

Por ejemplo, el firmware no debería conectarse directamente a MySQL.

### 3.3 Backend / API

El backend es el intermediario entre los dispositivos SARGAP, la base de datos y el frontend web.

Sus responsabilidades incluyen:

* Recibir solicitudes de los dispositivos.
* Validar los datos entrantes.
* Identificar al usuario/tarjeta correspondiente.
* Determinar si una solicitud de acceso está autorizada.
* Registrar eventos.
* Proporcionar datos al frontend.
* Aplicar reglas de autorización y permisos.
* Ocultar los detalles de implementación de la base de datos a los clientes.

El backend proporciona una API a través de la cual se comunican los demás componentes del sistema.

El prototipo inicial utilizaba una lógica de servidor basada en PHP, pero la tecnología del backend a largo plazo sigue siendo una decisión abierta.

Una posible evolución considerada previamente es:

```text
ESP32
  ↓
API REST
  ↓
Spring Boot
  ↓
MySQL
```

Esta es una dirección arquitectónica, no una decisión tecnológica final todavía.

### 3.4 Base de Datos

La base de datos proporciona almacenamiento persistente para SARGAP.

Las entidades identificadas actualmente incluyen:

* Usuarios
* Tarjetas
* Lectores / Dispositivos
* Registros / Eventos

Un modelo conceptual preliminar es:

```text
Usuario
 └── tiene una o más Tarjetas

Lector
 └── genera Registros

Tarjeta/Usuario
 └── está asociado con Registros
```

Una representación relacional preliminar es:

```text
users
- id
- name
- surname
- role

cards
- id
- uid
- user_id

readers
- id
- name
- location

records
- id
- user_id
- reader_id
- date_time
- result
```

Este modelo es preliminar y debe ser revisado antes de la implementación.

La tecnología de base de datos considerada actualmente es MySQL.

### 3.5 Frontend Web

El frontend proporciona una interfaz orientada al usuario para SARGAP.

Permitirá a los usuarios autorizados interactuar con la información gestionada por el backend.

Los roles previamente identificados incluyen:

* Director
* Administrador
* Profesor

El frontend debe comunicarse con la API del backend en lugar de acceder directamente a la base de datos.

Esta separación permite al backend centralizar la validación, la autorización y la lógica de negocio.

## 4. Flujo de Acceso Básico

El flujo de acceso básico es:

```text
1. El usuario presenta la tarjeta RFID
            ↓
2. El RC522 lee el UID de la tarjeta
            ↓
3. El microcontrolador obtiene la fecha/hora
            ↓
4. El firmware crea los datos de la solicitud
            ↓
5. El dispositivo envía la solicitud por Wi-Fi
            ↓
6. El backend recibe la solicitud
            ↓
7. El backend valida la tarjeta/usuario/dispositivo
            ↓
8. El backend determina el resultado del acceso
            ↓
9. El backend registra el evento
            ↓
10. El backend devuelve el resultado al dispositivo
            ↓
11. El firmware procesa la respuesta
            ↓
12. El servo y el zumbador proporcionan retroalimentación física
```

La decisión central sobre la autorización pertenece al backend.

## 5. Arquitectura de Comunicación

SARGAP utiliza un modelo de comunicación por capas.

```text
Dispositivo Físico
      │
      │ Wi-Fi
      ▼
   API Backend
      │
      │ Conexión a base de datos
      ▼
   Base de Datos

Frontend Web
      │
      │ API
      ▼
   API Backend
```

El dispositivo se comunica con el backend a través de una API.

El frontend también se comunica con el backend a través de una API.

Ni el dispositivo ni el frontend deben acceder directamente a la base de datos.

Esto crea la siguiente estructura de dependencias:

```text
Dispositivo ────────► API ◄──────── Frontend
                      │
                      ▼
                Base de Datos
```

Esta es una restricción arquitectónica importante porque mantiene los detalles de implementación de la base de datos aislados de los clientes.

## 6. API

La API actúa como el contrato entre los componentes del sistema.

Los endpoints exactos y los esquemas de solicitud/respuesta aún no se han finalizado.

Una operación conceptual de registro de acceso podría parecerse a:

`POST /records`

con información conceptualmente similar a:

* `device_id`
* `card_uid`
* `date_time`

El backend determinaría entonces:

```text
tarjeta → usuario → permisos → resultado del acceso
```

y devolvería una respuesta adecuada al dispositivo.

El contrato final de la API debe definirse antes de que el firmware y el frontend dependan fuertemente de endpoints específicos.

Esto sigue un enfoque "API-first": definir el contrato de comunicación antes de acoplar estrechamente las implementaciones al mismo.

## 7. Flujo de Datos

El flujo de datos principal es:

```text
Tarjeta RFID
    ↓
RC522
    ↓
Firmware
    ↓
Wi-Fi
    ↓
API
    ↓
Validación / Lógica de Negocio
    ↓
Base de Datos
    ↓
Respuesta de la API
    ↓
Firmware
    ↓
Retroalimentación Física
```

El flujo de datos web es:

```text
Usuario
   ↓
Frontend
   ↓
API
   ↓
Lógica del Backend
   ↓
Base de Datos
   ↓
API
   ↓
Frontend
```

## 8. Separación de Responsabilidades

SARGAP sigue una separación estricta entre subsistemas.

### Dispositivo / Hardware
Responsable de:
* Interacción física.
* Lectura de RFID.
* Actuación.
* Retroalimentación local.

### Firmware
Responsable de:
* Control del hardware.
* Procesamiento a nivel de dispositivo.
* Comunicación de red.
* Interpretar las respuestas del backend.

### Backend
Responsable de:
* Reglas de negocio.
* Lógica de autenticación/autorización.
* Validación.
* Gestión de dispositivos y usuarios.
* Procesamiento de eventos.
* API.

### Base de Datos
Responsable de:
* Almacenamiento persistente de datos.
* Relaciones de datos.
* Recuperación de datos.

### Frontend
Responsable de:
* Interfaz de usuario.
* Presentación.
* Interacción del usuario.
* Consumo de servicios del backend.

Ningún componente debe asumir innecesariamente las responsabilidades de otro componente.

## 9. Tolerancia a Fallas y Conectividad

SARGAP debe tener en cuenta las fallas en la comunicación y en otros componentes.

El principal escenario de falla identificado actualmente es la pérdida de conectividad de red.

La estrategia final fuera de línea (offline) aún no se ha decidido.

Un posible comportamiento futuro podría implicar:

```text
Red disponible
      ↓
Enviar evento al backend
```

o bien:

```text
Red no disponible
      ↓
Almacenar evento localmente
      ↓
Red restablecida
      ↓
Sincronizar eventos pendientes
```

Esta decisión debe tomarse antes de finalizar la arquitectura del firmware porque afecta al almacenamiento local, los identificadores de eventos, la sincronización y la consistencia.

El sistema también debe considerar:
* Backend no disponible.
* Respuesta de API inválida.
* Base de Datos no disponible.
* Reinicio del dispositivo.
* Envío de eventos duplicados.
* Pérdida de energía.
* Sincronización del reloj.

Estos casos requieren un comportamiento explícito en lugar de dejarse a detalles de implementación accidentales.

## 10. Seguridad

La seguridad es parte de la arquitectura y no debe tratarse únicamente como una preocupación del frontend.

El sistema debe definir eventualmente:
* Cómo se autentican los dispositivos con el backend.
* Cómo se autentican los usuarios con la aplicación web.
* Cómo se aplican los permisos.
* Cómo se protege la comunicación.
* Cómo se manejan los identificadores RFID.
* Cómo se evita que dispositivos no autorizados envíen eventos.
* Cómo se almacena la información sensible.

Los mecanismos exactos de seguridad siguen siendo decisiones abiertas.

Una restricción fundamental es:

```text
Cliente
   ↓
API
   ↓
Autorización
   ↓
Recurso
```

La autorización debe ser impuesta por el backend y no confiar únicamente en el frontend.

## 11. Escalabilidad

La arquitectura debe permitir que múltiples dispositivos SARGAP se comuniquen con el mismo backend.

Conceptualmente:

```text
Dispositivo 1 ──┐
Dispositivo 2 ──┤
Dispositivo 3 ──┼──► API Backend ──► Base de Datos
Dispositivo 4 ──┤
Dispositivo N ──┘
```

Los dispositivos no deberían necesitar conocer la existencia de los demás.

El backend debe diseñarse como sin estado (stateless) siempre que sea práctico, lo que significa que una instancia individual del backend no debe depender de la memoria local para mantener el estado esencial de la aplicación.

El estado persistente pertenece al almacenamiento persistente adecuado.

Esto facilita la futura escalabilidad horizontal.

## 12. Despliegue

La arquitectura de despliegue aún no se ha finalizado.

Se ha considerado Docker como una forma de aislar los servicios y hacer que el desarrollo y el despliegue sean más reproducibles.

Una posible estructura de despliegue es:

```text
Entorno Docker
├── Backend
├── Base de Datos
└── Frontend / Servidor Web
```

La estrategia exacta de contenedorización se definirá después de que se finalicen la arquitectura de la aplicación y las opciones tecnológicas.

Por lo tanto, Docker se considera una herramienta de despliegue/desarrollo, no un requisito arquitectónico para la lógica de negocio en sí misma.

## 13. Arquitectura de Desarrollo del Firmware

El firmware se desarrollará por separado del backend y del frontend.

PlatformIO se considera el entorno de desarrollo/construcción (build) del firmware.

PlatformIO no es en sí mismo un componente de la arquitectura del sistema SARGAP. Es una herramienta utilizada para desarrollar, compilar, subir y gestionar el firmware.

El proyecto de firmware podría eventualmente tener una estructura similar a:

```text
firmware/
├── platformio.ini
├── src/
│   └── main.cpp
├── include/
├── lib/
└── test/
```

La arquitectura interna exacta del firmware aún no está finalizada.

El firmware debe separarse progresivamente en responsabilidades lógicas en lugar de colocar todo el sistema dentro de `main.cpp`.

Por ejemplo:

```text
main
 ├── Manejo de RFID
 ├── Manejo de RTC
 ├── Comunicación de red
 ├── Cliente API
 ├── Control de acceso
 └── Retroalimentación de hardware
```

Esta es una decisión de organización de software que se deriva de la arquitectura general.

## 14. Principios Arquitectónicos

SARGAP seguirá estos principios generales.

### 14.1 Desacoplamiento Estricto
Los componentes deben comunicarse a través de interfaces definidas en lugar de depender directamente de los detalles de implementación.

### 14.2 Comunicación API-First
El contrato de la API debe definirse antes de que los clientes se acoplen estrechamente a los detalles de implementación del backend.

### 14.3 Lógica de Negocio Centralizada
Las reglas de control de acceso y de permisos deben ser gestionadas de forma centralizada por el backend.

### 14.4 Backend Sin Estado Siempre que sea Práctico
Las instancias del backend deben evitar almacenar el estado esencial de la aplicación de manera local.

### 14.5 Tolerancia a Fallas
Las fallas esperadas deben contar con un comportamiento explícito por parte del sistema.

### 14.6 Escalabilidad Horizontal
La arquitectura debe permitir múltiples dispositivos y, eventualmente, múltiples instancias de backend sin requerir cambios en el modelo fundamental del sistema.

### 14.7 Gestión del Ciclo de Vida
Las actualizaciones de firmware y software eventualmente deben considerarse como parte del ciclo de vida del sistema.

Las actualizaciones de firmware OTA (Over-The-Air) son una capacidad futura posible y aún no están finalizadas.

## 15. Decisiones Tecnológicas

Se han discutido o considerado las siguientes tecnologías:

| Componente | Dirección actual | Estado |
| :--- | :--- | :--- |
| Lector RFID | RC522 | Definido |
| Microcontrolador | Familia ESP32 | No finalizado completamente |
| Idioma del firmware | C/C++ | Dirección definida |
| Herramientas de firmware | PlatformIO | Dirección definida |
| Comunicación | Wi-Fi | Dirección definida |
| Dispositivo → Backend | HTTP/API | Dirección definida |
| Estilo de API | Orientado a REST | Dirección |
| Backend | Prototipo PHP / Java + Spring Boot considerado | Abierto |
| Base de Datos | MySQL | Candidato sólido |
| Frontend | Aplicación web | Definido |
| Despliegue | Docker considerado | Abierto |
| OTA | Capacidad futura | Abierto |

Las elecciones tecnológicas deben seguir los requisitos arquitectónicos en lugar de determinarlos.

## 16. Decisiones Arquitectónicas Abiertas

Las siguientes decisiones permanecen abiertas y deben resolverse antes de que la implementación se considere arquitectónicamente completa.

### Dispositivo
* Modelo exacto de ESP32.
* Configuración final del hardware.
* Requisitos de almacenamiento local.
* Mecanismo de identificación de dispositivos.
* Mecanismo de autenticación de dispositivos.

### Comunicación
* Detalles finales del protocolo de la API.
* Formato de solicitud/respuesta.
* Formato de errores.
* Comportamiento ante tiempos de espera (timeout).
* Comportamiento ante reintentos.
* Manejo de solicitudes duplicadas.

### Operación Fuera de Línea (Offline)
* Si el acceso puede continuar sin conectividad con el backend.
* Si los eventos se almacenan localmente.
* Número máximo de eventos pendientes.
* Mecanismo de sincronización.
* Resolución de conflictos.

### Backend
* Tecnología final del backend.
* Framework.
* Arquitectura de autenticación.
* Modelo de autorización.
* Estrategia de versiones de la API (versioning).

### Base de Datos
* Modelo relacional final.
* Restricciones y relaciones.
* Índices.
* Estrategia de unicidad/idempotencia de eventos.
* Política de retención de datos.

### Frontend
* Framework de frontend.
* Mecanismo de autenticación.
* Modelo de roles/permisos.
* Vistas y operaciones requeridas.

### Despliegue
* Arquitectura de Docker.
* Alojamiento (hosting) de producción.
* Despliegue de la base de datos.
* Estrategia de respaldo (backup).
* Monitoreo y registro (logging).

### Ciclo de Vida del Firmware
* Mecanismo de actualización del firmware.
* Estrategia OTA.
* Gestión de la configuración del dispositivo.
* Compatibilidad de versiones de firmware con versiones de la API.

## 17. Límite Arquitectónico Actual

La arquitectura actualmente se puede resumir como:

```text
┌──────────────────────────────────────────────────────────────┐
│                         SARGAP SYSTEM                        │
│                                                              │
│  ┌──────────────┐       ┌───────────────┐                    │
│  │ RFID /       │       │   Firmware    │                    │
│  │ Hardware     │──────►│   (ESP32)     │                    │
│  └──────────────┘       └───────┬───────┘                    │
│                                 │                            │
│                                 │ HTTP / API                │
│                                 ▼                            │
│                         ┌───────────────┐                    │
│                         │    Backend    │                    │
│                         │      API      │                    │
│                         └───────┬───────┘                    │
│                                 │                            │
│                                 ▼                            │
│                         ┌───────────────┐                    │
│                         │   Database    │                    │
│                         └───────────────┘                    │
│                                 ▲                            │
│                                 │ API                        │
│                         ┌───────┴───────┐                    │
│                         │ Web Frontend  │                    │
│                         └───────────────┘                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

La arquitectura es intencionalmente independiente de la tecnología en las áreas donde aún no se ha tomado una decisión final.

## 18. Estado Arquitectónico

La arquitectura actual establece los límites y responsabilidades principales de SARGAP.

Los siguientes puntos se consideran suficientemente definidos en esta etapa:
* SARGAP es un sistema distribuido de control de acceso y registro de eventos.
* Se utiliza RFID para la identificación de usuarios.
* El RC522 es el lector RFID.
* El dispositivo embebido se comunica a través de Wi-Fi.
* El dispositivo se comunica con el backend a través de una API.
* El dispositivo no accede directamente a la base de datos.
* El frontend no accede directamente a la base de datos.
* El backend contiene la aplicación central/lógica de negocio.
* La base de datos proporciona almacenamiento persistente.
* Múltiples dispositivos deberían poder utilizar el mismo backend.
* La arquitectura debe soportar la escalabilidad futura y la tolerancia a fallas.

Las decisiones abiertas restantes deben resolverse progresivamente antes de que comiencen sus respectivas implementaciones.

Por lo tanto, este documento sirve como base arquitectónica para la siguiente etapa del desarrollo de SARGAP.

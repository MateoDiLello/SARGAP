# SARGAP — Tech Stack

## 1. Propósito

Este documento registra las tecnologías seleccionadas o consideradas para implementar SARGAP.

Las tecnologías no forman parte de la definición fundamental del sistema. Pueden cambiar durante el desarrollo si se encuentra una alternativa más adecuada.

Las decisiones deben estar justificadas por los requisitos y la arquitectura de SARGAP, y no únicamente por familiaridad o disponibilidad.

---

## 2. Hardware y dispositivo

### Microcontrolador

**Candidato actual:** ESP32-WROOM-32

El ESP32 es el candidato principal para el dispositivo del MVP debido a su conectividad Wi-Fi integrada y sus capacidades de procesamiento y comunicación.

**Estado:** Por confirmar.

### Identificación

**MVP:** RFID

El MVP utilizará RFID debido a que es el método de identificación disponible para el prototipo.

**Estado:** Seleccionado para el MVP.

**Evolución prevista:** incorporar otros métodos de identificación, especialmente biometría, sin modificar innecesariamente la lógica central del sistema.

### Periféricos

El prototipo podrá utilizar:

* LED verde;
* LED rojo;
* buzzer;
* lector RFID;
* otros periféricos necesarios para demostrar el funcionamiento del MVP.

El control de una cerradura electrónica queda fuera del MVP actual.

---

## 3. Firmware

### Lenguaje

**Candidato actual:** C++

El firmware será desarrollado en C++ debido a que es el lenguaje utilizado para programar el microcontrolador seleccionado.

**Estado:** Por confirmar.

### Entorno de desarrollo

**Candidato actual:** PlatformIO

PlatformIO será evaluado como herramienta para organizar, compilar y cargar el firmware del microcontrolador.

**Estado:** Por confirmar.

### Librerías

Las librerías concretas se determinarán durante la implementación según los componentes utilizados.

---

## 4. Comunicación

El dispositivo deberá comunicarse con el sistema de software para transmitir los datos generados durante una identificación.

Información mínima a transmitir:

```text
Identificador
Dispositivo
Fecha
Hora
Resultado
```

**Tecnología/protocolo:** Por decidir.

Se evaluarán alternativas como HTTP/HTTPS, MQTT u otros mecanismos adecuados.

La elección deberá considerar simplicidad para el MVP, confiabilidad, seguridad y posibilidad de ampliar el sistema a múltiples dispositivos.

---

## 5. Backend

El backend será responsable de procesar la información recibida desde los dispositivos y aplicar la lógica central de SARGAP.

Entre sus responsabilidades estarán:

* identificar personas;
* procesar solicitudes;
* determinar resultados;
* registrar eventos;
* proporcionar información al frontend;
* gestionar usuarios y permisos cuando corresponda.

**Tecnología:** Por decidir.

---

## 6. Base de datos

La base de datos almacenará información relacionada con personas, identificadores, dispositivos, eventos y demás entidades necesarias para el funcionamiento del sistema.

**Candidato actual:** MySQL

MySQL ya fue utilizado o contemplado en versiones anteriores del proyecto.

**Estado:** Por confirmar.

La elección definitiva deberá realizarse considerando los requisitos y la arquitectura.

---

## 7. Frontend

El frontend proporcionará la interfaz web utilizada para consultar y gestionar la información de SARGAP.

El MVP deberá representar al menos las perspectivas correspondientes a:

* alumno;
* profesor.

**Tecnología/framework:** Por decidir.

La elección deberá considerar facilidad de desarrollo, mantenibilidad y posibilidad de ampliar posteriormente la interfaz.

---

## 8. Desarrollo y herramientas

### Editor / IDE

**Herramienta actual:** Visual Studio Code

También se utilizará Google Antigravity como entorno de desarrollo asistido por IA cuando resulte conveniente.

### Control de versiones

**Herramienta:** Git

**Repositorio:** Git

El código y la documentación deberán mantenerse bajo control de versiones.

### Asistencia mediante IA

Las herramientas de IA podrán utilizarse durante el desarrollo para:

* investigar;
* diseñar soluciones;
* escribir código;
* revisar código;
* generar pruebas;
* analizar errores;
* documentar;
* automatizar tareas.

La IA no debe sustituir la comprensión de las decisiones importantes del proyecto.

---

## 9. Estado de las decisiones

Las tecnologías que todavía no hayan sido validadas mediante los requisitos y la arquitectura deberán considerarse provisionales.

| Componente                 | Tecnología         | Estado                    |
| -------------------------- | ------------------ | ------------------------- |
| Microcontrolador           | ESP32-WROOM-32     | Por confirmar             |
| Identificación MVP         | RFID               | Seleccionado              |
| Identificación futura      | Biometría          | A evaluar                 |
| Firmware                   | C++                | Por confirmar             |
| Entorno firmware           | PlatformIO         | Por confirmar             |
| Comunicación               | HTTP o HTTPS        | por confirmar                 |
| Backend                    | java               | por confirmar                 |
| Base de datos              | MySQL              | Por confirmar             |
| Frontend                   | HTML, CSS, JS, FrameWork a decidir        | por decidir                 |
| Control de versiones       | Git                | Seleccionado              |
 

---

## 10. Regla para modificar el Tech Stack

Una tecnología no debe cambiarse únicamente porque exista otra alternativa.

Antes de realizar un cambio importante se debe evaluar:

1. qué requisito o problema motiva el cambio;
2. qué alternativa se propone;
3. qué ventajas y desventajas presenta;
4. cómo afecta a la arquitectura existente;
5. qué costo tendría migrar;
6. si realmente mejora el proyecto.

Las decisiones importantes deberán registrarse junto con su justificación.

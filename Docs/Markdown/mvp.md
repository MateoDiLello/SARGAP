# SARGAP — MVP

## 1. Objetivo

El objetivo del MVP de SARGAP es construir un prototipo funcional que permita demostrar el funcionamiento básico del sistema de identificación, autorización y registro de personas.

El prototipo debe demostrar que una persona puede identificarse ante un dispositivo, que SARGAP puede reconocer quién es, procesar la solicitud según las reglas definidas, registrar el acontecimiento y comunicar físicamente el resultado.

El MVP estará orientado principalmente a demostrar el concepto de SARGAP dentro de una institución educativa.

---

## 2. Alcance del MVP

El MVP estará compuesto por un único dispositivo de identificación y un sistema de software capaz de recibir y procesar las identificaciones.

El flujo principal será:

```text
Persona
   ↓
Identificación
   ↓
SARGAP reconoce a la persona
   ↓
Se procesa la solicitud
   ↓
Permitido / Denegado
   ↓
Se registra el evento
   ↓
LED + buzzer
```

El prototipo deberá permitir demostrar este flujo de principio a fin.

---

## 3. Identificación

El MVP utilizará RFID como método de identificación debido a que es la tecnología disponible para el desarrollo del prototipo.

Cada medio de identificación deberá estar asociado a una persona dentro del sistema.

Por ejemplo:

```text
ID RFID: 4821
Persona: Juan Pérez
Tipo: Alumno
```

El sistema deberá poder determinar la identidad de la persona a partir del identificador recibido.

### Extensibilidad

La lógica principal de SARGAP no deberá quedar acoplada exclusivamente a RFID.

El sistema deberá diseñarse de manera que posteriormente puedan incorporarse otros métodos de identificación, especialmente sistemas biométricos.

Conceptualmente:

```text
Método de identificación
        │
        ├── RFID
        │
        └── Biometría
```

La implementación funcional de biometría queda fuera del MVP.

---

## 4. Personas

El MVP contemplará dos tipos principales de personas:

* Alumno
* Profesor

Cada persona deberá contar con una identidad dentro del sistema y estar asociada al identificador utilizado para realizar la identificación.

Como mínimo, el sistema deberá poder relacionar:

```text
Identificador
→ Persona
→ Tipo de persona
```

---

## 5. Registro de eventos

Cada identificación deberá generar un registro con información suficiente para conocer qué ocurrió.

Como mínimo, el registro deberá contener:

* identificador utilizado;
* persona asociada;
* fecha;
* hora;
* dispositivo utilizado;
* resultado de la solicitud.

El resultado deberá permitir diferenciar al menos entre una solicitud permitida y una solicitud denegada.

Ejemplo:

```text
Identificador: 4821
Persona: Juan Pérez
Tipo: Alumno
Dispositivo: Lector 01
Fecha: 2026-10-15
Hora: 13:07
Resultado: Permitido
```

Los registros deberán almacenarse de manera que puedan ser consultados posteriormente desde el sistema.

---

## 6. Resultado físico

El dispositivo deberá comunicar el resultado de la identificación de forma inmediata y comprensible.

Cuando la solicitud sea permitida:

```text
LED verde
```

Cuando la solicitud sea denegada:

```text
LED rojo
+ buzzer
```

El objetivo de esta parte del MVP es demostrar visual y auditivamente que SARGAP procesó la identificación y tomó una decisión.

El prototipo no necesita controlar todavía una cerradura electrónica real.

---

## 7. Dispositivo

El MVP contará con un único lector.

El dispositivo representará conceptualmente un punto de acceso de SARGAP dentro de una institución.

El sistema deberá identificar el dispositivo para que los eventos registrados puedan indicar desde qué punto se produjo la identificación.

La existencia de un único dispositivo en el MVP no debe impedir que el diseño pueda ampliarse posteriormente a múltiples lectores.

---

## 8. Sistema de software

El MVP deberá contar con un sistema de software que permita recibir, procesar y almacenar los acontecimientos producidos por el dispositivo.

La arquitectura deberá separar conceptualmente:

```text
Dispositivo
     ↓
Comunicación
     ↓
Lógica de SARGAP
     ↓
Almacenamiento
     ↓
Interfaz web
```

Las tecnologías concretas utilizadas para implementar estos componentes serán definidas posteriormente.

---

## 9. Interfaz web

El MVP deberá contar con una interfaz web que permita visualizar el funcionamiento del sistema.

La interfaz deberá contemplar al menos dos perspectivas de usuario:

### Alumno

La interfaz deberá representar la información que un alumno podría consultar dentro de SARGAP.

### Profesor

La interfaz deberá representar la información que un profesor podría consultar dentro de SARGAP.

La interfaz podrá incluir elementos visuales estáticos o demostrativos que representen funcionalidades futuras de SARGAP, siempre que se distingan claramente de las funcionalidades realmente implementadas.

La interfaz web del MVP no necesita implementar todo el sistema educativo planteado en la visión de SARGAP.

---

## 10. Funcionalidades fuera del MVP

Las siguientes funcionalidades forman parte de la visión futura de SARGAP, pero no son necesarias para el MVP:

* múltiples lectores;
* múltiples espacios físicos;
* identificación biométrica funcional;
* control de cerraduras electrónicas;
* gestión completa de horarios;
* asistencia y ausentismo completos;
* sistema completo de padres y tutores;
* calificaciones;
* boletines;
* actas;
* comunicaciones institucionales;
* adaptación funcional a empresas;
* gestión de múltiples instituciones;
* aplicación móvil;
* otras funcionalidades específicas de organizaciones distintas de la institución educativa utilizada para el prototipo.

Estas funcionalidades podrán ser incorporadas posteriormente sin formar parte de los requisitos necesarios para considerar terminado el MVP.

---

## 11. Criterios para considerar terminado el MVP

El MVP podrá considerarse funcional cuando sea posible realizar, como mínimo, el siguiente flujo:

```text
1. Una persona utiliza su medio de identificación.
        ↓
2. El dispositivo recibe el identificador.
        ↓
3. SARGAP identifica a la persona.
        ↓
4. SARGAP procesa la solicitud.
        ↓
5. Se determina un resultado:
       Permitido / Denegado
        ↓
6. El dispositivo comunica el resultado:
       LED verde
       o
       LED rojo + buzzer
        ↓
7. El acontecimiento queda registrado.
        ↓
8. La información puede consultarse desde la interfaz web.
```

El prototipo deberá poder demostrar este flujo de manera reproducible.

---

## 12. Principio de diseño del MVP

El MVP no pretende representar la totalidad de SARGAP.

Su propósito es demostrar que el núcleo fundamental del sistema es viable:

> **Identificar una persona, procesar su solicitud, registrar el acontecimiento y comunicar el resultado.**

Las decisiones técnicas tomadas durante el desarrollo deberán procurar que este núcleo pueda evolucionar posteriormente hacia un sistema con múltiples dispositivos, métodos de identificación, espacios, organizaciones y funcionalidades específicas.

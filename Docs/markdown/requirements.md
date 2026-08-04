# SARGAP — Requirements

## 1. Propósito

Este documento define los requisitos que debe cumplir el MVP de SARGAP.

Los requisitos describen el comportamiento esperado del sistema de manera verificable. No determinan necesariamente las tecnologías utilizadas para implementarlo.

El MVP busca demostrar el núcleo funcional de SARGAP:

```text
Identificar
    ↓
Procesar
    ↓
Autorizar
    ↓
Registrar
    ↓
Comunicar resultado
```

---

# 2. Requisitos funcionales

## FR-001 — Identificación de personas

El sistema debe permitir identificar a una persona mediante un identificador asociado a ella.

El identificador utilizado en el MVP será RFID.

**Criterio de aceptación:**

Dado un identificador registrado en el sistema, cuando el dispositivo lo recibe, SARGAP debe poder determinar qué persona está asociada a dicho identificador.

---

## FR-002 — Asociación entre identificador y persona

El sistema debe permitir asociar un identificador con una persona.

Como mínimo, una persona debe contar con:

* identificador;
* nombre;
* tipo de persona.

Los tipos de persona contemplados por el MVP serán:

* alumno;
* profesor.

**Criterio de aceptación:**

Dado un identificador registrado, el sistema debe poder recuperar la información de la persona asociada.

---

## FR-003 — Recepción de identificaciones

El sistema debe recibir la información generada por el dispositivo de identificación.

Una identificación debe poder ser procesada por el sistema central sin necesidad de intervención manual del usuario.

---

## FR-004 — Determinación del resultado

El sistema debe procesar una identificación y determinar un resultado.

Los resultados mínimos serán:

* permitido;
* denegado.

La decisión deberá basarse en las reglas de autorización definidas para el MVP.

---

## FR-005 — Registro de identificaciones

El sistema debe registrar cada identificación procesada.

Cada registro debe contener, como mínimo:

* identificador utilizado;
* persona asociada;
* dispositivo;
* fecha;
* hora;
* resultado de la solicitud.

**Criterio de aceptación:**

Después de procesar una identificación, debe existir un registro consultable que permita determinar quién fue identificado, cuándo ocurrió, desde qué dispositivo y cuál fue el resultado.

---

## FR-006 — Identificación del dispositivo

El sistema debe poder identificar el dispositivo desde el cual se produjo una identificación.

El MVP contará con un único dispositivo, pero el registro deberá contemplar la existencia de múltiples dispositivos para permitir una futura ampliación.

---

## FR-007 — Comunicación de acceso permitido

Cuando una identificación sea autorizada, el dispositivo debe comunicar el resultado mediante un LED verde.

**Criterio de aceptación:**

Una identificación autorizada debe producir el encendido del LED verde.

---

## FR-008 — Comunicación de acceso denegado

Cuando una identificación sea denegada, el dispositivo debe comunicar el resultado mediante un LED rojo y un buzzer.

**Criterio de aceptación:**

Una identificación denegada debe producir el encendido del LED rojo y la activación del buzzer.

---

## FR-009 — Consulta de información desde la plataforma web

El sistema debe permitir consultar desde una interfaz web la información generada por las identificaciones.

Como mínimo, la plataforma deberá permitir visualizar información relacionada con las personas y los eventos registrados.

---

## FR-010 — Vista de alumno

La plataforma web debe contemplar una vista representativa de la información que podría consultar un alumno.

Esta vista deberá representar las funcionalidades correspondientes al rol de alumno dentro de SARGAP.

---

## FR-011 — Vista de profesor

La plataforma web debe contemplar una vista representativa de la información que podría consultar un profesor.

Esta vista deberá representar las funcionalidades correspondientes al rol de profesor dentro de SARGAP.

---

## FR-012 — Representación de funcionalidades futuras

La interfaz web podrá incluir elementos visuales que representen funcionalidades futuras de SARGAP.

Las funcionalidades simuladas o estáticas deben poder distinguirse de las funcionalidades realmente implementadas en el MVP.

---

# 3. Requisitos de extensibilidad

## NFR-001 — Independencia del método de identificación

La lógica central de SARGAP no debe depender exclusivamente de RFID.

El diseño debe permitir incorporar posteriormente otros métodos de identificación, especialmente sistemas biométricos.

La incorporación de un nuevo método de identificación debería requerir modificaciones limitadas en la lógica central del sistema.

---

## NFR-002 — Extensibilidad de dispositivos

El sistema debe diseñarse de manera que el único dispositivo utilizado durante el MVP pueda ampliarse posteriormente a múltiples dispositivos.

La arquitectura no debe asumir que existe un único lector como condición permanente del sistema.

---

## NFR-003 — Independencia entre identificación y autorización

El mecanismo utilizado para identificar a una persona debe mantenerse conceptualmente separado de la lógica que determina si una solicitud es permitida o denegada.

Esto permitirá cambiar o agregar métodos de identificación sin tener que rediseñar la lógica de autorización.

---

## NFR-004 — Separación entre registro y presentación

Los acontecimientos generados por el sistema deben poder almacenarse independientemente de la interfaz utilizada para visualizarlos.

La modificación de la interfaz web no debería requerir modificar la información histórica almacenada.

---

# 4. Reglas de negocio

## BR-001 — Identificador único

Cada identificador utilizado para identificar personas debe estar asociado a una única persona dentro del sistema.

---

## BR-002 — Identificación desconocida

Si el sistema recibe un identificador que no está asociado a ninguna persona registrada, la identificación no debe considerarse válida.

El acontecimiento debe poder registrarse como una identificación desconocida o denegada.

---

## BR-003 — Registro de identificaciones denegadas

Una identificación denegada debe registrarse de la misma manera que una identificación permitida.

El sistema no debe descartar los intentos rechazados.

---

## BR-004 — Resultado físico

El resultado físico comunicado por el dispositivo debe corresponder al resultado determinado por SARGAP.

```text
Permitido → LED verde

Denegado → LED rojo + buzzer
```

---

## BR-005 — Personas del MVP

El MVP contemplará únicamente los tipos de persona:

* alumno;
* profesor.

Otros tipos de personas forman parte de la evolución futura de SARGAP.

---

# 5. Requisitos fuera del MVP

Los siguientes requisitos pertenecen a la visión futura de SARGAP y no son necesarios para validar el MVP:

* identificación biométrica funcional;
* múltiples lectores;
* múltiples espacios;
* control de cerraduras electrónicas;
* sistema completo de horarios;
* asistencia y ausentismo automatizados;
* padres y tutores;
* calificaciones;
* boletines;
* actas;
* comunicaciones institucionales;
* adaptación funcional completa a empresas;
* múltiples instituciones;
* aplicación móvil.

Estos elementos no deben considerarse requisitos necesarios para determinar si el MVP está terminado.

---

# 6. Criterio general de finalización

El MVP deberá considerarse funcional cuando pueda demostrarse de manera reproducible el siguiente flujo:

```text
1. Una persona presenta su identificador RFID.
          ↓
2. El dispositivo recibe el identificador.
          ↓
3. SARGAP identifica a la persona.
          ↓
4. SARGAP procesa la solicitud.
          ↓
5. Se determina si está permitida o denegada.
          ↓
6. El dispositivo comunica el resultado:
       ├── Permitido → LED verde
       └── Denegado → LED rojo + buzzer
          ↓
7. El evento queda registrado.
          ↓
8. La información puede consultarse desde la web.
```

El flujo debe poder repetirse con al menos un alumno y un profesor, incluyendo casos de identificación permitida y denegada.

---

# 7. Relación con otros documentos

Este documento debe interpretarse junto con:

* `vision.md` — define la visión general y evolución prevista de SARGAP.
* `mvp.md` — define el alcance del prototipo inicial.
* `architecture.md` — definirá cómo se organizará técnicamente el sistema.
* `tech-stack.md` — definirá las tecnologías seleccionadas para implementar la arquitectura.

Los requisitos describen qué debe hacer el sistema, mientras que la arquitectura y las decisiones tecnológicas definirán cómo se implementará.

Los requisitos pueden modificarse si cambia el alcance del MVP o se descubre que una necesidad del sistema fue definida incorrectamente. Los cambios deberán quedar reflejados en la documentación correspondiente.

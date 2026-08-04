# SARGAP — Visión del proyecto

## 1. ¿Qué es SARGAP?

SARGAP (Sistema de Acceso, Registro y Gestión Automático de Personas) es un sistema orientado a la gestión de personas, accesos, presencia y actividad dentro de una organización.

Su propósito es conectar dispositivos físicos de identificación y control de acceso con un sistema de software capaz de registrar, procesar y presentar información sobre las personas y los espacios de una institución.

SARGAP fue concebido inicialmente para su aplicación en instituciones educativas, pero su diseño busca permitir que el sistema pueda adaptarse posteriormente a otros entornos, como empresas, oficinas, fábricas, hospitales u otras organizaciones que necesiten gestionar personas y espacios.

La idea central de SARGAP no es únicamente controlar una puerta. El sistema debe ser capaz de transformar los acontecimientos que ocurren físicamente dentro de una organización —por ejemplo, una persona identificándose en un aula— en información digital que pueda ser almacenada, procesada, consultada y utilizada para tomar decisiones.

---

## 2. Problema que busca resolver

En una institución existen continuamente acontecimientos relacionados con personas y espacios:

* personas que ingresan o abandonan determinados lugares;
* personas que llegan tarde o están ausentes;
* personas que tienen autorización para acceder a determinados espacios;
* cambios de aula o de horario;
* accesos a lugares restringidos;
* movimientos que necesitan quedar registrados;
* situaciones que requieren una alerta o intervención;
* información que distintos responsables necesitan consultar.

Cuando estos procesos se realizan manualmente, pueden requerir tiempo, depender de la intervención de otras personas y generar información fragmentada.

SARGAP busca automatizar una parte de estos procesos y centralizar la información generada, de manera que la organización pueda obtener una visión más clara de lo que ocurre dentro de sus instalaciones.

---

## 3. Concepto general de funcionamiento

SARGAP se basa en la interacción entre personas, dispositivos físicos, espacios y un sistema central de software.

Una persona puede identificarse mediante un mecanismo de identificación compatible con SARGAP. El sistema debe poder determinar quién es la persona, qué dispositivo o espacio está involucrado y qué condiciones se aplican en ese momento.

A partir de esa información, SARGAP puede:

1. identificar a la persona;
2. determinar el contexto del acceso;
3. comprobar las autorizaciones correspondientes;
4. registrar el acontecimiento;
5. permitir o impedir una acción física cuando corresponda;
6. generar una alerta cuando se cumplan determinadas condiciones;
7. poner la información resultante a disposición de los usuarios autorizados.

El mecanismo concreto de identificación puede evolucionar durante el desarrollo del proyecto. El sistema debe procurar que la lógica general de SARGAP no dependa innecesariamente de una tecnología específica de identificación.

---

## 4. Personas y organizaciones

SARGAP debe representar a las personas que forman parte de una organización y las relaciones que tienen dentro de ella.

Una persona puede tener determinadas características, responsabilidades, relaciones y permisos dependiendo del contexto.

En una institución educativa pueden existir, por ejemplo:

* alumnos;
* profesores;
* preceptores;
* directivos;
* personal administrativo;
* personal de limpieza;
* padres o tutores.

En una empresa podrían existir:

* empleados;
* supervisores;
* gerentes;
* administradores;
* personal de seguridad;
* otros tipos de trabajadores o colaboradores.

SARGAP no debe asumir que todos estos conceptos son universales. La intención es que el sistema pueda representar diferentes tipos de personas y organizaciones sin que su funcionamiento fundamental dependa exclusivamente del ámbito educativo.

---

## 5. Espacios

Los espacios físicos son una parte fundamental del sistema.

Un espacio puede ser un aula, biblioteca, laboratorio, oficina, taller, depósito, sala de profesores, sector de producción u otro lugar perteneciente a una organización.

No todos los espacios necesariamente tienen las mismas reglas.

Por ejemplo, un aula común podría permitir el ingreso de los alumnos que tienen una clase allí, mientras que un laboratorio, una oficina o un depósito podría estar restringido a determinadas personas.

Cada espacio puede estar asociado con uno o más dispositivos capaces de identificar personas y, cuando sea necesario, controlar físicamente el acceso.

---

## 6. Identificación y dispositivos

Los dispositivos físicos de SARGAP constituyen el vínculo entre el sistema digital y el entorno real.

Un dispositivo puede estar instalado en un espacio determinado y debe poder identificarse dentro del sistema.

El sistema debe poder asociar, como mínimo conceptualmente:

```text
Dispositivo
    ↓
Espacio
    ↓
Organización
```

Los dispositivos pueden encargarse de recibir una identificación, comunicarse con el sistema central, proporcionar información contextual y ejecutar acciones físicas cuando corresponda.

La tecnología utilizada para identificar a una persona puede cambiar durante la evolución del proyecto. La visión actual contempla especialmente la posibilidad de utilizar identificación biométrica, aunque la arquitectura debe evitar quedar innecesariamente ligada a un único mecanismo.

---

## 7. Accesos y autorizaciones

Una identificación no implica necesariamente que una persona tenga permiso para acceder a un espacio.

SARGAP debe diferenciar entre:

* quién es una persona;
* dónde está intentando acceder;
* cuándo ocurre el intento;
* qué actividad o situación corresponde en ese momento;
* qué permisos posee la persona;
* cuál es el resultado de la decisión.

Por ejemplo, una persona puede tener acceso a un aula durante una determinada clase, pero no necesariamente a un laboratorio o a una oficina.

Cuando un espacio tenga control físico de acceso, una autorización válida podrá provocar la apertura de la cerradura correspondiente. Una autorización inválida deberá impedir el acceso cuando el espacio cuente con los mecanismos físicos necesarios para hacerlo.

Los intentos de acceso también deben poder registrarse, incluso cuando sean rechazados.

---

## 8. Horarios y contexto

El acceso de una persona no siempre puede evaluarse únicamente a partir de su identidad.

En una institución educativa, una persona puede tener un horario de clases y cada actividad puede estar asociada con un espacio.

Por lo tanto, SARGAP debe contemplar la relación entre:

```text
Persona
   ↓
Actividad / horario
   ↓
Espacio
   ↓
Momento
```

Los horarios pueden cambiar. Una clase puede trasladarse de un aula a otra y una persona puede necesitar acceder temporalmente a otro espacio por una actividad autorizada.

Por este motivo, los horarios y las relaciones entre personas, actividades y espacios deben poder modificarse sin tener que modificar el funcionamiento fundamental del sistema.

---

## 9. Presencia, asistencia y eventos

SARGAP debe registrar acontecimientos relevantes como eventos.

Un evento puede representar, por ejemplo:

* una identificación;
* un acceso autorizado;
* un acceso denegado;
* una entrada a un espacio;
* una salida;
* una alerta;
* otra actividad relevante del sistema.

A partir de estos eventos, el sistema puede generar información de mayor nivel, como asistencia, ausentismo, puntualidad o presencia.

En el ámbito educativo, esto puede permitir que el sistema ayude a registrar automáticamente el presentismo de los alumnos y facilite el seguimiento por parte de profesores, preceptores y directivos.

El objetivo no es necesariamente mostrar permanentemente cada movimiento ocurrido. La información debe poder resumirse de manera útil y, cuando sea necesario, permitir consultar el detalle de los eventos que originaron ese resumen.

---

## 10. Usuarios, roles y permisos

SARGAP debe contar con una plataforma mediante la cual los usuarios autorizados puedan consultar y administrar información.

No todos los usuarios deben poder acceder a la misma información.

El sistema debe contemplar diferentes niveles de acceso según las responsabilidades y permisos de cada usuario.

Por ejemplo, dentro de una institución educativa:

* un alumno podría consultar información relacionada con su curso;
* un padre o tutor podría consultar información de los estudiantes que tenga autorizados;
* un profesor podría consultar información relacionada con sus clases;
* un preceptor podría consultar información de los alumnos o cursos que tenga asignados;
* un directivo podría consultar información institucional más amplia.

La forma concreta en que estos permisos se representen técnicamente debe definirse posteriormente. Esta visión establece únicamente que el acceso a la información debe estar controlado y adaptarse a las responsabilidades de cada usuario.

---

## 11. Plataforma de gestión

La información generada por los dispositivos debe poder ser almacenada y procesada por el sistema central.

SARGAP debe proporcionar una interfaz que permita a los usuarios autorizados consultar la información relevante de manera comprensible.

En el ámbito educativo, por ejemplo, el panel de una persona podría mostrar:

* presentismo y ausentismo;
* horarios;
* aulas correspondientes a sus actividades;
* permisos de acceso;
* información académica cuando el módulo educativo correspondiente exista;
* comunicaciones u otra información institucional.

La interfaz debe priorizar que la información importante pueda comprenderse rápidamente, mientras que los detalles de los acontecimientos registrados puedan consultarse cuando sea necesario.

---

## 12. Adaptabilidad a diferentes organizaciones

SARGAP se plantea como un sistema con un núcleo de funcionalidades generales y posibles módulos específicos para distintos tipos de organizaciones.

El núcleo debería poder manejar conceptos generales como:

* personas;
* organizaciones;
* espacios;
* dispositivos;
* identificaciones;
* accesos;
* autorizaciones;
* horarios;
* eventos;
* usuarios;
* permisos;
* alertas.

A partir de estos conceptos pueden construirse funcionalidades específicas para distintos ámbitos.

Por ejemplo, un módulo educativo podría incorporar:

* alumnos;
* cursos;
* materias;
* profesores;
* calificaciones;
* boletines;
* actas;
* relaciones entre tutores y alumnos;
* otras necesidades propias de una institución educativa.

Un módulo empresarial podría incorporar conceptos diferentes, como:

* empleados;
* departamentos;
* puestos;
* turnos;
* horarios laborales;
* otras necesidades propias de una organización empresarial.

La intención es evitar desarrollar dos sistemas completamente independientes. SARGAP debería evolucionar a partir de un núcleo común y módulos adaptados a cada contexto.

---

## 13. Seguridad y confiabilidad

SARGAP gestiona información relacionada con personas, accesos y actividad dentro de una organización. Por lo tanto, la seguridad y confiabilidad son características importantes del sistema.

El sistema debe procurar:

* restringir el acceso a la información según permisos;
* registrar acontecimientos importantes;
* evitar modificaciones indebidas de los registros;
* mantener la consistencia de la información;
* detectar situaciones que requieran atención;
* continuar funcionando de forma controlada ante fallos de comunicación cuando sea posible.

Los mecanismos concretos para alcanzar estos objetivos serán definidos durante el diseño técnico y podrán evolucionar a medida que el proyecto avance.

---

## 14. Evolución del proyecto

SARGAP se encuentra en desarrollo y su implementación puede cambiar a medida que se incorporen nuevos conocimientos, pruebas y necesidades.

Las tecnologías utilizadas para identificación, comunicación, almacenamiento, procesamiento, interfaz y hardware no forman parte de la definición fundamental de SARGAP.

Por esta razón, una decisión tecnológica concreta puede ser reemplazada posteriormente si existe una alternativa más adecuada, sin que eso implique cambiar la finalidad general del sistema.

El proyecto debe evolucionar de manera incremental, comenzando por un prototipo funcional y ampliando posteriormente sus capacidades.

La versión inicial estará orientada principalmente a demostrar el funcionamiento de SARGAP en un contexto educativo. Las funcionalidades destinadas a empresas u otros tipos de organizaciones forman parte de la visión de crecimiento del proyecto y no necesariamente del primer prototipo.

---

## 15. Principio general

La idea central de SARGAP puede resumirse de la siguiente manera:

> **SARGAP busca convertir los acontecimientos relacionados con personas, espacios y accesos dentro de una organización en información confiable, organizada y útil para su gestión.**

El sistema debe conectar el mundo físico con el digital, permitiendo identificar personas, comprender su contexto, aplicar las autorizaciones correspondientes, registrar los acontecimientos y presentar la información de acuerdo con las necesidades y responsabilidades de cada usuario.

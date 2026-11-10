package com.sargap.controller;

import com.sargap.model.UsuarioRfid;
import com.sargap.repository.UsuarioRfidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


/**
 * CONTROLADOR DE ACCESO API REST
 *
 * ¿QUÉ HACE?: Centraliza y gestiona los puntos de entrada (endpoints) para las peticiones HTTP del ESP32 y la Web.
 *
 * ¿CÓMO LO HACE?:
 * - @RestController: Spring intercepta las peticiones HTTP entrantes, ejecuta los métodos correspondientes y
 *   transforma automáticamente los objetos de retorno en formato JSON utilizando internamente la librería Jackson.
 * - @RequestMapping("/api/v1/acceso"): Establece un prefijo de ruta para organizar los controladores por versiones.
 * - @CrossOrigin(origins = "*"): Agrega las cabeceras "Access-Control-Allow-Origin" a la respuesta HTTP saliente.
 *
 * ¿POR QUÉ SE HACE ASÍ?: Separar la lógica de red (Controller) de la lógica de datos (Repository) sigue el patrón
 * de arquitectura MVC (nodelo vista-controlador). El control de versiones (v1) evita que futuros cambios rompan los dispositivos ESP32 que ya
 * estén instalados en producción. Permitir CORS (*) es mandatorio para que un navegador no bloquee las llamadas hechas
 * desde un dominio o puerto distinto al del servidor (como un frontend local de React/Angular).
 */
@RestController
@RequestMapping("/api/v1/acceso")
@CrossOrigin(origins = "*") // Clave para evitar errores de CORS en tu Sitio Web
public class AccesoController {

    /**
     * INYECCIÓN DE DEPENDENCIAS (CAPA DE DATOS)
     *
     * ¿QUÉ HACE?: Conecta este controlador con el repositorio que habla directamente con la base de datos PostgreSQL.
     *
     * ¿CÓMO LO HACE?: Al arrancar la aplicación, el contenedor de inversión de control (IoC) de Spring busca una clase
     * que implemente 'UsuarioRfidRepository', crea una instancia única (Singleton) en memoria y la asigna automáticamente
     * a esta variable privada sin necesidad de usar un operador 'new'.
     *
     * ¿POR QUÉ SE HACE ASÍ?: Evita el acoplamiento fuerte entre clases. Al no instanciar el repositorio manualmente, el
     * código es más fácil de mantener, consume menos memoria y permite realizar pruebas unitarias (mocking) de manera eficiente.
     */
    @Autowired
    private UsuarioRfidRepository usuarioRfidRepository;

    /**
     * ENDPOINT 1: VERIFICACIÓN DE TARJETA RFID (METODO POST)
     *
     * ¿QUÉ HACE?: Valida si un código UID enviado por el ESP32 está registrado y tiene permisos de apertura.
     *
     * ¿CÓMO LO HACE?:
     * - @PostMapping("/verificar"): Mapea peticiones de tipo POST en la URL compuesta /api/v1/acceso/verificar.
     * - @RequestBody Map<String, String> request: Toma el flujo de bytes del JSON que envía el ESP32 (ej: {"uid": "A1B2C3D4"})
     *   y lo convierte en un mapa estructurado de clave y valor en Java.
     *
     * ¿POR QUÉ SE HACE ASÍ?: Se usa un metodo POST y no un GET porque el ESP32 está enviando datos en el cuerpo (body) de la
     * petición para realizar una acción de procesamiento. Los mapas temporales (HashMap) facilitan construir respuestas JSON
     * dinámicas y asimétricas sobre la marcha sin obligar a crear una clase DTO formal para cada variante de respuesta.
     */

    // 1. Endpoint para el ESP32: Verifica el UID del RFID
    @PostMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificarAcceso(@RequestBody Map<String, String> request) {
        String uid = request.get("uid");
        Map<String, Object> response = new HashMap<>();

        // Busca el UID ingresado en la base de datos de Postgres
        Optional<UsuarioRfid> usuarioOpt = usuarioRfidRepository.findByUidIgnoreCase(uid);

        if (usuarioOpt.isPresent()) {

            UsuarioRfid usuario = usuarioOpt.get();
            response.put("uid", uid);
            response.put("autorizado", usuario.isTieneAcceso());
            response.put("nombre", usuario.getNombre());
            response.put("mensaje", usuario.isTieneAcceso() ? "Acceso Permitido" : "Acceso Denegado");
        } else {
            // Si la tarjeta no existe en la BDD
            response.put("uid", uid);
            response.put("autorizado", false);
            response.put("nombre", "Desconocido");
            response.put("mensaje", "Tarjeta no registrada");
        }

        return ResponseEntity.ok(response);
    }

    // 2. Endpoint para el Frontend Web: Lista todos los usuarios registrados
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioRfid>> listarUsuarios() {
        List<UsuarioRfid> usuarios = usuarioRfidRepository.findAll();
        return ResponseEntity.ok(usuarios);
    }
}

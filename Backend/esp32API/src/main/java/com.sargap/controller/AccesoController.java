package com.sargap.controller;

import com.sargap.model.RegistroAcceso;
import com.sargap.model.UsuarioRfid;
import com.sargap.repository.RegistroAccesoRepository;
import com.sargap.repository.UsuarioRfidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/acceso")
@CrossOrigin(origins = "*")
public class AccesoController {

    @Autowired
    private UsuarioRfidRepository usuarioRfidRepository;

    @Autowired
    private RegistroAccesoRepository registroAccesoRepository;

    // 1. Endpoint para el ESP32: Verifica el UID y guarda el registro
    @PostMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificarAcceso(@RequestBody Map<String, String> request) {
        String uid = request.get("uid");
        String lector = request.get("lector");
        String fechaHoraRtc = request.get("fechaHora");

        Map<String, Object> response = new HashMap<>();
        Optional<UsuarioRfid> usuarioOpt = usuarioRfidRepository.findByUidIgnoreCase(uid);

        boolean autorizado = false;
        String nombre = "Desconocido";
        String rol = "Sin rol"; // Valor por defecto si la tarjeta no existe
        String mensaje = "Tarjeta no registrada";

        if (usuarioOpt.isPresent()) {
            UsuarioRfid usuario = usuarioOpt.get();
            autorizado = usuario.isTieneAcceso();
            nombre = usuario.getNombre();
            rol = usuario.getRol() != null ? usuario.getRol() : "Sin rol";
            mensaje = autorizado ? "Acceso Permitido" : "Acceso Denegado";
        }

        // Crea y guarda el registro en PostgreSQL usando tu constructor
        RegistroAcceso registro = new RegistroAcceso(uid, nombre, rol, lector, autorizado, fechaHoraRtc);
        registroAccesoRepository.save(registro);

        response.put("uid", uid);
        response.put("autorizado", autorizado);
        response.put("nombre", nombre);
        response.put("mensaje", mensaje);

        return ResponseEntity.ok(response);
    }

    // 2. Endpoint para el Frontend Web: Lista todos los usuarios registrados
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioRfid>> listarUsuarios() {
        List<UsuarioRfid> usuarios = usuarioRfidRepository.findAll();
        return ResponseEntity.ok(usuarios);
    }
    // 3. Endpoint para crear un nuevo usuario RFID desde la Web
    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, String> payload) {
        String nombre = payload.get("nombre") != null ? payload.get("nombre").trim() : "";
        String apellido = payload.get("apellido") != null ? payload.get("apellido").trim() : "";
        String uid = payload.get("uid") != null ? payload.get("uid").trim().toUpperCase() : "";
        String rol = payload.get("rol") != null ? payload.get("rol").trim() : "Visitante";

        // Validación de campos obligatorios
        if (nombre.isEmpty() || apellido.isEmpty() || uid.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nombre, apellido y UID son obligatorios."));
        }

        // Verifica que nombre y apellido solo contengan letras, acentos, ñ y espacios
        if (!nombre.matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$") || !apellido.matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s]+$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre y el apellido solo pueden contener letras."));
        }


        // Validación de UID duplicado (ignorando mayúsculas/minúsculas)
        if (usuarioRfidRepository.findByUidIgnoreCase(uid).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "Ese UID ya está registrado en el sistema."));
        }

        UsuarioRfid nuevoUsuario = new UsuarioRfid();
        nuevoUsuario.setNombre(nombre + " " + apellido);
        nuevoUsuario.setUid(uid);
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setEspaciosHabilitados("Acceso General"); // Solo baño y espacios comunes por defecto
        nuevoUsuario.setTieneAcceso(true); // Activo para Acceso General

        usuarioRfidRepository.save(nuevoUsuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // 4. Endpoint para editar rol, espacios habilitados y estado de acceso de un usuario
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<UsuarioRfid> usuarioOpt = usuarioRfidRepository.findById(id);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UsuarioRfid usuario = usuarioOpt.get();
        if (payload.containsKey("rol")) {
            usuario.setRol((String) payload.get("rol"));
        }
        if (payload.containsKey("espaciosHabilitados")) {
            usuario.setEspaciosHabilitados((String) payload.get("espaciosHabilitados"));
        }
        if (payload.containsKey("tieneAcceso")) {
            usuario.setTieneAcceso((Boolean) payload.get("tieneAcceso"));
        }

        usuarioRfidRepository.save(usuario);
        return ResponseEntity.ok(usuario);
    }


}

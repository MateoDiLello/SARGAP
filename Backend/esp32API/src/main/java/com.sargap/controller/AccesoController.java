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
}

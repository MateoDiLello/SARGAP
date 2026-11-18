package com.sargap.controller;

import com.sargap.model.RegistroAcceso;
import com.sargap.repository.RegistroAccesoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registros")
@CrossOrigin(origins = "*")
public class RegistroController {

    @Autowired
    private RegistroAccesoRepository registroAccesoRepository;

    @GetMapping
    public ResponseEntity<List<RegistroAcceso>> listarRegistros() {
        List<RegistroAcceso> registros = registroAccesoRepository.findAllByOrderByFechaHoraDesc();
        return ResponseEntity.ok(registros);
    }
}

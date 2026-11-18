package com.sargap.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "registros_acceso") // Nombre exacto que tendrá la tabla en PostgreSQL
public class RegistroAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;
    private String usuario;
    private String rol;
    private String lector;
    private boolean permitido;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    // 1. Constructor vacío (obligatorio para Hibernate)
    public RegistroAcceso() {
    }

    // 2. Constructor con datos (convierte la fecha del RTC del ESP32 a formato de base de datos)
    public RegistroAcceso(String uid, String usuario, String rol, String lector, boolean permitido, String fechaHoraRtc) {
        this.uid = uid;
        this.usuario = usuario;
        this.rol = rol;
        this.lector = lector;
        this.permitido = permitido;

        if (fechaHoraRtc != null && !fechaHoraRtc.isEmpty()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            this.fechaHora = LocalDateTime.parse(fechaHoraRtc, formatter);
        } else {
            this.fechaHora = LocalDateTime.now();
        }
    }

    // 3. Getters y Setters (para que Spring pueda transformar esta clase a JSON)
    public Long getId() { return id; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getLector() { return lector; }
    public void setLector(String lector) { this.lector = lector; }

    public boolean isPermitido() { return permitido; }
    public void setPermitido(boolean permitido) { this.permitido = permitido; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}

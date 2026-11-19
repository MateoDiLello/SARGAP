package com.sargap.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios_rfid")
public class UsuarioRfid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;

    @Column(name = "tiene_acceso", nullable = false)
    private boolean tieneAcceso;

    @Column(nullable = false)
    private String nombre;

    private String rol;

    @Column(name = "espacios_habilitados")
    private String espaciosHabilitados;

    public UsuarioRfid() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }

    public boolean isTieneAcceso() { return tieneAcceso; }
    public void setTieneAcceso(boolean tieneAcceso) { this.tieneAcceso = tieneAcceso; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEspaciosHabilitados() { return espaciosHabilitados; }
    public void setEspaciosHabilitados(String espaciosHabilitados) { this.espaciosHabilitados = espaciosHabilitados; }
}
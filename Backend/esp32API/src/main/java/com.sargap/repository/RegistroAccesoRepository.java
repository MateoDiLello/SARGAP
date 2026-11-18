package com.sargap.repository;

import com.sargap.model.RegistroAcceso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroAccesoRepository extends JpaRepository<RegistroAcceso, Long> {

    // Esta es la línea que faltaba declarar:
    List<RegistroAcceso> findAllByOrderByFechaHoraDesc();

}

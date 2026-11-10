package com.sargap.repository;

import com.sargap.model.UsuarioRfid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface UsuarioRfidRepository extends JpaRepository<UsuarioRfid, Long> {
    // Busca en la base de datos comparando el UID ignorando mayúsculas/minúsculas
    Optional<UsuarioRfid> findByUidIgnoreCase(String uid);
}

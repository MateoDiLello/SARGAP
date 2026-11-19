const API_BASE_URL = 'http://localhost:8080/api/v1';

// 1. Variables para controlar las páginas de 15 registros
let todosLosRegistros = [];
let paginaActual = 1;
const REGISTROS_POR_PAGINA = 15;

function obtenerClaseRol(rol) {
  const r = (rol || 'sin rol').toLowerCase();
  if (r.includes('alumno')) return 'rol-alumno';
  if (r.includes('docente') || r.includes('profesor')) return 'rol-docente';
  if (r.includes('preceptor')) return 'rol-preceptor';
  if (r.includes('personal')) return 'rol-personal';
  if (r.includes('directivo') || r.includes('inspector')) return 'rol-directivo';
  if (r.includes('visitante')) return 'rol-visitante';
  return 'rol-sin-rol';
}

function formatearFechaHora(fechaIso, claseDot = '') {
  const dotHtml = claseDot ? `<span class="dot ${claseDot}" style="margin-right: 2px;"></span>` : '';
  if (!fechaIso) return `<span class="fecha-contenedor">${dotHtml}<span class="fecha-dia">-</span></span>`;

  const limpia = fechaIso.replace('T', ' ').slice(0, 19);
  const [fechaParte, horaParte] = limpia.split(' ');

  if (!fechaParte || !horaParte) return `<span class="fecha-contenedor">${dotHtml}<span class="fecha-dia">${limpia}</span></span>`;

  const [anio, mes, dia] = fechaParte.split('-');
  const horaCorta = horaParte.slice(0, 5);

  return `
    <span class="fecha-contenedor">
      ${dotHtml}
      <span class="fecha-dia">${dia}/${mes}/${anio}</span>
      <span class="fecha-hora">${horaCorta} hs</span>
    </span>
  `;
}


// Descarga los registros desde Java (ya vienen ordenados del más nuevo al más viejo)
async function cargarRegistros() {
  const tbody = document.getElementById('cuerpo-registros');

  try {
    const respuesta = await fetch(`${API_BASE_URL}/registros`);
    const datos = await respuesta.json();

    // Guardamos los datos tal como vienen de Java (sin .reverse())
    todosLosRegistros = datos;

    const totalPaginas = Math.max(1, Math.ceil(todosLosRegistros.length / REGISTROS_POR_PAGINA));
    if (paginaActual > totalPaginas) {
      paginaActual = 1;
    }

    renderizarTablaRegistros();

  } catch (error) {
    console.error('Error al obtener registros:', error);
    tbody.innerHTML = '<tr><td colspan="6">No se pudieron cargar los registros del servidor.</td></tr>';
  }
}

// Dibuja únicamente los 15 registros de la página actual
function renderizarTablaRegistros() {
  const tbody = document.getElementById('cuerpo-registros');
  tbody.innerHTML = '';

  if (todosLosRegistros.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">Aún no hay lecturas registradas desde el ESP32.</td></tr>';
    document.getElementById('contador-registros').textContent = 'Mostrando 0 registros';
    const pagContenedor = document.getElementById('paginacion-registros');
    if (pagContenedor) pagContenedor.innerHTML = '';
    return;
  }

  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const fin = inicio + REGISTROS_POR_PAGINA;
  const registrosPagina = todosLosRegistros.slice(inicio, fin);

  registrosPagina.forEach(reg => {
    const claseDot = reg.permitido ? 'dot-verde' : 'dot-rojo';
    const claseRol = obtenerClaseRol(reg.rol);
    const badgeResultado = reg.permitido
      ? `<span class="badge-resultado res-permitido">✔ Acceso Permitido</span>`
      : `<span class="badge-resultado res-denegado">✖ Acceso Denegado</span>`;

    const fechaHtml = formatearFechaHora(reg.fechaHora);

    const fila = `
      <tr>
        <td><span class="dot ${claseDot}"></span>${fechaHtml}</td>
        <td><code>${reg.uid || '-'}</code></td>
        <td><strong>${reg.usuario || 'Desconocido'}</strong></td>
        <td><span class="badge-rol ${claseRol}">${reg.rol || 'Sin rol'}</span></td>
        <td>${reg.lector || 'Entrada Principal'}</td>
        <td>${badgeResultado}</td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });

  const mostrandoHasta = Math.min(fin, todosLosRegistros.length);
  document.getElementById('contador-registros').textContent =
    `Mostrando ${inicio + 1}-${mostrandoHasta} de ${todosLosRegistros.length} registros`;

  renderizarBotonesPaginacion();
}

// Dibuja los botones 1 2 3 ... abajo a la derecha
function renderizarBotonesPaginacion() {
  const contenedor = document.getElementById('paginacion-registros');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  const totalPaginas = Math.ceil(todosLosRegistros.length / REGISTROS_POR_PAGINA);
  if (totalPaginas <= 1) return;

  const paginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (
      i === 1 ||
      i === totalPaginas ||
      (i >= paginaActual - 1 && i <= paginaActual + 1)
    ) {
      paginas.push(i);
    } else if (paginas[paginas.length - 1] !== '...') {
      paginas.push('...');
    }
  }

  paginas.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.className = 'paginacion-puntos';
      span.textContent = '...';
      contenedor.appendChild(span);
    } else {
      const btn = document.createElement('button');
      btn.className = `btn-pagina ${p === paginaActual ? 'activa' : ''}`;
      btn.textContent = p;
      btn.addEventListener('click', () => {
        paginaActual = p;
        renderizarTablaRegistros();
      });
      contenedor.appendChild(btn);
    }
  });
}

// Carga la lista de usuarios desde Java y los dibuja en la tabla
// REEMPLAZÁ LA FUNCIÓN cargarUsuarios() POR ESTA COMPLETA O AJUSTÁ EL BUCLE:

async function cargarUsuarios() {
  const tbody = document.getElementById('cuerpo-usuarios');

  try {
    const respuesta = await fetch(`${API_BASE_URL}/acceso/usuarios`);
    const usuarios = await respuesta.json();

    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const claseDot = u.tieneAcceso ? 'dot-verde' : 'dot-rojo';
      const claseRol = obtenerClaseRol(u.rol);
      const userJson = encodeURIComponent(JSON.stringify(u));

      // --- LÓGICA NUEVA PARA CÁPSULA INTERACTIVA ---
      const espaciosTexto = u.espaciosHabilitados || 'Acceso General';
      const listaEspacios = espaciosTexto.split(',').map(s => s.trim()).filter(s => s.length > 0);

      let columnaEspaciosHtml = '';

      if (listaEspacios.includes('Acceso Total')) {
        columnaEspaciosHtml = `<span class="mini-badge-espacio total">✨ Acceso Total</span>`;
      } else {
        const badgesHtml = listaEspacios
          .map(espacio => `<span class="mini-badge-espacio">${espacio}</span>`)
          .join('');

        columnaEspaciosHtml = `
          <div class="espacios-wrapper">
            <button type="button" class="btn-espacios-pill" onclick="toggleEspacios(this)">
              <span>Espacios</span>
              <span class="pill-count">${listaEspacios.length}</span>
              <svg class="pill-chevron" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="espacios-panel">
              <div class="badge-espacios-container">
                ${badgesHtml}
              </div>
            </div>
          </div>
        `;
      }
      // ----------------------------------------

      const fila = `
        <tr>
          <td><span class="dot ${claseDot}"></span>${u.uid || '-'}</td>
          <td><strong>${u.nombre || 'Sin nombre'}</strong></td>
          <td><span class="badge-rol ${claseRol}">${u.rol || 'Sin rol'}</span></td>
          <td>${columnaEspaciosHtml}</td>
          <td>
            <button type="button" onclick="abrirModalUsuario('${userJson}')" class="btn-editar-tabla">
              Editar
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });


    document.getElementById('contador-usuarios').textContent =
      `Mostrando ${usuarios.length} usuarios registrados`;

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    tbody.innerHTML = '<tr><td colspan="5">No se pudieron cargar los datos del servidor.</td></tr>';
  }
}


function abrirModalUsuario(userEncoded) {
  const u = JSON.parse(decodeURIComponent(userEncoded));
  document.getElementById('modal-usuario-id').value = u.id;
  document.getElementById('modal-nombre-usuario').textContent = u.nombre;
  document.getElementById('modal-input-nombre').value = u.nombre || '';
  document.getElementById('modal-input-uid').value = u.uid || '';
  document.getElementById('modal-rol').value = u.rol || 'Visitante';
  document.getElementById('modal-tiene-acceso').checked = u.tieneAcceso;

  const actuales = (u.espaciosHabilitados || 'Acceso General').split(',').map(s => s.trim());
  const chkTotal = document.getElementById('chk-acceso-total');
  const chksIndividuales = document.querySelectorAll('.chk-espacio');

  chkTotal.checked = actuales.includes('Acceso Total');
  chksIndividuales.forEach(chk => {
    chk.checked = !chkTotal.checked && actuales.includes(chk.value);
    chk.disabled = chkTotal.checked;
  });

  document.getElementById('modal-editar-usuario').style.display = 'flex';
}

function abrirModalUsuario(userEncoded) {
  const u = JSON.parse(decodeURIComponent(userEncoded));
  document.getElementById('modal-usuario-id').value = u.id;
  document.getElementById('modal-nombre-usuario').textContent = u.nombre;
  document.getElementById('modal-input-nombre').value = u.nombre || '';
  document.getElementById('modal-input-uid').value = u.uid || '';
  document.getElementById('modal-rol').value = u.rol || 'Visitante';
  document.getElementById('modal-tiene-acceso').checked = u.tieneAcceso;

  const actuales = (u.espaciosHabilitados || 'Acceso General').split(',').map(s => s.trim());
  const chkTotal = document.getElementById('chk-acceso-total');
  const chksIndividuales = document.querySelectorAll('.chk-espacio');

  chkTotal.checked = actuales.includes('Acceso Total');
  chksIndividuales.forEach(chk => {
    chk.checked = !chkTotal.checked && actuales.includes(chk.value);
    chk.disabled = chkTotal.checked;
  });

  document.getElementById('modal-editar-usuario').style.display = 'flex';
}

async function guardarCambiosUsuario() {
  const id = document.getElementById('modal-usuario-id').value;
  const nombre = document.getElementById('modal-input-nombre').value.trim();
  const uid = document.getElementById('modal-input-uid').value.trim().toUpperCase();
  const rol = document.getElementById('modal-rol').value;
  const tieneAcceso = document.getElementById('modal-tiene-acceso').checked;

  let espacios = [];
  if (document.getElementById('chk-acceso-total').checked) {
    espacios.push('Acceso Total');
  } else {
    document.querySelectorAll('.chk-espacio:checked').forEach(chk => espacios.push(chk.value));
  }

  const payload = {
    nombre,
    uid,
    rol,
    espaciosHabilitados: espacios.length > 0 ? espacios.join(', ') : 'Sin acceso',
    tieneAcceso
  };

  try {
    const resp = await fetch(`${API_BASE_URL}/acceso/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (resp.ok) {
      cerrarModalUsuario();
      cargarUsuarios();
    } else {
      alert(data.error || 'Error al guardar los cambios.');
    }
  } catch (error) {
    alert('No se pudo conectar con la API.');
  }
}

async function eliminarUsuarioActual() {
  const id = document.getElementById('modal-usuario-id').value;
  const nombre = document.getElementById('modal-input-nombre').value;

  if (!confirm(`¿Estás seguro de que querés eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    const resp = await fetch(`${API_BASE_URL}/acceso/usuarios/${id}`, {
      method: 'DELETE'
    });

    if (resp.ok) {
      cerrarModalUsuario();
      cargarUsuarios();
    } else {
      alert('No se pudo eliminar el usuario.');
    }
  } catch (error) {
    alert('Error de conexión con el servidor.');
  }
}

function cerrarModalUsuario() {
  document.getElementById('modal-editar-usuario').style.display = 'none';
}

// Si se marca "Acceso Total", deshabilita los checkboxes individuales
document.getElementById('chk-acceso-total')?.addEventListener('change', (e) => {
  const marcado = e.target.checked;
  document.querySelectorAll('.chk-espacio').forEach(chk => {
    chk.disabled = marcado;
    if (marcado) chk.checked = false;
  });
});

async function guardarCambiosUsuario() {
  const id = document.getElementById('modal-usuario-id').value;
  const rol = document.getElementById('modal-rol').value;
  const tieneAcceso = document.getElementById('modal-tiene-acceso').checked;

  let espacios = [];
  if (document.getElementById('chk-acceso-total').checked) {
    espacios.push('Acceso Total');
  } else {
    document.querySelectorAll('.chk-espacio:checked').forEach(chk => espacios.push(chk.value));
  }

  const payload = {
    rol: rol,
    espaciosHabilitados: espacios.length > 0 ? espacios.join(', ') : 'Sin acceso',
    tieneAcceso: tieneAcceso
  };

  try {
    const resp = await fetch(`${API_BASE_URL}/acceso/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      cerrarModalUsuario();
      cargarUsuarios();
    } else {
      alert('Error al guardar los cambios en el servidor.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('No se pudo conectar con la API.');
  }
}


function mostrarMensajeFormulario(texto, esError) {
  const msgEl = document.getElementById('mensaje-form-usuario');
  msgEl.textContent = texto;
  msgEl.style.color = esError ? '#dc2626' : '#16a34a';
  msgEl.style.display = 'block';
}

function inicializarFormularioUsuario() {
  const form = document.getElementById('form-nuevo-usuario');
  if (!form) return;

  // 1. Botón para capturar el último UID leído por el ESP32 (afuera del submit)
  const btnCapturar = document.getElementById('btn-capturar-uid');
  if (btnCapturar) {
    btnCapturar.addEventListener('click', async () => {
      await cargarRegistros(); // Refresca para traer la última lectura al instante
      if (todosLosRegistros.length > 0 && todosLosRegistros[0].uid) {
        document.getElementById('input-uid').value = todosLosRegistros[0].uid;
        mostrarMensajeFormulario(`📡 UID ${todosLosRegistros[0].uid} capturado de la última lectura.`, false);
      } else {
        mostrarMensajeFormulario('⚠️ Todavía no hay ninguna tarjeta escaneada en el historial.', true);
      }
    });
  }

  // 2. Envío del formulario para registrar usuario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('input-nombre').value.trim();
    const apellido = document.getElementById('input-apellido').value.trim();
    const uid = document.getElementById('input-uid').value.trim().toUpperCase();
    const rol = document.getElementById('input-rol').value;

    // Validar campos vacíos
    if (!nombre || !apellido) {
      mostrarMensajeFormulario('⚠️ Por favor completá Nombre/s y Apellido/s.', true);
      return;
    }
    if (!uid) {
      mostrarMensajeFormulario('⚠️ Debés ingresar el código UID de la tarjeta.', true);
      return;
    }

    // Solo permite letras (incluyendo acentos y ñ) y espacios
    const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!soloLetrasRegex.test(nombre) || !soloLetrasRegex.test(apellido)) {
      mostrarMensajeFormulario('⚠️ El nombre y el apellido solo pueden contener letras.', true);
      return;
    }

    // Enviar petición POST al backend
    try {
      const respuesta = await fetch(`${API_BASE_URL}/acceso/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, uid, rol })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensajeFormulario(`✖ ${data.error || 'Error al registrar usuario.'}`, true);
        return;
      }

      form.reset();
      mostrarMensajeFormulario(`✔ Usuario ${data.nombre} registrado con Acceso General.`, false);
      cargarUsuarios();

    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeFormulario('✖ No se pudo conectar con el servidor Java.', true);
    }
  });
}


function toggleEspacios(boton) {
  const estabaAbierto = boton.classList.contains('abierto');

  document.querySelectorAll('.btn-espacios-pill.abierto').forEach(btn => {
    btn.classList.remove('abierto');
    btn.nextElementSibling?.classList.remove('abierto');
  });

  if (!estabaAbierto) {
    boton.classList.add('abierto');
    boton.nextElementSibling?.classList.add('abierto');
  }
}



// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarRegistros();
  cargarUsuarios();
  inicializarFormularioUsuario(); // <-- ESTA LÍNEA ES OBLIGATORIA PARA QUE EL FORMULARIO FUNCIONE

  document.getElementById('btn-actualizar').addEventListener('click', () => {
    cargarRegistros();
    cargarUsuarios();
  });

  setInterval(cargarRegistros, 3000); // Cada 3 segundos es ideal para ver lecturas en vivo sin saturar
});


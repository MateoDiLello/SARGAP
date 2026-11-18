const API_BASE_URL = 'http://localhost:8080/api/v1';

// 1. Variables para controlar las páginas de 15 registros
let todosLosRegistros = [];
let paginaActual = 1;
const REGISTROS_POR_PAGINA = 15;

function obtenerClaseRol(rol) {
  const r = (rol || 'sin rol').toLowerCase();
  if (r === 'docente') return 'rol-docente';
  if (r === 'personal') return 'rol-personal';
  if (r === 'preceptor') return 'rol-preceptor';
  if (r === 'alumno') return 'rol-alumno';
  return 'rol-sin-rol';
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

    const fechaLimpia = reg.fechaHora ? reg.fechaHora.replace('T', ' ').slice(0, 19) : '-';

    const fila = `
      <tr>
        <td><span class="dot ${claseDot}"></span>${fechaLimpia}</td>
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

// Carga el padrón de tarjetas registradas desde AccesoController
async function cargarUsuarios() {
  const tbody = document.getElementById('cuerpo-usuarios');

  try {
    const respuesta = await fetch(`${API_BASE_URL}/acceso/usuarios`);
    const usuarios = await respuesta.json();

    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const claseDot = u.tieneAcceso ? 'dot-verde' : 'dot-rojo';
      const claseRol = obtenerClaseRol(u.rol);

      const fila = `
        <tr>
          <td><span class="dot ${claseDot}"></span>${u.uid || '-'}</td>
          <td><strong>${u.nombre || 'Sin nombre'}</strong></td>
          <td><span class="badge-rol ${claseRol}">${u.rol || 'Sin rol'}</span></td>
          <td>${u.espaciosHabilitados || 'Acceso General'}</td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });

    document.getElementById('contador-usuarios').textContent =
      `Mostrando ${usuarios.length} usuarios registrados`;

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    tbody.innerHTML = '<tr><td colspan="4">No se pudieron cargar los datos del servidor.</td></tr>';
  }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarRegistros();
  cargarUsuarios();

  document.getElementById('btn-actualizar').addEventListener('click', () => {
    cargarRegistros();
    cargarUsuarios();
  });

  setInterval(cargarRegistros, 1000);
});

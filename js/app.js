// ===== MODELO DE DATOS =====
const CLAVE_STORAGE = "mi-horario-eventos";

const eventosPorDefecto = [
  {
    id: "evt_001",
    titulo: "Box + correr",
    categoria: "ejercicio",
    diasSemana: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
    horaInicio: "20:00",
    horaFin: "21:45",
    fechaInicio: "2026-07-13",
    fechaFin: "2026-10-13",
    notas: "Rutina de boxeo y carrera"
  },
  {
    id: "evt_002",
    titulo: "Trabajo",
    categoria: "trabajo",
    diasSemana: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
    horaInicio: "07:00",
    horaFin: "19:00",
    fechaInicio: null,
    fechaFin: null,
    notas: "Horario editable, en búsqueda de nuevo empleo"
  },
  {
    id: "evt_003",
    titulo: "Examen",
    categoria: "estudio",
    diasSemana: ["Mie", "Jue", "Vie", "Sab"],
    horaInicio: null,
    horaFin: null,
    fechaInicio: "2026-07-15",
    fechaFin: "2026-07-18",
    notas: "Duración 2h, hora exacta pendiente"
  }
];

function cargarEventos() {
  const guardado = localStorage.getItem(CLAVE_STORAGE);
  if (guardado) {
    return JSON.parse(guardado);
  }
  return eventosPorDefecto;
}

function guardarEventosEnStorage() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(eventos));
}

let eventos = cargarEventos();

console.log("Eventos cargados:", eventos);

// ===== UTILIDADES DE FECHA =====
const diasNombre = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function formatearFecha(date) {
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function obtenerLunesDeEstaSemana() {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0=Dom, 1=Lun...
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + offset);
  return lunes;
}

function generarDiasDeLaSemana() {
  const lunes = obtenerLunesDeEstaSemana();
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + i);
    dias.push({
      nombre: diasNombre[fecha.getDay()],
      fechaStr: formatearFecha(fecha),
      numeroDia: fecha.getDate()
    });
  }
  return dias;
}

// ===== LÓGICA: ¿este evento aplica a este día? =====
function eventoAplicaHoy(evento, dia) {
  const enDiaCorrecto = evento.diasSemana.includes(dia.nombre);
  if (!enDiaCorrecto) return false;

  const dentroDeRango =
    (!evento.fechaInicio || dia.fechaStr >= evento.fechaInicio) &&
    (!evento.fechaFin || dia.fechaStr <= evento.fechaFin);

  return dentroDeRango;
}

// ===== RENDER =====
function renderizarSemana() {
  const contenedor = document.getElementById("vista-semana");
  contenedor.innerHTML = "";

  const dias = generarDiasDeLaSemana();

  dias.forEach(dia => {
    const columna = document.createElement("div");
    columna.className = "dia-columna";

    const titulo = document.createElement("p");
    titulo.className = "dia-titulo";
    titulo.textContent = `${dia.nombre} ${dia.numeroDia}`;
    columna.appendChild(titulo);

    const eventosDeHoy = eventos.filter(ev => eventoAplicaHoy(ev, dia));

    if (eventosDeHoy.length === 0) {
      const vacio = document.createElement("div");
      vacio.className = "evento-bloque vacio";
      vacio.textContent = "Descanso";
      columna.appendChild(vacio);
    } else {
      eventosDeHoy.forEach(ev => {
        const bloque = document.createElement("div");
        bloque.className = `evento-bloque ${ev.categoria}`;
        const horario = ev.horaInicio
          ? `${ev.horaInicio}–${ev.horaFin}`
          : "hora pendiente";
        bloque.innerHTML = `<strong>${ev.titulo}</strong><br>${horario}`;
        bloque.addEventListener("click", () => abrirFormularioEdicion(ev));
        columna.appendChild(bloque);
      });
    }

    contenedor.appendChild(columna);
  });
}

// ===== INICIO =====
renderizarSemana();
document.getElementById("estado-actual").textContent = "Semana de exámenes";
// ===== MANEJO DEL FORMULARIO =====
let idEnEdicion = null;

const modalOverlay = document.getElementById("modal-overlay");
const inputTitulo = document.getElementById("input-titulo");
const inputCategoria = document.getElementById("input-categoria");
const inputHoraInicio = document.getElementById("input-hora-inicio");
const inputHoraFin = document.getElementById("input-hora-fin");
const inputFechaInicio = document.getElementById("input-fecha-inicio");
const inputFechaFin = document.getElementById("input-fecha-fin");
const inputNotas = document.getElementById("input-notas");
const btnEliminar = document.getElementById("btn-eliminar");
const modalTitulo = document.getElementById("modal-titulo");

function limpiarFormulario() {
  inputTitulo.value = "";
  inputCategoria.value = "estudio";
  inputHoraInicio.value = "";
  inputHoraFin.value = "";
  inputFechaInicio.value = "";
  inputFechaFin.value = "";
  inputNotas.value = "";
  document.querySelectorAll("#dias-checkbox input").forEach(cb => cb.checked = false);
}

function abrirFormularioNuevo() {
  idEnEdicion = null;
  limpiarFormulario();
  modalTitulo.textContent = "Nuevo evento";
  btnEliminar.classList.add("oculto");
  modalOverlay.classList.remove("oculto");
}

function abrirFormularioEdicion(evento) {
  idEnEdicion = evento.id;
  modalTitulo.textContent = "Editar evento";
  inputTitulo.value = evento.titulo;
  inputCategoria.value = evento.categoria;
  inputHoraInicio.value = evento.horaInicio || "";
  inputHoraFin.value = evento.horaFin || "";
  inputFechaInicio.value = evento.fechaInicio || "";
  inputFechaFin.value = evento.fechaFin || "";
  inputNotas.value = evento.notas || "";
  document.querySelectorAll("#dias-checkbox input").forEach(cb => {
    cb.checked = evento.diasSemana.includes(cb.value);
  });
  btnEliminar.classList.remove("oculto");
  modalOverlay.classList.remove("oculto");
}

function cerrarFormulario() {
  modalOverlay.classList.add("oculto");
}

function guardarEvento() {
  const diasSeleccionados = Array.from(document.querySelectorAll("#dias-checkbox input:checked"))
    .map(cb => cb.value);

  if (!inputTitulo.value.trim() || diasSeleccionados.length === 0) {
    alert("Ponle un título y selecciona al menos un día.");
    return;
  }

  const eventoData = {
    titulo: inputTitulo.value.trim(),
    categoria: inputCategoria.value,
    diasSemana: diasSeleccionados,
    horaInicio: inputHoraInicio.value || null,
    horaFin: inputHoraFin.value || null,
    fechaInicio: inputFechaInicio.value || null,
    fechaFin: inputFechaFin.value || null,
    notas: inputNotas.value.trim()
  };

  if (idEnEdicion) {
    const index = eventos.findIndex(ev => ev.id === idEnEdicion);
    eventos[index] = { ...eventos[index], ...eventoData };
  } else {
    eventoData.id = "evt_" + Date.now();
    eventos.push(eventoData);
  }

  guardarEventosEnStorage();
  cerrarFormulario();
  renderizarSemana();
}

function eliminarEvento() {
  const index = eventos.findIndex(ev => ev.id === idEnEdicion);
  if (index !== -1) eventos.splice(index, 1);
  guardarEventosEnStorage();
  cerrarFormulario();
  renderizarSemana();
}

document.getElementById("btn-agregar").addEventListener("click", abrirFormularioNuevo);
document.getElementById("btn-cancelar").addEventListener("click", cerrarFormulario);
document.getElementById("btn-guardar").addEventListener("click", guardarEvento);
btnEliminar.addEventListener("click", eliminarEvento);
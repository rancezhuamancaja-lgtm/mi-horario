// ===== MODELO DE DATOS =====
const eventos = [
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
        columna.appendChild(bloque);
      });
    }

    contenedor.appendChild(columna);
  });
}

// ===== INICIO =====
renderizarSemana();
document.getElementById("estado-actual").textContent = "Semana de exámenes";
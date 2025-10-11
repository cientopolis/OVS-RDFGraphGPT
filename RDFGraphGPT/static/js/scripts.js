let selectedPregunta = null;
let selectedQuery = null;
let selectedRespuesta = null;
let selectedId = null;
let selectedTriplets = null;

function updateSelectedQuestionFromData(element) {
  // Esta es la función que se llama desde los botones
  const id = element.getAttribute('data-id');
  const question = element.getAttribute('data-question');
  const sparql = element.getAttribute('data-sparql');
  const response = element.getAttribute('data-response');
  const triplets = element.getAttribute('data-triplets');

  // Actualizar las variables globales
  selectedId = id;
  selectedPregunta = question;
  selectedQuery = sparql;
  selectedRespuesta = response;
  selectedTriplets = triplets ? JSON.parse(triplets.replace(/'/g, '"')) : null;

  // Actualizar la interfaz
  document.getElementById("titulo-pregunta").innerText = question;
  document.getElementById("query-pregunta").innerText = sparql;
  document.getElementById("respuesta-pregunta").textContent = "";

  // Limpiar gráfico anterior
  showNoDataChart("Ejecutá la pregunta para ver la visualización");
}

function updateResponse() {
  if (!selectedRespuesta) {
    alert("Primero seleccioná una pregunta");
    return;
  }
  document.getElementById("respuesta-pregunta").innerText = selectedRespuesta;

  // Generar gráfico basado en la respuesta
  generateChartFromResponse();
}

function generateChartFromResponse() {
  if (selectedId === "001" && selectedTriplets && selectedTriplets.results && selectedTriplets.results.bindings) {
    generateLineChartFromTriplets(selectedTriplets);
  } else if (selectedId === "003" && selectedTriplets && selectedTriplets.results && selectedTriplets.results.bindings) {
    generateNetworkChartFromTriplets(selectedTriplets);
  } else {
    showNoDataChart("Gráfico no disponible para esta pregunta");
  }
}


//logica para loading de botones
const btn = document.getElementById('btn');
const btnCargando = document.getElementById('btnCargando');

// Inicializar gráficos cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
  // Mostrar mensaje inicial en el área de gráficos
  setTimeout(() => {
    showNoDataChart("Ejecutá una pregunta para ver la visualización");
  }, 100);
});




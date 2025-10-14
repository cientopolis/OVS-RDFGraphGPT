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
  clearCurrentChart();
  showNoDataChart("Ejecutá la pregunta para ver la visualización");
}

function updateResponse() {
  if (!selectedRespuesta) {
    alert("Primero seleccioná una pregunta");
    return;
  }

  const respuestaElem = document.getElementById("respuesta-pregunta");
    respuestaElem.innerText = "Ejecutando con el agente de IA...";

    setTimeout(() => {
        respuestaElem.innerText = selectedRespuesta;
        
    }, 1500);
    console.log(selectedRespuesta)
    // Generar gráfico basado en la respuesta
    generateChartFromResponse();
  }
  function generateChartFromResponse() {
    console.log(selectedId);
    if (selectedId === "001" && selectedTriplets && selectedTriplets.results && selectedTriplets.results.bindings) {
      generateLineChartFromTriplets(selectedTriplets);
    } else if (selectedId === "003" && selectedTriplets && selectedTriplets.results && selectedTriplets.results.bindings) {
      generateMapChartFromTriplets(selectedTriplets);
    } else {
      showNoDataChart("Gráfico no disponible para esta pregunta");
    }
  }


function showGraph(){
  const graph = document.getElementById("chart-container");
    graph.scrollIntoView({ behavior: "smooth", block: "center" });
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




// Variable global para mantener referencia al mapa actual
let currentMapChart = null;

// Función para limpiar el gráfico/mapa actual
function clearCurrentChart() {
  // Si hay un mapa activo, destruirlo
  if (currentMapChart && currentMapChart.destroy) {
    currentMapChart.destroy();
    currentMapChart = null;
  }
  
  // Limpiar el contenedor
  if (chartManager) {
    chartManager.clear();
  }
}

// Función mejorada para generar mapa desde triplets
function generateMapChartFromTriplets(triplets) {
  // Limpiar mapa anterior
  clearCurrentChart();
  
  if (!chartManager) {
    initializeChartManager();
  }

  // Crear el nuevo mapa
  currentMapChart = new MapChart(chartManager);
  currentMapChart.create(triplets, {
    defaultZoom: 13,
    markerColor: '#376889ff'
  });
}
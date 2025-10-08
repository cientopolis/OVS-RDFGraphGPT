  let selectedPregunta = null;
  let selectedQuery = null;
  let selectedRespuesta = null;


// Función principal que se llama desde los radio buttons
function updateSelectedQuestionFromData(element) {
    const question = element.getAttribute('data-question');
    const sparql = element.getAttribute('data-sparql');
    const response = element.getAttribute('data-response');
    
    // Actualizar las variables globales
    selectedPregunta = question;
    selectedQuery = sparql;
    selectedRespuesta = response;

    // Actualizar la UI
    document.getElementById("titulo-pregunta").innerText = question;
    document.getElementById("query-pregunta").innerText = sparql;
    document.getElementById("respuesta-pregunta").textContent = "";
}

// Función para mostrar la respuesta (se mantiene igual)
function updateResponse() {
    if (!selectedRespuesta) {
        alert("Primero seleccioná una pregunta");
        return;
    }
    document.getElementById("respuesta-pregunta").innerText = selectedRespuesta;
}

  // Dejo la función original por las dudas
  function updateSelectedQuestion(pregunta, query, respuesta) {
      selectedPregunta = pregunta;
      selectedQuery = query;
      selectedRespuesta = respuesta;

      document.getElementById("titulo-pregunta").innerText = pregunta;
      document.getElementById("query-pregunta").innerText = query;
      document.getElementById("respuesta-pregunta").textContent = respuesta;
  }


  function updateResponse() {
    if (!selectedRespuesta) {
      alert("Primero seleccioná una pregunta");
      return;
    }
    document.getElementById("respuesta-pregunta").innerText = selectedRespuesta;

  }

  //logica para loading de botones
  const btn = document.getElementById('btn');
  const btnCargando = document.getElementById('btnCargando');

  // este btn no existe

  //btn.addEventListener('click', () => {

    //btn.style.display = 'none';
    //btnCargando.style.display = 'inline-block';
  //});
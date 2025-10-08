  let selectedPregunta = null;
  let selectedQuery = null;
  let selectedRespuesta = null;



function updateSelectedQuestionFromData(element) {
  // Esta es la función que se llama desde los botones
    const question = element.getAttribute('data-question');
    const sparql = element.getAttribute('data-sparql');
    const response = element.getAttribute('data-response');
    
    // Actualizar las variables globales
    selectedPregunta = question;
    selectedQuery = sparql;
    selectedRespuesta = response;

    // Actualizar la interfaz
    document.getElementById("titulo-pregunta").innerText = question;
    document.getElementById("query-pregunta").innerText = sparql;
    document.getElementById("respuesta-pregunta").textContent = "";
}


function updateResponse() {
    if (!selectedRespuesta) {
        alert("Primero seleccioná una pregunta");
        return;
    }
    document.getElementById("respuesta-pregunta").innerText = selectedRespuesta;
}

  // Dejo la función original por las dudas. Deprecated
  function updateSelectedQuestion(pregunta, query, respuesta) {
      selectedPregunta = pregunta;
      selectedQuery = query;
      selectedRespuesta = respuesta;

      document.getElementById("titulo-pregunta").innerText = pregunta;
      document.getElementById("query-pregunta").innerText = query;
      document.getElementById("respuesta-pregunta").textContent = respuesta;
  }


  //logica para loading de botones
  const btn = document.getElementById('btn');
  const btnCargando = document.getElementById('btnCargando');


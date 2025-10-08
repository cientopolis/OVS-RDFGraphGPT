  let selectedPregunta = null;
  let selectedQuery = null;
  let selectedRespuesta = null;

  function updateSelectedQuestion(pregunta, query, respuesta) {
    console.log(pregunta);
    selectedPregunta = pregunta;
    selectedQuery = query;
    selectedRespuesta = respuesta;

    document.getElementById("titulo-pregunta").innerText = pregunta;
    document.getElementById("query-pregunta").innerText = query;
    document.getElementById("respuesta-pregunta").textContent = "";
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

  btn.addEventListener('click', () => {

    btn.style.display = 'none';
    btnCargando.style.display = 'inline-block';
  });
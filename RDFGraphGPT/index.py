from typing import List
from flask import Flask, request, render_template, url_for
from RDFGraphGPT import (
    generate_graph,
    generate_graph_having_rdf,
    search_file,
    get_files_in_directory,
    generate_ovs_graph,
)
from RDFGraphGPT import graph_from_file as gff
import os
import json

from RDFGraphGPT.preguntas_ovs import PreguntaOVS

app = Flask(__name__)
app.config["DEBUG"] = True
nombre_grafo = "grafo_la_plata_mini"
nombre_grafo_instancia = "grafo_lp_con_nueva_inst"
texto_area_value = """
    _ Terreno en venta ubicado en el barrio semi cerrado La Emilia sobre calle 132 Bis entre 474 y 476  (City Bell, La Plata, Buenos Aires) Con disposición interna y orientación al sur.
    _ De medidas regulares, cuenta con 9mts de frente por 22mts de fondo, contabilizando una superficie total aproximada de 208mts2.
    _ Acceso por calle de tierra mejorada y con los servicios de electricidad, agua corriente y gas natural disponibles en el lugar.
    Yacoub | Construimos Confianza
    Innovación | Calidad | Sustentabilidad | Diseño
    70 Mil Metros Cuadrados | 23 Torres.

"""

@app.route("/", methods=["GET"])
def ovs_home():
    files = get_files_in_directory("results")
    rdf_text = search_file(nombre_grafo)
    
    place = "SAME"
    svg_url = url_for('static', filename='archivo.svg')
    exception = gff(nombre_grafo)

    if exception:
        return render_template('edit.html', rdf_text=rdf_text, error=exception, files=files)
    else:
        return render_template('ovs_home.html', graph=svg_url)

# @app.route("/", methods=["GET", "POST"])
# def graph():
#     if request.method == "POST":
#         # Obtiene los datos del formulario
#         form_data = request.form
#         text = form_data.get("text")
#         place = "DIFFERENT"
#         file_name = form_data.get("file-name")
#         svg_url = url_for("static", filename="archivo.svg")

#         exception = generate_graph(text, place, file_name)

#         if exception:
#             rdf_text = search_file(file_name)
#             files = get_files_in_directory("results")
#             return render_template(
#                 "edit.html", rdf_text=rdf_text, error=exception, files=files
#             )
#         else:
#             return render_template("graph.html", graph=svg_url)

#     return render_template("index.html")


@app.post("/save-rdf")
def save():
    form_data = request.form
    file_name = form_data.get("file-name")
    rdf_text = form_data.get("rdf-text")

    place = "SAME"

    svg_url = url_for("static", filename="archivo.svg")
    exception = generate_graph_having_rdf(rdf_text, place, file_name)

    if exception:
        files = get_files_in_directory("results")
        return render_template(
            "edit.html", rdf_text=rdf_text, error=exception, files=files
        )
    else:
        return render_template("graph.html", graph=svg_url)


@app.route("/existent", methods=["GET", "POST"])
def graph_existent():
    files = get_files_in_directory("results")
    if request.method == "POST":
        # Obtiene los datos del formulario
        form_data = request.form
        text = form_data.get("text")
        place = "SAME"
        file_name = form_data.get("file-name")
        svg_url = url_for("static", filename="archivo.svg")

        exception = generate_graph(text, place, file_name)

        if exception:
            rdf_text = search_file(file_name)
            return render_template(
                "edit.html", rdf_text=rdf_text, error=exception, files=files
            )
        else:
            return render_template("graph.html", graph=svg_url)

    return render_template("existent.html", files=files)


@app.route("/graph-from-file", methods=["GET", "POST"])
def graph_from_file():
    files = get_files_in_directory("results")
    if request.method == "POST":
        form_data = request.form
        file_name = form_data.get("file-name")
        rdf_text = search_file(file_name)

        place = "SAME"
        svg_url = url_for("static", filename="archivo.svg")
        exception = gff(file_name)

        if exception:
            return render_template(
                "edit.html", rdf_text=rdf_text, error=exception, files=files
            )
        else:
            return render_template("from_file.html", files=files, graph=svg_url)

    return render_template("from_file.html", files=files)


@app.route("/ovs_new_instance", methods=["GET","POST"])
def ovs_new_instance():
    if request.method == "POST":
        place = "SAME" 
        
        file_name = nombre_grafo_instancia
        svg_url = url_for('static', filename='archivo.svg')
        
        exception = gff(file_name);
        
        if exception:
            rdf_text = search_file(file_name)
            files = get_files_in_directory("results")
            return render_template('edit.html', rdf_text=rdf_text, error=exception, files=files)
        else:
            return render_template('graph.html', graph=svg_url)
        
    return render_template('ovs_new_instance.html', nombre_grafo=nombre_grafo, text_area_value=texto_area_value)


@app.route("/questions", methods=["GET", "POST"])
def questions():

    if request.method == "POST":
        # Handle the form submission
        pass

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    json_path = os.path.join(BASE_DIR, "ovs.json")

    print(json_path)

    # Leer el archivo y convertirlo a string
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        json_str = json.dumps(data)


    preguntas = [
        PreguntaOVS(
            id=item.get("id"),
            pregunta=item.get("question"),
            query=item.get("sparql"),
            respuesta=item.get("response_llm"),
            grafo=item.get("triplets"),
        )
        for item in data
    ]

    return render_template("questions.html", preguntas=preguntas)

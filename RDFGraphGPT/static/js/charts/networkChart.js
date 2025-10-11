// networkChart.js - Lógica específica para gráficos de red con D3.js

class NetworkChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
    }

    // Crear gráfico de red
    create(nodes, links, options = {}) {
        const {
            nodeRadius = 8,
            linkDistance = 100,
            nodeColor = '#376889ff',
            linkColor = '#999',
            nodeStroke = '#fff',
            nodeStrokeWidth = 2
        } = options;

        // Inicializar el chart manager
        this.chartManager.initializeChart();
        const { width, height } = this.chartManager.getDimensions();
        const svg = this.chartManager.svg;

        // Crear grupo contenedor para zoom y pan
        const container = svg.append("g")
            .attr("class", "zoom-container");

        // Configurar zoom y pan
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        // Aplicar zoom al SVG principal
        this.chartManager.container.select("svg").call(zoom);

        // Crear simulación de fuerzas
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(linkDistance))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(nodeRadius + 2));

        // Crear enlaces
        const link = container.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke", linkColor)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1);

        // Crear nodos
        const node = container.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", nodeRadius)
            .attr("fill", nodeColor)
            .attr("stroke", nodeStroke)
            .attr("stroke-width", nodeStrokeWidth)
            .call(this.drag(simulation));

        // Agregar etiquetas a los nodos
        const labels = container.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(d => d.label || d.id)
            .style("font-size", "10px")
            .style("text-anchor", "middle")
            .style("fill", "#333");

        // Tooltip
        this.addTooltip(node, nodes);

        // Actualizar posiciones en cada tick de la simulación
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y + nodeRadius + 12);
        });
    }

    // Función de arrastre para los nodos
    drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // Agregar tooltip
    addTooltip(nodeSelection, nodes) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "network-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none");

        nodeSelection
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                let tooltipContent = `<strong>${d.label || d.id}</strong>`;
                if (d.uri) {
                    tooltipContent += `<br/>URI: ${d.uri}`;
                }
                if (d.type) {
                    tooltipContent += `<br/>Tipo: ${d.type}`;
                }

                tooltip.html(tooltipContent)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }
}

// Función específica para generar gráfico de red desde los triplets de la pregunta ID 3
function generateNetworkChartFromTriplets(triplets) {
    if (!chartManager) {
        initializeChartManager();
    }

    const bindings = triplets.results.bindings;
    
    // Procesar los datos para crear nodos y enlaces
    const nodes = [];
    const links = [];

    // Crear nodos a partir de las propiedades inmobiliarias (solo URI)
    bindings.forEach((binding, index) => {
        const realEstateUri = binding.realEstate.value;
        
        // Crear ID único para el nodo
        const nodeId = `property_${index}`;
        const propertyName = realEstateUri.split('#')[1] || `Propiedad ${index + 1}`;

        const node = {
            id: nodeId,
            label: propertyName.replace('real_estate_site3_', 'Prop. '),
            type: 'Propiedad',
            uri: realEstateUri
        };

        nodes.push(node);
    });

    // No hay enlaces - solo nodos individuales

    // Crear el gráfico de red
    const networkChart = new NetworkChart(chartManager);
    networkChart.create(nodes, links, {
        nodeRadius: 8,
        linkDistance: 120,
        nodeColor: '#376889ff',
        linkColor: '#999'
    });
}
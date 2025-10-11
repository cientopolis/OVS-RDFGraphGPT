// lineChart.js - Lógica de gráficos de líneas con D3.js

class ChartManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = d3.select(`#${containerId}`);
        this.margin = { top: 20, right: 30, bottom: 60, left: 80 };
        this.width = 0;
        this.height = 0;
        this.svg = null;
        this.initializeChart();
    }

    initializeChart() {
        // Limpiar contenedor
        this.container.selectAll("*").remove();

        // Obtener dimensiones del contenedor
        const containerNode = this.container.node();
        this.width = containerNode.offsetWidth - this.margin.left - this.margin.right;
        this.height = containerNode.offsetHeight - this.margin.top - this.margin.bottom;

        // Crear SVG
        this.svg = this.container
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    }

    // Gráfico de líneas
    createLineChart(data, options = {}) {
        const {
            xKey = 'x',
            yKey = 'y',
            xLabel = 'X Axis',
            yLabel = 'Y Axis',
            lineColor = '#376889ff'
        } = options;

        // Limpiar gráfico anterior
        this.initializeChart();

        // Escalas
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[xKey]))
            .range([0, this.width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[yKey]))
            .range([this.height, 0]);

        // Línea
        const line = d3.line()
            .x(d => xScale(d[xKey]))
            .y(d => yScale(d[yKey]))
            .curve(d3.curveMonotoneX);

        // Ejes
        const xAxis = d3.axisBottom(xScale);

        // Si los datos tienen información de mes/año, formatear el eje X
        if (data.length > 0 && data[0].year && data[0].month) {
            xAxis.tickFormat(d => {
                const year = Math.floor(d);
                const month = Math.round((d - year) * 12) + 1;
                return `${month}/${year}`;
            });
        }

        this.svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .call(xAxis);

        this.svg.append("g")
            .call(d3.axisLeft(yScale));

        // Etiquetas de ejes
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 5)
            .attr("x", 0 - (this.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text(yLabel);

        this.svg.append("text")
            .attr("transform", `translate(${this.width / 2}, ${this.height + this.margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text(xLabel);

        // Dibujar línea
        this.svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 2)
            .attr("d", line);

        // Puntos
        this.svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d[xKey]))
            .attr("cy", d => yScale(d[yKey]))
            .attr("r", 4)
            .attr("fill", lineColor);

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none");

        this.svg.selectAll(".dot")
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                // Formatear el tooltip según el tipo de datos
                let tooltipContent;
                if (d.monthName && d.year) {
                    // Para datos de tiempo con mes y año
                    tooltipContent = `${d.monthName} ${d.year}<br/>${yLabel}: $${d[yKey].toLocaleString()}`;
                } else {
                    // Para datos generales
                    tooltipContent = `${xLabel}: ${d[xKey]}<br/>${yLabel}: ${d[yKey]}`;
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

    // Gráfico de barras
    createBarChart(data, options = {}) {
        const {
            xKey = 'x',
            yKey = 'y',
            xLabel = 'X Axis',
            yLabel = 'Y Axis',
            barColor = '#376889ff'
        } = options;

        this.initializeChart();

        const xScale = d3.scaleBand()
            .domain(data.map(d => d[xKey]))
            .range([0, this.width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[yKey])])
            .range([this.height, 0]);

        // Ejes
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(xScale));

        this.svg.append("g")
            .call(d3.axisLeft(yScale));

        // Barras
        this.svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[xKey]))
            .attr("width", xScale.bandwidth())
            .attr("y", d => yScale(d[yKey]))
            .attr("height", d => this.height - yScale(d[yKey]))
            .attr("fill", barColor);
    }

    // Mostrar mensaje cuando no hay datos
    showNoDataMessage(message = "No hay datos para mostrar") {
        this.initializeChart();
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#666")
            .text(message);
    }
}

// Instancia global del gestor de gráficos
let chartManager = null;

// Función para inicializar el gestor de gráficos
function initializeChartManager() {
    chartManager = new ChartManager('chart-container');
}

// Función para crear gráfico de líneas (llamada desde scripts.js)
function createLineChart(data, options) {
    if (!chartManager) {
        initializeChartManager();
    }
    chartManager.createLineChart(data, options);
}

// Función para crear gráfico de barras (llamada desde scripts.js)
function createBarChart(data, options) {
    if (!chartManager) {
        initializeChartManager();
    }
    chartManager.createBarChart(data, options);
}

// Función para mostrar mensaje de no datos
function showNoDataChart(message) {
    if (!chartManager) {
        initializeChartManager();
    }
    chartManager.showNoDataMessage(message);
}

// Función específica para generar gráfico de líneas desde los triplets de la pregunta ID 1
function generateLineChartFromTriplets(triplets) {
    const bindings = triplets.results.bindings;

    // Procesar los datos para el gráfico de líneas
    const chartData = bindings.map(binding => {
        const year = parseInt(binding.year.value);
        const month = parseInt(binding.month.value);
        const promedioUSD = parseFloat(binding.promedioUSD.value);

        // Crear una fecha para el eje X (año-mes)
        const dateValue = year + (month - 1) / 12; // Convertir a decimal para mejor visualización

        return {
            x: dateValue,
            y: promedioUSD,
            month: month,
            year: year,
            monthName: getMonthName(month)
        };
    });

    // Ordenar por fecha
    chartData.sort((a, b) => a.x - b.x);

    // Crear el gráfico de líneas
    createLineChart(chartData, {
        xLabel: 'Tiempo (Año)',
        yLabel: 'Promedio USD por m²',
        lineColor: '#376889ff'
    });
}

// Función auxiliar para obtener el nombre del mes
function getMonthName(monthNumber) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthNumber - 1];
}
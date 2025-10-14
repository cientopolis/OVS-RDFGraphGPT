// linearChart.js - Lógica específica para gráficos de líneas

class LinearChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
    }

    // Crear gráfico de líneas
    create(data, options = {}) {
        const {
            xKey = 'x',
            yKey = 'y',
            xLabel = 'X Axis',
            yLabel = 'Y Axis',
            lineColor = '#376889ff'
        } = options;

        // Inicializar el chart manager
        this.chartManager.initializeChart();
        const { width, height } = this.chartManager.getDimensions();
        const svg = this.chartManager.svg;

        // Escalas
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[xKey]))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d[yKey]))
            .range([height, 0]);

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

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Etiquetas de ejes
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.chartManager.margin.left + 5)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text(yLabel);

        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + this.chartManager.margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text(xLabel);

        // Dibujar línea
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 2)
            .attr("d", line);

        // Puntos
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d[xKey]))
            .attr("cy", d => yScale(d[yKey]))
            .attr("r", 4)
            .attr("fill", lineColor);

        // Tooltip
        this.addTooltip(svg, data, xScale, yScale, xKey, yKey, xLabel, yLabel);
    }

    // Crear gráfico de barras
    createBarChart(data, options = {}) {
        const {
            xKey = 'x',
            yKey = 'y',
            xLabel = 'X Axis',
            yLabel = 'Y Axis',
            barColor = '#376889ff'
        } = options;

        this.chartManager.initializeChart();
        const { width, height } = this.chartManager.getDimensions();
        const svg = this.chartManager.svg;

        const xScale = d3.scaleBand()
            .domain(data.map(d => d[xKey]))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[yKey])])
            .range([height, 0]);

        // Ejes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Barras
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[xKey]))
            .attr("width", xScale.bandwidth())
            .attr("y", d => yScale(d[yKey]))
            .attr("height", d => height - yScale(d[yKey]))
            .attr("fill", barColor);
    }

    // Agregar tooltip
    addTooltip(svg, data, xScale, yScale, xKey, yKey, xLabel, yLabel) {
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

        svg.selectAll(".dot")
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

                // Formatear el tooltip según el tipo de datos
                let tooltipContent;
                if (d.monthName && d.year) {
                    tooltipContent = `${d.monthName} ${d.year}<br/>${yLabel}: ${d[yKey].toLocaleString()}`;
                } else {
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
}

// Función para crear gráfico de líneas (llamada desde scripts.js)
function createLineChart(data, options) {
    if (!chartManager) {
        initializeChartManager();
    }
    const linearChart = new LinearChart(chartManager);
    linearChart.create(data, options);
}

// Función para crear gráfico de barras (llamada desde scripts.js)
function createBarChart(data, options) {
    if (!chartManager) {
        initializeChartManager();
    }
    const linearChart = new LinearChart(chartManager);
    linearChart.createBarChart(data, options);
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
        const dateValue = year + (month - 1) / 12;

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
// chartManager.js - Gestor principal de gráficos con D3.js

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

    // Limpiar el gráfico
    clear() {
        this.container.selectAll("*").remove();
    }

    // Obtener dimensiones actuales
    getDimensions() {
        return {
            width: this.width,
            height: this.height,
            margin: this.margin
        };
    }

    // Redimensionar el gráfico
    resize() {
        this.initializeChart();
    }
}

// Instancia global del gestor de gráficos
let chartManager = null;

// Función para inicializar el gestor de gráficos
function initializeChartManager() {
    chartManager = new ChartManager('chart-container');
}

// Función para mostrar mensaje de no datos
function showNoDataChart(message) {
    if (!chartManager) {
        initializeChartManager();
    }
    chartManager.showNoDataMessage(message);
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartManager, initializeChartManager, showNoDataChart };
}
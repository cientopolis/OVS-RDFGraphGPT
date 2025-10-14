// mapChart.js - Lógica específica para mapas con Leaflet.js

class MapChart {
    constructor(chartManager) {
        this.chartManager = chartManager;
        this.map = null;
        this.markers = [];
    }

    // Crear mapa con marcadores
    create(data, options = {}) {
        const {
            defaultZoom = 13,
            markerColor = '#376889ff',
            popupOptions = {}
        } = options;

        // Limpiar el contenedor y preparar para el mapa
        this.chartManager.container.selectAll("*").remove();
        
        // Crear contenedor del mapa
        const mapContainer = this.chartManager.container
            .append("div")
            .attr("id", "leaflet-map")
            .style("width", "100%")
            .style("height", "100%")
            .style("min-height", "400px");

        // Extraer coordenadas de los datos WKT
        const locations = this.extractCoordinatesFromWKT(data);
        
        if (locations.length === 0) {
            this.showNoDataMessage();
            return;
        }

        // Calcular centro del mapa basado en las coordenadas
        const center = this.calculateCenter(locations);

        // Inicializar el mapa de Leaflet
        setTimeout(() => {
            this.map = L.map('leaflet-map').setView([center.lat, center.lng], defaultZoom);

            // Agregar capa de tiles (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            // Agregar marcadores
            this.addMarkers(locations);

            // Ajustar vista para mostrar todos los marcadores
            if (locations.length > 1) {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }
        }, 100);
    }

    // Extraer coordenadas del formato WKT POINT
    extractCoordinatesFromWKT(data) {
        const locations = [];
        
        if (data && data.results && data.results.bindings) {
            data.results.bindings.forEach((binding, index) => {
                if (binding.wkt && binding.wkt.value) {
                    const wktValue = binding.wkt.value;
                    
                    // Extraer coordenadas del formato POINT(lng lat)
                    // Maneja tanto formato simple como con CRS
                    const pointMatch = wktValue.match(/POINT\s*\(([^)]+)\)/i);
                    if (pointMatch) {
                        const coords = pointMatch[1].trim().split(/\s+/);
                        if (coords.length >= 2) {
                            const lng = parseFloat(coords[0]);
                            const lat = parseFloat(coords[1]);
                            
                            if (!isNaN(lat) && !isNaN(lng)) {
                                // Crear información del marcador
                                const realEstateUri = binding.realEstate ? binding.realEstate.value : '';
                                const propertyId = realEstateUri.split('#')[1] || `Propiedad ${index + 1}`;
                                const propertyName = propertyId.replace('real_estate_site3_', 'Casa ');
                                
                                locations.push({
                                    lat: lat,
                                    lng: lng,
                                    name: propertyName,
                                    uri: realEstateUri,
                                    wkt: wktValue,
                                    index: index + 1,
                                    originalData: binding
                                });
                            }
                        }
                    }
                }
            });
        }
        
        console.log(`Extraídas ${locations.length} ubicaciones del dataset`);
        return locations;
    }

    // Calcular el centro geográfico de todas las ubicaciones
    calculateCenter(locations) {
        if (locations.length === 0) {
            return { lat: -34.88, lng: -58.02 }; // Centro por defecto (Gonnet)
        }
        
        const totalLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
        const totalLng = locations.reduce((sum, loc) => sum + loc.lng, 0);
        
        return {
            lat: totalLat / locations.length,
            lng: totalLng / locations.length
        };
    }

    // Agregar marcadores al mapa
    addMarkers(locations) {
        this.markers = [];
        
        locations.forEach((location, index) => {
            // Crear marcador personalizado
            const marker = L.marker([location.lat, location.lng], {
                title: location.name
            });

            // Crear contenido del popup
            const popupContent = this.createPopupContent(location);
            marker.bindPopup(popupContent);

            // Agregar marcador al mapa
            marker.addTo(this.map);
            this.markers.push(marker);

            // Evento de click en el marcador
            marker.on('click', () => {
                console.log('Propiedad seleccionada:', location);
            });
        });
    }

    // Crear contenido del popup para cada marcador
    createPopupContent(location) {
        return `
            <div class="map-popup">
                <h4>${location.name}</h4>
                <p><strong>Ubicación:</strong> Gonnet, La Plata</p>
                <p><strong>Coordenadas:</strong><br>
                   Latitud: ${location.lat.toFixed(6)}<br>
                   Longitud: ${location.lng.toFixed(6)}</p>
                <p><strong>Propiedad #:</strong> ${location.index}</p>
                ${location.uri ? `<p><strong>ID:</strong><br><small>${location.uri.split('#')[1]}</small></p>` : ''}
            </div>
        `;
    }

    // Mostrar mensaje cuando no hay datos
    showNoDataMessage() {
        this.chartManager.container
            .append("div")
            .attr("class", "no-data-message")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("height", "400px")
            .style("font-size", "16px")
            .style("color", "#666")
            .text("No se encontraron coordenadas para mostrar en el mapa");
    }

    // Limpiar el mapa
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
    }
}

// La función generateMapChartFromTriplets se encuentra en scripts.js
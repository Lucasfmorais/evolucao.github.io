var layerTree = function(options) {
    'use strict';
    if(!(this instanceof layerTree)) {
        throw new Error('layerTree deve ser construído com o nova palavra-chave.');
    } else if (typeof options === 'object' && options.map && options.target) {
        if (!(options.map instanceof ol.Map)) {
            throw new Error('Por favor, forneça um OpenLayers 3 válido objeto de mapa.');
        }
        this.map = options.map;
        var containerDiv = document.getElementById(options.target);
        if (containerDiv === null || containerDiv.nodeType !== 1) {
            throw new Error('Por favor, forneça um ID de elemento válido');
        }
        this.messages = document.getElementById(options.messages) || document.createElement('span');
        
        var controlDiv = document.createElement('div');
        controlDiv.className = 'layertree-buttons';
        containerDiv.appendChild(controlDiv);
        this.layerContainer = document.createElement('div');
        this.layerContainer.className = 'layercontainer';
        containerDiv.appendChild(this.layerContainer);
        var idCounter = 0;
        this.createRegistry = function(layer) {
            layer.set('id', 'layer_' + idCounter);
            idCounter += 1;
            var layerDiv = document.createElement('div');
            layerDiv.className = 'layer ol-unselectable';
            layerDiv.title = layer.get('name') || 'Unnamed Layer';
            layerDiv.id = layer.get('id');
            var layerSpan = document.createElement('span');
            layerSpan.textContent = layerDiv.title;
            layerDiv.appendChild(layerSpan);
            this.layerContainer.insertBefore(layerDiv, this.layerContainer.firstChild);
            return this;
        };
    } else {
        throw new Error('Invalid parameter(s) provided.');
    }
};

function init() {
    document.removeEventListener('DOMContentLoaded', init);
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                title: 'Esri Satellite',
                'type': 'base',
                'opacity': 1.000000,
                source: new ol.source.XYZ({
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                }),
                name:'Ersi Earth'
            })
            
            ,
/* 
            new ol.layer.Tile({
                title: 'Google Satellite',
                'type': 'base',
                'opacity': 1.00000,
                source: new ol.source.XYZ({
                attributions:  new ol.Attribution({
                html: 'Mapas de base:<a href="https://www.google.com/intl/pt_US/help/terms_maps/">Google</a>&nbsp;e &nbsp;<a href="https://www.esri.com/en-us/legal/terms/services">Esri</a>'
                }),
                    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                }),
                name: 'Google Earth'
            })

            , */

            new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON({
                        defaultDataProjection: 'EPSG:4326'
                    }),
                    url: "./layers/CensoAgrop.geojson",
                    attributions: [
                        new ol.Attribution({
                            html: '\262\nFeição do Brasil2\n '
                        })
                    ],
                    
                }),
                name: 'Censo agropecuário'
            })

            ,

            new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON({
                        defaultDataProjection: 'EPSG:4326'
                    }),
                    url: './layers/CapitaisMundiais.geojson',
                    attributions: [
                        new ol.Attribution({
                            html: 'World Capitals Â© Natural Earth'
                        })
                    ]
                }),
                name: 'Capitais Mundiais'
            })
        ],
        controls: [
            //Define the default controls
            new ol.control.Zoom({
                target: 'toolbar'
            }),
            //Define some new controls
            new ol.control.MousePosition({
                coordinateFormat: function (coordinates) {
                    var coord_x = coordinates[0].toFixed(3);
                    var coord_y = coordinates[1].toFixed(3);
                    return coord_x + ', ' + coord_y;
                },
                target: 'coordinates'
            })
        ],
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
    var tree = new layerTree({map: map, target: 'layertree', messages: 'messageBar'})
/*         .createRegistry(map.getLayers().item(3)) */
        .createRegistry(map.getLayers().item(2))
        .createRegistry(map.getLayers().item(1))
        .createRegistry(map.getLayers().item(0));
    
}
document.addEventListener('DOMContentLoaded', init);
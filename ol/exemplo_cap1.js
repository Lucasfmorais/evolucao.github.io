function init() {
    document.removeEventListener('DOMContentLoaded', init);
    
    ol.events.condition.custom = function(mapBrowserEvent) {
            var browserEvent = mapBrowserEvent.originalEvent;
            return (browserEvent.ctrlKey);
    };

    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326'
            }),
            url: "./layers/CapitaisMundiais.geojson",
            attributions: [
                new ol.Attribution({
                    html: '\271\nCapitais do Mundo\n '
                })
            ]
        }),
        style: new ol.style.Style({
            image: new ol.style.RegularShape({
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: [6, 125, 34, 1]
                }),
                fill: new ol.style.Fill({
                    color: [25, 235, 75, 0.3]
                }),
                points: 5,
                radius1: 5,
                radius2: 8,
                rotation: Math.PI
            })
        })
    });

    var pointStyle = new ol.style.Style({
            image: new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({color: "Salmon"}),
            stroke: new ol.style.Stroke({
                color: [255,0,0], width: 1
            })
        })
    });

    var vectorBrasil = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326'
            }),
            url: "./layers/brasil.geojson",
            attributions: [
                new ol.Attribution({
                    html: '\262\nFeição do Brasil\n '
                })
            ]
        }),

    });

    var vectorArmazens = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326'
            }),
            url: "./layers/armazens.geojson",
            attributions: [
                new ol.Attribution({
                    html: '\262\nFeição do Brasil2\n '
                })
            ],
            
        }),
        style: pointStyle
    });

    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorBrasil,vectorLayer,vectorArmazens
        ],
        controls: [

            //Definindo os controles padrões
            new ol.control.Zoom(),
            new ol.control.Rotate({
                autoHide: true
            }),
            new ol.control.Attribution(),
            //Definindo alguns novos controles
            new ol.control.ZoomSlider(),
            new ol.control.MousePosition(),
            new ol.control.ScaleLine({
                units:'metric'
            }),
            new ol.control.OverviewMap({
                collapsible:true
            })
        ],
        interactions: ol.interaction.defaults().extend([
            new ol.interaction.Select({
                layers: [vectorBrasil,vectorLayer,vectorArmazens]
            }),
            new ol.interaction.DragRotate({
                condition: ol.events.condition.custom})
        ]),
        view: new ol.View({
            center: ol.proj.fromLonLat([-51.74245,-17.95222]),
            zoom: 7
        }),
    });
}

document.addEventListener('DOMContentLoaded', init);


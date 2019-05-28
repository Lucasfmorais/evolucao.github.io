function init() {
    document.removeEventListener('DOMContentLoaded', init);

    var infoLabel = document.createElement('span');
    infoLabel.className = 'info-label';
    infoLabel.textContent = 'inf';

/*     ol.events.condition.custom = function(mapBrowserEvent) {
            var browserEvent = mapBrowserEvent.originalEvent;
            return (browserEvent.ctrlKey);
    }; */

    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326'
            }),
            url: "./layers/CapitaisMundiais.geojson",
            attributions: [
                new ol.Attribution({
                    html: '<span style="padding-left:2px">Capitais do Mundo,</span>'
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
                    html: '<span style="padding-left:2px">Feição do Brasil, </span>'
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
                    html: '<span style="padding-right:2px">Feição do Brasil2</span>'
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
            new ol.control.Attribution({
                label: infoLabel
            }),
            //Definindo alguns novos controles
            new ol.control.ZoomSlider(),
            new ol.control.MousePosition({ /* Realiza o truncamenta para 3 casas decimais após a virgula. */
                coordinateFormat: function (coordinates) {
                var coord_x = coordinates[0].toFixed(3);
                var coord_y = coordinates[1].toFixed(3);
                return "<table border='0'BGCOLOR=white><tr><td>Longitude: </td>"+ "<td>"+ coord_x +"</td>"+ 
                            "</tr>"+"<tr>" + "<td>Latitude: </td>"+ "<td>"+ coord_y + "</td>" +"</table>";
                }
            }),
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
        logo: {
            src: './pictures/boxgeo.png',
            href: 'https://geoconn-site.webflow.io/'
            }
    });
}
document.addEventListener('DOMContentLoaded', init);


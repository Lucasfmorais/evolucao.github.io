var layerTree = function(options) {
    'use strict';
    if (!(this instanceof layerTree)) {
        throw new Error('O layerTree deve ser construído com a nova palavra-chave.');
    } else if (typeof options === 'object' && options.map && options.target) {
        if (!(options.map instanceof ol.Map)) {
            throw new Error('Por favor, forneça um objeto de mapa válido do OpenLayers 3.');
        }
        this.map = options.map;
        var containerDiv = document.getElementById(options.target);
        if (containerDiv === null || containerDiv.nodeType !== 1) {
            throw new Error('Por favor forneça um ID de elemento válido.');
        }
        this.messages = document.getElementById(options.messages) || document.createElement('span');
        var controlDiv = document.createElement('div');
        controlDiv.className = 'layertree-buttons';
        controlDiv.appendChild(this.createButton('addwms', 'Adicionar camada WMS', 'addlayer'));
        controlDiv.appendChild(this.createButton('addwfs', 'Adicionar camada WFS', 'addlayer'));
        controlDiv.appendChild(this.createButton('addtms', 'Adicionar camada TMS', 'addlayer'));
        containerDiv.appendChild(controlDiv);
        this.layerContainer = document.createElement('div');
        this.layerContainer.className = 'layercontainer';
        containerDiv.appendChild(this.layerContainer);
        var idCounter = 0;
        this.createRegistry = function(layer, buffer) {
            layer.set('id', 'layer_' + idCounter);
            idCounter += 1;
            var layerDiv = document.createElement('div');
            layerDiv.className = buffer ? 'layer ol-unselectable buffering' : 'layer ol-unselectable';
            console.log("leee")
            layerDiv.title = layer.get('name') || 'Camada sem nome';
            console.log(layerDiv.title)
            layerDiv.id = layer.get('id');
            var layerSpan = document.createElement('span');
            layerSpan.textContent = layerDiv.title;

            layerDiv.appendChild(layerSpan);
            this.layerContainer.insertBefore(layerDiv, this.layerContainer.firstChild);
            return this;
        };
        this.map.getLayers().on('add', function(evt) {
            if (evt.element instanceof ol.layer.Vector) {
                this.createRegistry(evt.element, true);
            } else {
                this.createRegistry(evt.element);
                //this.form.parentNode.style.display = 'none';
            }
        }, this);
    } else {
        throw new Error('Parâmetros fornecidos inválidos.');
    }
};

layerTree.prototype.createButton = function(elemName, elemTitle, elemType) {
    var buttonElem = document.createElement('button');
    buttonElem.className = elemName;
    buttonElem.title = elemTitle;
    switch (elemType) {
        case 'addlayer':
            buttonElem.addEventListener('click', function() {
                document.getElementById(elemName).style.display = 'block';
            });
            return buttonElem;
        default:
            return false;
    }
};

layerTree.prototype.addBufferIcon = function(layer) {
    layer.getSource().on('change', function(evt) {
        var layerElem = document.getElementById(layer.get('id'));
        switch (evt.target.getState()) {
            case 'ready':
                layerElem.className = layerElem.className.replace(/(?:^|\s)(error|buffering)(?!\S)/g, '');
                break;
            case 'error':
                layerElem.classList.add('error');
                break;
            default:
                layerElem.classList.add('buffering');
                break;
        }
    });
};

layerTree.prototype.removeContent = function(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return this;
};

layerTree.prototype.createOption = function(optionValue) {
    var option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    return option;
};

layerTree.prototype.checkWmsLayer = function(form) {
    form.check.disabled = true;
    var _this = this;

    this.removeContent(form.layer).removeContent(form.format);
    var url = form.server.value;
    url = /^((http)|(https))(:\/\/)/.test(url) ? url : 'http://' + url;
    form.server.value = url;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var parser = new ol.format.WMSCapabilities();
            try {
                var capabilities = parser.read(request.response);
                var currentProj = _this.map.getView().getProjection().getCode();
                var crs;

                var messageText = 'Camadas lidas com sucesso.';

                if (capabilities.version === '1.3.0') {
                    crs = capabilities.Capability.Layer.CRS;
                } else {
                    crs = [currentProj];
                    messageText += ' Aviso! A compatibilidade de projeção não pôde ser verificada devido à incompatibilidade de versão (' + capabilities.version + ').';
                }
                var layers = capabilities.Capability.Layer.Layer;

                console.log("opaa", layers)
                if (layers.length > 0 && crs.indexOf(currentProj) > -1) {
                    for (var i = 0; i < layers.length; i += 1) {
                        form.layer.appendChild(_this.createOption(layers[i].Name));
                        //console.log(layers[i].Name)
                        temp = layers[i].Name.split(":")
                            /*                         console.log(temp)
                                                    if (temp.length > 1) {
                                                        form.layer.appendChild(_this.createOption(temp[1]))
                                                    } else {
                                                        form.layer.appendChild(_this.createOption(layers[i].Name))
                                                    } */

                    }
                    var formats = capabilities.Capability.Request.GetMap.Format;
                    for (i = 0; i < formats.length; i += 1) {
                        form.format.appendChild(_this.createOption(formats[i]));

                    }
                    _this.messages.textContent = messageText;
                    _this.form.reset()
                }
            } catch (error) {
                _this.messages.textContent = 'Erro inesperado: (' + error.message + ').';
            } finally {
                form.check.disabled = false;
            }
        } else if (request.status > 200) {
            form.check.disabled = false;
        }
    };

    url = /\?/.test(url) ? url + '&' : url + '?';
    console.log("coco:", url)
    url = "https://cors-anywhere.herokuapp.com/" + url + 'REQUEST=GetCapabilities&SERVICE=WMS';
    request.open('GET', url, true);
    request.send();
    //content.innerHTML = this.form.parentNode.style.display = 'none';
}


layerTree.prototype.addWmsLayer = function(form) {
    var params = {
        url: form.server.value,
        params: {
            layers: form.layer.value,
            format: form.format.value
        },
        attributions: '<a href=""></a>'

    };
    var layer;
    if (form.tiled.checked) {
        layer = new ol.layer.Tile({
            source: new ol.source.TileWMS(params),
            name: form.displayname.value,
        });
    } else {
        layer = new ol.layer.Image({
            source: new ol.source.ImageWMS(params),
            name: form.displayname.value
        });
    }
    this.map.addLayer(layer);
    this.messages.textContent = 'Camada WMS adicionada com sucesso.';
    return this;
};

layerTree.prototype.addWfsLayer = function(form) {
    var url = form.server.value;
    url = /^((http)|(https))(:\/\/)/.test(url) ? url : 'http://' + url;
    url = /\?/.test(url) ? url + '&' : url + '?';
    var url2 = url;
    var typeName = form.layer.value;
    var mapProj = this.map.getView().getProjection().getCode();
    var proj = form.projection.value || mapProj;
    var parser = new ol.format.WFS({
        url: url2,
        attributions: '<a href=""></a>',
        params: {
            //"LAYERS": typeName,
            "TILED": "true",
            "VERSION": "1.1.1"
        },

    });
    var source = new ol.source.Vector({
        strategy: ol.loadingstrategy.bbox
    });
    var request = new XMLHttpRequest();
    //request.onload = function() { console.log(this.responseText); };
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            source.addFeatures(parser.readFeatures(request.responseText, {
                dataProjection: proj,
                featureProjection: mapProj
            }));
        }
    };

    url = "https://cors-anywhere.herokuapp.com/" + url + '?service=wfs&request=GetCapabilities&TYPENAME=' + typeName + '&SRSNAME=' + proj;
    request.open('get', url, true);
    request.send();

    var layer = new ol.layer.Vector({
        source: source,
        name: form.displayname.value
    });
    this.addBufferIcon(layer);
    this.map.addLayer(layer);
    this.messages.textContent = 'Camada WMF adicionada com sucesso.';
    return this;
};

function init() {
    document.removeEventListener('DOMContentLoaded', init);
    var container = document.getElementById('popup');
    var content = document.getElementById('TABLE');
    var closer = document.getElementById('popup-closer');
    var sketch;

    closer.onclick = function() {
        container.style.display = 'none';
        closer.blur();
        return false;
    };


    var overlayPopup = new ol.Overlay({
        element: container
    });

    var sigef = new ol.layer.Tile({
        source: new ol.source.TileWMS(({
            url: "http://acervofundiario.incra.gov.br/i3geo/ogc.php?tema%3Dcertificada_sigef_particular_go",
            attributions: '<a href=""></a>',
            params: {
                "LAYERS": "certificada_sigef_particular_go",
                "TILED": "true",
                "VERSION": "1.1.1",
            },
        })),
        opacity: 1.000000,
        name: 'Sigef',
    })

    var SNCI = new ol.layer.Tile({
        source: new ol.source.TileWMS(({
            url: "http://acervofundiario.incra.gov.br/i3geo/ogc.php?tema%3Dimoveiscertificados_privado_GO",
            attributions: '<a href=""></a>',
            params: {
                "LAYERS": "imoveiscertificados_privado_GO",
                "TILED": "true",
                "VERSION": "1.1.1",
            },
        })),
        opacity: 1.000000,
        name: 'SCNI',
    })

    var SiCAR = new ol.layer.Tile({
        source: new ol.source.TileWMS(({
            url: "https://sistemas.florestal.gov.br/geoserver/ows",
            attributions: '<a href=""></a>',
            params: {
                "LAYERS": "CNFP_orig:imoveis",
                "TILED": "true",
                "VERSION": "1.1.0",
            },
        })),
        opacity: 1.000000,
        name: 'Imoveis',
    })
    var Capitais = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326'
            }),
            url: './layers/CapitaisMundiais.geojson',
        }),
        name: 'Capitais Mundiais'
    })


    var bairros = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:4326'
            }),
            url: './layers/bairrosjti3.geojson',

        }),
        style: new ol.style.Style({
            //fill: new ol.style.Fill({ color: 'rgba(17, 6, 62, 0.150)' }),
            stroke: new ol.style.Stroke({
                color: 'rgba(11, 12, 11, 0.918)',
                width: .5,
            })
        }),
        name: 'Bairros de Jataí'
    })

    var map = new ol.Map({
        target: 'map',
        overlays: [overlayPopup],
        layers: [

            new ol.layer.Tile({
                title: 'Google Satellite',
                'type': 'base',
                'opacity': 5.00000,
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                }),
                name: 'Google Earth'
            }),
            new ol.layer.Tile({
                title: 'Google Satellite',
                'type': 'base',
                'opacity': 5.00000,
                source: new ol.source.XYZ({
                    url: './tiles/{z}/{x}/{y}.png'
                }),
                name: 'drone'
            }),
            //'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            //'https://storage.googleapis.com/land_test/Test_landSAt/{z}/{x}/{y}.jpg'
            //'https://storage.googleapis.com/wgs_test/Test_wgs_qgis/{z}/{x}/{y}.jpg'
            //'https://storage.googleapis.com/wgs_test/Test_wgs_qgis2/{z}/{x}/{y}.jpg'
            //https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
            bairros,
            //SNCI,
            //sigef,
            //Capitais,
            //SiCAR,
        ],
        controls: [
            //Define the default controls
            new ol.control.Zoom({
                target: 'toolbar'
            }),
            //Define some new controls
            new ol.control.MousePosition({
                projection: 'EPSG:4326',
                coordinateFormat: function(coordinates) {
                    var coord_x = coordinates[0].toFixed(4);
                    var coord_y = coordinates[1].toFixed(4);
                    return "WGS 84: " + coord_x + ', ' + coord_y;
                },
                target: 'coordinates'
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-51.714605897875174, -17.86019382887064]),
            zoom: 21
        })
    });

    var wms_layers = [];
    wms_layers.push([SNCI, 1], [sigef, 1]);
    console.log(wms_layers)
        //wms_layers = [SNCI, sigef];
    var onSingleClick = function(evt) {
        var popupText = ""
        var dado = ""

        var coord = evt.coordinate;
        var coordinatesConv = function(a) {
            var coord_x = a[0].toFixed(4);
            var coord_y = a[1].toFixed(4);
            return "Informações do ponto" + "<br>" + "<b>Latitude/Longitude:</b>" + '&nbsp;[' + coord_x + '&nbsp;,&nbsp;' + coord_y + "]<br>"
        }
        var arrumatexto = function(dado) {
                texto1 = dado.split("\n")
                cont = 0
                cont2 = 0
                texto2 = []
                temp2 = []
                temp_html = '<html>' + coordinatesConv(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')) + '<br>' + "<table border='1' bordercolor='grey' bgcolor='White'>" + "\n"
                while (cont < texto1.length) {
                    temp = texto1[cont].split("=");
                    if (temp.length > 1) {
                        while (cont2 < temp.length) {
                            temp[cont2] = temp[cont2].replace(/'/g, '')
                            temp[cont2] = temp[cont2].trim()
                            temp2.push(temp[cont2])
                            if (cont2 == temp.length - 1) {
                                temp_html = temp_html + "<td>" + '&nbsp;' + temp[cont2] + "</td></tr>" + "\n"
                            } else if (cont2 == 0) {
                                temp_html = temp_html + "<tr><td>" + '&nbsp;' + temp[cont2] + "</td>"
                            } else {
                                temp_html = temp_html + "<td>" + '&nbsp;' + temp[cont2] + "</td>"
                            }
                            cont2 = cont2 + 1;;
                        }
                        texto2.push(temp2)
                        temp2 = []
                        cont2 = 0;
                        temp = [];
                    } else {
                        temp[0] = temp[0].replace(/'/g, '')
                        temp[0] = temp[0].replace(":", '')
                        temp[0] = temp[0].trim()
                        if (temp[cont2] != "") {
                            console.log("!!!")
                        }
                    }
                    if (cont == texto1.length - 1) {
                        temp_html = temp_html + "</table>" + "\n" + "</html>"
                    }
                    cont = cont + 1;
                }
                return (temp_html);
            }
            // busca informações da camada geojason
        var feature = map.forEachFeatureAtPixel(evt.pixel, function(
            feature,
        ) {
            return feature;
        });
        if (feature) {
            inf_attr = feature.getKeys()
            console.log("aqui", inf_attr)
            i = 0
            while (i < inf_attr.length) {
                if (inf_attr[i] != "geometry") {
                    dado = dado + inf_attr[i] + '= ' + feature.get(inf_attr[i]) + "\n"
                    console.log("aqui", dado)
                }
                i = 1 + i
            }
        }
        if (dado != "") {
            popupText = arrumatexto(dado)
        } else {
            //caso não ache no geojson, ele busca na camada WMS/WFS
            var coord = evt.coordinate
            var viewProjection = map.getView().getProjection();
            var viewResolution = map.getView().getResolution();
            var projcorrigida = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')
            for (i = 0; i < wms_layers.length; i++) {
                if (wms_layers[i][1]) {
                    var url = wms_layers[i][0].getSource().getGetFeatureInfoUrl(
                        evt.coordinate, viewResolution, viewProjection, {
                            'REQUEST': 'GetFeatureInfo',
                            'outputFormat': 'text/plain',
                        });

                    if (url) {
                        var request_http = new XMLHttpRequest();
                        var body = 'Arun';
                        url_cors = "https://cors-anywhere.herokuapp.com/"
                        console.log("aqui", i, url)
                        request_http.open("GET", url_cors + url, true);
                        request_http.onload = request_http.onerror = function() {
                            if (request_http.readyState === 4 && request_http.status === 200) {
                                popupText = arrumatexto(request_http.responseText)
                                if (popupText) {
                                    overlayPopup.setPosition(coord);
                                    console.log(popupText)
                                    content.innerHTML = popupText;
                                    container.style.display = 'block';
                                } else {
                                    container.style.display = 'none';
                                    closer.blur();
                                }
                            } else {
                                popupText = arrumatexto(request_http.responseText)
                            }
                        }
                        request_http.send(body);
                    } else {
                        console.log("clique vazio!")
                    }
                }

            }
        }
        if (popupText) {

            overlayPopup.setPosition(coord);
            content.innerHTML = popupText;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
            closer.blur();
        }
        popupText = '<html>' + coordinatesConv(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')) + '<br>' + '</html>'
    };

    map.on('singleclick', function(evt) {
        onSingleClick(evt);
    });

    var tree = new layerTree({ map: map, target: 'layertree', messages: 'messageBar' })
        .createRegistry(map.getLayers().item(0))
        .createRegistry(map.getLayers().item(1));
    //.createRegistry(map.getLayers().item(2));
    //.createRegistry(map.getLayers().item(3));

    document.getElementById('checkwmslayer').addEventListener('click', function() {
        tree.checkWmsLayer(this.form);
    });
    document.getElementById('addwms_form').addEventListener('submit', function(evt) {
        evt.preventDefault();
        tree.addWmsLayer(this);
        this.parentNode.style.display = 'none';

    });
    document.getElementById('wmsurl').addEventListener('change', function() {
        tree.removeContent(this.form.layer)
            .removeContent(this.form.format);
    });
    document.getElementById('addwfs_form').addEventListener('submit', function(evt) {
        evt.preventDefault();
        tree.addWfsLayer(this);
        this.parentNode.style.display = 'none';
    });
}
document.addEventListener('DOMContentLoaded', init);
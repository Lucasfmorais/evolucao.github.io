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
        console.log("svisa")
        console.log(controlDiv)
        controlDiv.className = 'layertree-buttons';
        controlDiv.appendChild(this.createButton('addwms', 'Adicionar camada WMS', 'addlayer'));
        controlDiv.appendChild(this.createButton('addwfs', 'Adicionar camada WFS', 'addlayer'));
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
            layerDiv.title = layer.get('name') || 'Camada sem nome';
            layerDiv.id = layer.get('id');
            var layerSpan = document.createElement('span');
            layerSpan.textContent = layerDiv.title;
            layerDiv.appendChild(layerSpan);
            this.layerContainer.insertBefore(layerDiv, this.layerContainer.firstChild);
            return this;
        };
        console.log(this)
        this.map.getLayers().on('add', function(evt) {
            if (evt.element instanceof ol.layer.Vector) {
                this.createRegistry(evt.element, true);
            } else {
                this.createRegistry(evt.element);
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
                if (layers.length > 0 && crs.indexOf(currentProj) > -1) {
                    for (var i = 0; i < layers.length; i += 1) {
                        form.layer.appendChild(_this.createOption(layers[i].Name));
                    }
                    var formats = capabilities.Capability.Request.GetMap.Format;
                    for (i = 0; i < formats.length; i += 1) {
                        form.format.appendChild(_this.createOption(formats[i]));

                    }
                    _this.messages.textContent = messageText;
                    //this.removeContent(form.layer).removeContent(form.format);
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
    url = "https://cors-anywhere.herokuapp.com/" + url + 'REQUEST=GetCapabilities&SERVICE=WMS';
    //request.open('GET', './server8.py?' + encodeURIComponent(url), true);
    //http://127.0.0.1:5000/
    //request.open('GET', encodeURIComponent(url), true);
    //request.open('GET', 'https://crossorigin.me/' + url, true);
    //request.setRequestHeader("Access-Control-Allow-Origin", "");
    //request.setRequestHeader("Access-Control-Allow-Headers", "GET, PUT, DELET, OPTIONS");
    //request.setRequestHeader("access-control-allow-credentials", true);
    //url = "proxy.php?a=pjm"
    request.open('GET', url, true);
    console.log("resquest:", url);
    //request.onload = function() {
    //var status = request.status;
    //var data = request.responseText;
    //console.log("data:", data);
    request.send();
}

//request.setRequestHeader('Content-Type', 'application/json');
//request.setRequestHeader('Access-Control-Allow-Methods', ' GET, PUT, DELET, OPTIONS');
//request.withCredentials = true

/*     request.onerror = function(XMLHttpRequest, textStatus, errorThrown) {
        console.log('The data failed to load :(');
        console.log(JSON.stringify(XMLHttpRequest));
    };
    request.onload = function() {
        console.log('SUCCESS!');
    } 
request.send();
};*/

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
    request.onload = function() { console.log(this.responseText); };
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            source.addFeatures(parser.readFeatures(request.responseText, {
                dataProjection: proj,
                featureProjection: mapProj
            }));
        }
    };
    //parser.tileOptions.crossOriginKeyword = null;
    //console.log(url)
    //headers.append()
    url = "https://cors-anywhere.herokuapp.com/" + url + '?service=wfs&request=GetCapabilities&TYPENAME=' + typeName + '&SRSNAME=' + proj;
    //?service=wms&request=GetCapabilities
    //request.open('get', './cgi-bin/proxy.py?' + encodeURIComponent(url), true);
    request.open('get', url, true);
    //request.open('GET', 'http://127.0.0.1:5000/' + encodeURIComponent(url), true);
    console.log(url)
        //request.withCredentials = true;
        //request.setHeader('Accept-Encoding', 'gzip, deflate, br');
        //request.setHeader('Accept-language', 'pt-BR.pt;q=0.8,en-US;q=0.5,en;q0.3');
        //request.setRequestHeader('Authorization', 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
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
        name: 'Imoveis',
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
        name: 'Imoveis',
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


    var map = new ol.Map({
        target: 'map',
        overlays: [overlayPopup],
        layers: [

            new ol.layer.Tile({
                title: 'Google Satellite',
                'type': 'base',
                'opacity': 5.00000,
                source: new ol.source.XYZ({
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                }),
                name: 'Google Earth'
            }),

            //'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            //'https://storage.googleapis.com/land_test/Test_landSAt/{z}/{x}/{y}.jpg'
            //'https://storage.googleapis.com/wgs_test/Test_wgs_qgis/{z}/{x}/{y}.jpg'
            //'https://storage.googleapis.com/wgs_test/Test_wgs_qgis2/{z}/{x}/{y}.jpg'
            //https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}

            SNCI,

            sigef,

            //SiCAR,

            new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON({
                        defaultDataProjection: 'EPSG:4326'
                    }),
                    url: './layers/CapitaisMundiais.geojson',
                }),
                name: 'Capitais Mundiais'
            })

            ,

            new ol.layer.Vector({
                source: new ol.source.Vector({
                    format: new ol.format.GeoJSON({
                        defaultDataProjection: 'EPSG:4326'
                    }),
                    url: './layers/bairrosjti.geojson',

                }),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({ color: 'rgba(17, 6, 62, 0.150)' }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(11, 12, 11, 0.918)',
                        width: .5,
                    })
                }),
                name: 'Bairros de Jataí'
            })
        ]

        ,

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
        ]

        ,

        view: new ol.View({
            center: ol.proj.fromLonLat([-51.7257015, -17.8869303]),
            zoom: 12
        })
    });


    var wms_layers = [];
    wms_layers.push([sigef, 1]);


    var onPointerMove = function(evt) {
        if (!doHover && !doHighlight) {
            return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var coord = evt.coordinate;
        var popupField;
        var currentFeature;
        var currentLayer;
        var currentFeatureKeys;
        var clusteredFeatures;
        var popupText = '<ul>';
        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            // We only care about features from layers in the layersList, ignore
            // any other layers which the map might contain such as the vector
            // layer used by the measure tool
            if (layersList.indexOf(layer) === -1) {
                return;
            }
            var doPopup = false;
            for (k in layer.get('fieldImages')) {
                if (layer.get('fieldImages')[k] != "Hidden") {
                    doPopup = true;
                }
            }
            currentFeature = feature;
            currentLayer = layer;
            clusteredFeatures = feature.get("features");
            var clusterFeature;
            if (typeof clusteredFeatures !== "undefined") {
                if (doPopup) {
                    for (var n = 0; n < clusteredFeatures.length; n++) {
                        clusterFeature = clusteredFeatures[n];
                        currentFeatureKeys = clusterFeature.getKeys();
                        popupText += '<li><table>'
                        for (var i = 0; i < currentFeatureKeys.length; i++) {
                            if (currentFeatureKeys[i] != 'geometry') {
                                popupField = '';
                                if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                    popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                                } else {
                                    popupField += '<td colspan="2">';
                                }
                                if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                    popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                                }
                                if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                                    popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(clusterFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                                } else {
                                    popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + clusterFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                                }
                                popupText += '<tr>' + popupField + '</tr>';
                            }
                        }
                        popupText += '</table></li>';
                    }
                }
            } else {
                currentFeatureKeys = currentFeature.getKeys();
                if (doPopup) {
                    popupText += '<li><table>';
                    for (var i = 0; i < currentFeatureKeys.length; i++) {
                        if (currentFeatureKeys[i] != 'geometry') {
                            popupField = '';
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                            } else {
                                popupField += '<td colspan="2">';
                            }
                            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                            }
                            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                                popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(currentFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                            } else {
                                popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                            }
                            popupText += '<tr>' + popupField + '</tr>';
                        }
                    }
                    popupText += '</table></li>';
                }
            }
        });
        if (popupText == '<ul>') {
            popupText = '';
        } else {
            popupText += '</ul>';
        }

        if (doHighlight) {
            if (currentFeature !== highlight) {
                if (highlight) {
                    featureOverlay.getSource().removeFeature(highlight);
                }
                if (currentFeature) {
                    var styleDefinition = currentLayer.getStyle().toString();

                    if (currentFeature.getGeometry().getType() == 'Point') {
                        var radius = styleDefinition.split('radius')[1].split(' ')[1];

                        highlightStyle = new ol.style.Style({
                            image: new ol.style.Circle({
                                fill: new ol.style.Fill({
                                    color: "#ffff00"
                                }),
                                radius: radius
                            })
                        })
                    } else if (currentFeature.getGeometry().getType() == 'LineString') {

                        var featureWidth = styleDefinition.split('width')[1].split(' ')[1].replace('})', '');

                        highlightStyle = new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: '#ffff00',
                                lineDash: null,
                                width: featureWidth
                            })
                        });

                    } else {
                        highlightStyle = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: '#ffff00'
                            })
                        })
                    }
                    featureOverlay.getSource().addFeature(currentFeature);
                    featureOverlay.setStyle(highlightStyle);
                }
                highlight = currentFeature;
            }
        }

        if (doHover) {
            if (popupText) {
                overlayPopup.setPosition(coord);
                content.innerHTML = popupText;
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
                closer.blur();
            }
        }
    };

    var doHighlight = false;
    var doHover = false;
    var sketch;

    var onSingleClick = function(evt) {
        if (doHover) {
            return;
        }
        if (sketch) {
            return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var coord = evt.coordinate;
        var popupField;
        var currentFeature;
        var currentFeatureKeys;
        var clusteredFeatures;
        var popupText = '<ul>';
        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            if (feature instanceof ol.Feature) {
                var doPopup = false;
                for (k in layer.get('fieldImages')) {
                    if (layer.get('fieldImages')[k] != "Hidden") {
                        doPopup = true;
                    }
                }
                currentFeature = feature;
                clusteredFeatures = feature.get("features");
                var clusterFeature;
                if (typeof clusteredFeatures !== "undefined") {
                    if (doPopup) {
                        for (var n = 0; n < clusteredFeatures.length; n++) {
                            clusterFeature = clusteredFeatures[n];
                            currentFeatureKeys = clusterFeature.getKeys();
                            popupText += '<li><table>'
                            for (var i = 0; i < currentFeatureKeys.length; i++) {
                                if (currentFeatureKeys[i] != 'geometry') {
                                    popupField = '';
                                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                        popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                                    } else {
                                        popupField += '<td colspan="2">';
                                    }
                                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                        popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                                    }
                                    if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                                        popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(clusterFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                                    } else {
                                        popupField += (clusterFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + clusterFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                                    }
                                    popupText += '<tr>' + popupField + '</tr>';
                                }
                            }
                            popupText += '</table></li>';
                        }
                    }
                } else {
                    currentFeatureKeys = currentFeature.getKeys();
                    if (doPopup) {
                        popupText += '<li><table>';
                        for (var i = 0; i < currentFeatureKeys.length; i++) {
                            if (currentFeatureKeys[i] != 'geometry') {
                                popupField = '';
                                if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                                    popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                                } else {
                                    popupField += '<td colspan="2">';
                                }
                                if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                                    popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                                }
                                if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                                    popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(currentFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                                } else {
                                    popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                                }
                                popupText += '<tr>' + popupField + '</tr>';
                            }
                        }
                        popupText += '</table>';
                    }
                }
            }
        });
        if (popupText == '<ul>') {
            popupText = '';
        } else {
            popupText += '</ul>';
        }

        /* lucas */
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
                        //temp_html = temp_html + "<tr><td colspan='2'>" + temp[0] + "</td></tr>" + ""
                        //texto2.push(temp[0])
                    }
                }
                if (cont == texto1.length - 1) {
                    temp_html = temp_html + "</table>" + "\n" + "</html>"
                }
                cont = cont + 1;
            }
            return (temp_html);

        }

        popupText2 = popupText
        var coord = evt.coordinate
        var viewProjection = map.getView().getProjection();
        var viewResolution = map.getView().getResolution();
        var projcorrigida = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')
            //var queryLayers = sigef.getParams().LAYERS
        for (i = 0; i < wms_layers.length; i++) {
            var coordinatesConv = function(a) {
                var coord_x = a[0].toFixed(4);
                var coord_y = a[1].toFixed(4);
                return "Informações do ponto" + "<br>" + "<b>Latitude/Longitude:</b>" + '&nbsp;[' + coord_x + '&nbsp;,&nbsp;' + coord_y + "]<br>"
            }
            if (wms_layers[i][1]) {
                var url = wms_layers[i][0].getSource().getGetFeatureInfoUrl(
                    evt.coordinate, viewResolution, viewProjection, {
                        //'INFO_FORMAT': 'application/json',
                        'REQUEST': 'GetFeatureInfo',
                        /*'EXCEPTIONS': 'text/plain',
                        'PropertyName': 'cod_imovel,flg_ativo,nom_municipio,ind_status_imovel', //retorna apenas as colunas de informações desejadas */
                        //'typeName': 'topp: states',
                        //'INFO_FORMAT': 'text/pain',
                        //'tileOptions': 'crossOriginKeyword: anonymous',
                        //'transitionEffect': null,
                        'outputFormat': 'text/plain',

                        //'crossOrigin': 'anonymous',

                    });
                if (url) {
                    var request_http = new XMLHttpRequest();
                    var body = 'Arun';
                    url_cors = "https://cors-anywhere.herokuapp.com/"
                    request_http.open("GET", url_cors + url, true);
                    request_http.onload = request_http.onerror = function() {
                        if (request_http.readyState === 4 && request_http.status === 200) {
                            popupText = arrumatexto(request_http.responseText)
                            if (popupText) {
                                overlayPopup.setPosition(coord);
                                content.innerHTML = popupText;
                                container.style.display = 'block';
                            } else {
                                container.style.display = 'none';
                                closer.blur();
                            }
                        } else {
                            popupText = arrumatexto(request_http.responseText)
                            if (popupText) {
                                overlayPopup.setPosition(coord);
                                content.innerHTML = popupText;
                                container.style.display = 'block';
                            } else {
                                container.style.display = 'none';
                                closer.blur();
                            }
                        }
                    }

                    request_http.send(body);

                    popupText = '<html>' + coordinatesConv(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')) + '<br>' + '</html>'
                } else {
                    console.log("clique vazio!")
                }
            }
        }

    };

    map.on('singleclick', function(evt) {
        onSingleClick(evt);
    });

    var tree = new layerTree({ map: map, target: 'layertree', messages: 'messageBar' })
        .createRegistry(map.getLayers().item(0))
        .createRegistry(map.getLayers().item(1))
        .createRegistry(map.getLayers().item(2));

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
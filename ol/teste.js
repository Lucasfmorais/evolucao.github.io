$.getJSON('/api/integracaoindeinda/get?url=' + INTEGRACAO_INDE_INDA_URL + 'AP_2014')
    .done(function () { console.log('socket indeinda'); });
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//Acerto de layout inicial para quando é mobile
if (isMobile)
{
    //$('#btnToponimia i.fa-font').css({ 'top': '21.7em', 'padding-right': '0.2em' });
    //$('#toponimia-checked').css('top', '40em');
    $('#graticule-checked').css('top', '20.5em');
    $('#container-legendas').css('width', '66%');
    $('#container-legendas').css('left', '17%');
    $('#container-legendas').css('top', '10.5em');
    $('#localidade').attr('placeholder', 'Buscar em OSM');
    $('#container-legendas').addClass('container-vinde');
    

    //$('.em_avaliacao').css('top', '2.2em');
}
else
{
    //$('.em_avaliacao').css('top', '0.7em');
}
//Montar menu aplicação

$(document).ready(function () {
    var uriSumario = '/api/montamenu';
    countTotal = -1;
    var padding_value = 0;
    var menu_icon = '';
    $.getJSON(uriSumario)
        .done(function (dataSumario) {
            //console.log(dataSumario);
            $.each(dataSumario, function (key, item) {
                //countTotal = countTotal + 1
                MontaMenu(item, '#menu-aplicacao', '  data-parent="#menu-aplicacao"', padding_value, 2);
            });

            // Os popovers devem ser inicializados manualmente.
            InicializaPopovers('[data-toggle="popover"]');

            //console.log(listaServicos);
        }).done(function () {
            ApplyBulletsLogic();
            var inputs = $('.layer-checkbox');
            //for (var i = 0; i < inputs.length; i++) {
            $('.layer-checkbox').each(function () {
                $(this).change(function () {                    
                    if ($(this).is(':checked')) {
                        //console.log(' Checkbox is checked..');
                        var url = $(this).attr('url');
                        var camada = $(this).attr('camada');
                        var element = $(this);
                        AddLayer(url, camada, map, element);                       
                        //console.log($(this).parent().parent().parent().parent());
                    }
                    else
                    {
                        //console.log(' Checkbox is not checked..1');
                        //console.log(this);
                        var ol_uid = $(this).attr('ol_uid');
                        //$(this).attr('ol_uid', '');
                        RemoveLayer(ol_uid, false);                                               
                    }
                    if ($('#swipe').css('display') == 'block') {
                        UnregisterSwipeEvents();
                        SwipeCamadas(true);
                    }
                });
            });
            //}
            $('.nav-link-collapse').on('click', function (e) {
                e.preventDefault();                

                //Verifica se há algum popover aberto e fecha todos
                $('.popover-camada').remove();
                var itemHtml = $(".sidebar-search");
                
                if (itemHtml.hasClass("esconder-li")) {
                    itemHtml.removeClass("esconder-li hidden");
                    $('#sidebar-search-icon').addClass("hidden");
                    mapItemsMove(true);
                }

                // É preciso atualizar o tamanho do mapa para nao ficar distorcido quando o menu é recolhido.
                map.updateSize();
            });

            //Repete o comportamento para mobile
            $('.navbar-toggler-icon').on('click', function (e) {
                //Verifica se há algum popover aberto e fecha todos
                $('.popover-camada').remove();
            });
            var teste = $('#visualiza_camada').val();
            if (teste != null && teste != '') {
                VisualizaCamada();
            }

            console.log('document.ready()');
            // Para os três pontinhos também ativarem o popover de operações sobre as camadas.
            ApplyPopoverOnEllipsis();
            HandleDisclaimer();

        });
    /*
    //Inicia com o menu recolhido, se não for um dispositivo móvel
    var mobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    //Adaptações para mobile
    if (!mobileDevice) {
        $("body").toggleClass("sidenav-toggled");
        $(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
        $(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level, .navbar-sidenav .sidenav-fourth-level").removeClass("show");
        $('#navbar-separator').removeClass("hidden");
    }
    else {
        $(".sidebar-search").removeClass("esconder-li hidden");
        $('#sidebar-search-icon').addClass("hidden");
        $('#navbar-separator').addClass("hidden");
    }

    $('[data-parent="#exampleAccordion"]').click(function () {
        $('#menu-filtradas').show();
    });

    $('#sidenavToggler').click(function () {
        //console.log('toggler foi clicado...');
        if ($('#input-busca-camadas').is(':visible')) {
            $('#menu-filtradas').show();            
        }
        else {
            $('#menu-filtradas').hide();            
        }
    });
    */

});
/*
//Montar menu instituição
$(document).ready(function () {
    var uriSumario = '/api/montamenuinstituicao';
    countTotal2 = -1;
    var padding_value = 0;
    var menu_icon = '';
    $.getJSON(uriSumario)
        .done(function (dataSumario) {
            //console.log(dataSumario);
            $.each(dataSumario, function (key, item) {

                countTotal2 = countTotal2 + 1
                MontaMenu(item, '#menu-aplicacao-instituicao', '  data-parent="#menu-aplicacao-instituicao"', padding_value, 2);

            });
            var teste = $('#visualiza_camada').val();
            if(teste != null && teste != '')
            {
                VisualizaCamada();
            }
            
            //console.log(listaServicos);
        });
});*/

//Pega URLs para o busca camadas em catálogos externos. Esta é a lista de instituições da INDE.
$(document).ready(function () {
    var uriSumario = '/api/buscacamada';
    $.getJSON(uriSumario)
        .done(function (dataSumario) {
            //console.log(dataSumario);
            $.each(dataSumario, function (key, item) {
                //console.log(key, item);
                $('<option value="' + item.url + '">' + item.descricao + '</option>').appendTo($("#url-wms-externo-select"));
            });
        });
});

/* Ao clicar no mapa, mostra as informações do GetFeatureInfo de todas as camadas visíveis. */
map.on('singleclick', function (evt) {
    //console.log(evt);
    if (clickEnabled) //clickEnabled definida em Mapa.js
    {        

        //document.getElementById('popup-content').innerHTML = '';
        var viewResolution = view.getResolution();
        //console.log(view);
        //console.log(viewResolution);
        /* Para cada layer visivel do mapa, chamar getFeatureInfo */
        // Está chamando somente para a camada mais ao topo do mapa.
        var layers = map.getLayers().getArray().sort(compareByZIndex);
        var i = layers.length - 1;

        $('#ModalFeatureInfo .info-latlong').remove();
        $('#ModalFeatureInfo .layer-title').remove();
        $('.dataTables_wrapper').remove();        

        var LatLong = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        $('<span class="info-latlong" style="font-size: 14px;">LatLong: [' + LatLong + ']</span>').appendTo('#ModalFeatureInfo .modal-title');
        while (i > 0) {

            //console.log(i);
            if (layers[i].type == 'TILE' && layers[i].getVisible() && layers[i].get('type') != 'camada_base' && layers[i].get('name') != 'toponimia' ) {
                var layer = layers[i];
                var url = layer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': 1 });
                //console.log('GetFeatureInfo vindo com url errada: ' + url);
                //console.log(url);
                url = url.replace('GetMap', 'GetFeatureInfo'); // Mudei na marra pois estava sempre vindo com GetMap
                url = url.replace(' ', '');
                //console.log(url);
                i--; // Quando valer para todas as camadas do mapa, vou decrementar o i, atualmente vale a linha de baixo.
                //i = 0;
                if (url) {
                    /*var previousHtml = document.getElementById('popup-content').innerHTML
                    document.getElementById('popup-content').innerHTML = previousHtml + '<iframe seamless src="' + url + '"></iframe>';
                    overlay.setPosition(evt.coordinate);*/
                    url = '/api/featureinfo/get?url=' + encodeURIComponent(url);
                    $.getJSON(url)
                        .fail(function (e) { })
                        .done(function (data) {
                            //console.log(data);
                            var layer;
                            if (data != null)
                                layer = getLayerByName(data.LayerName);
                            else
                                return;

                            if (data.Element.length == 0)
                                return;

                            var table = '<table id="table-layer-'+ layer.ol_uid + '" class="table table-feature-info table-bordered table-hover display nowrap" cellspacing="0" width="100%"><thead><th>Nome</th><th>Valor</th></thead>';

                            for (var i = 0; i < data.Element.length; i++) {
                                table = table + '<tr><td>' + data.Element[i].Key + '</td><td>' + data.Element[i].Value + '</td></tr>' ;
                            }

                            table = table + '</table>';                            

                            //var descricao = $('#menu-selecionadas .layer-checkbox[camada="' + data.LayerName + '"]').attr('descricao');
                            var descricao = $('#lista-admin-camadas .layer-checkbox[camada="' + data.LayerName + '"]').attr('descricao');
                            //console.log('LatLong[' + LatLong + ']');
                            //$('#ModalFeatureInfo .modal-title').text(descricao); // Colocar a descrição da camada aqui.                            

                            if ($('#table-layer-'+ layer.ol_uid + '_wrapper').length != 0)
                            {
                                $('#table-layer-' + layer.ol_uid + '_wrapper').remove();
                            }

                            if($('#table-layer-' + layer.ol_uid).length != 0)
                            {
                                $('#table-layer-' + layer.ol_uid).remove();
                            }

                            // É preciso garantir que a tabela com todos os dados (requisição GetFeature) foi removida por causa da função com filtro personalizado, 
                            // que vai executar e bagunçar a tabela do GetFeatureInfo.
                            $('#table-inde_wrapper').remove();

                            $('<h5 class="layer-title">' + descricao + '</h5>').appendTo('#ModalFeatureInfo .modal-body');
                            $(table).appendTo('#ModalFeatureInfo .modal-body');

                            $('#table-layer-' + layer.ol_uid).DataTable({
                                dom: 'Bltip',
                                language: {
                                    url: '/Scripts/Vinde/datatables_portuguese_brasil.json',
                                },
                                iDisplayLength: 25,
                                destroy: 'true',
                                buttons: [{
                                    extend: 'csv',
                                    orientation: 'landscape',
                                    pageSize: 'A4',
                                }
                                , {
                                    extend: 'pdfHtml5',
                                    orientation: 'landscape',
                                    pageSize: 'A4',
                                }]
                            });
                                                        
                        });
                }
            }
            else
            {
                i--;
            }
        }

        $('#ModalFeatureInfo').modal();
    }
});

//Ação do botão para não mostrar mais a mensagem inicial sobre nao validade do osm como dado oficial
$('#dismissDisclaimer').click(function () {
    document.cookie = "dismiss_disclaimer=true;";
});


// Para o campo de busca de camadas responder ao ENTER do teclado.
$('#input-busca-camadas').bind('keypress', function (e) {
    var code = e.keyCode || e.which;
    if (code == 13) { //Enter keycode
        var string_busca = $('#input-busca-camadas').val();
        FiltraMenuCamadas(string_busca.split(' '));
    }
    // Para atualizar a posição de algum popover do menu que porventura esteja sendo mostrado, senão ele vai aparecer ao lado dos resultados das camadas filtradas;
    $('[aria-describedby]').popover('update');
});

$('#btn-busca-camadas').click(function () {
    var string_busca = $('#input-busca-camadas').val();
    FiltraMenuCamadas(string_busca.split(' '));
});

$('#btn-limpa-camadas').click(function () {
    $('[aria-describedby]').popover('update'); // atualização da posição dos popovers
    $('#menu-filtradas [data-toggle="popover"]').popover('hide'); // esconder os popovers do menu de filtradas antes de remover o menu
    $("#input-busca-camadas").val(""); 
    $('#menu-filtradas .menu-item').remove(); //remove o menu de filtradas
});

$('#limpar-camada-externa').click(function () {
    if (catalogo_request != null)
    {
        catalogo_request.abort();
        $('#loading-lista-camadas-externas').css('display', 'none');
    }
    $('.popover-camada').remove();
    $("#url-wms-externo").val("");
    $("#url-wms-externo-select").val("");
    $('#lista-camadas-externas .menu-item').remove();
    $('.filtra-camadas-catalogo').css('display', 'none');
    $('#filtra-camadas-catalogo').val('');    
});

function MontaMenu(item, parent_selector, data_parent, padding_value, level, div_display) {
    if (typeof div_display == 'undefined' || div_display == null || div_display == "")
        div_display = "flex";
    //Define o nivel do nó
    var levelClass = getLevelClass(level + 1);
    //console.log('MontaMenu > count:' + countTotal + ' | text:' + item.text + ' | parentSelector:' + parent_selector + (item.children == null ? '' : ' | childrenCount:' + item.children.length) + ' | level:' + level + ' | levelClass:' + levelClass);

    var padding = padding_value + 'em';

    //Se não tiver filhos é uma folha da arvore: apenas monta o html e da append no nó pai, que já vem no parametro da função.
    if (item.children == null) {

        //Foram criados temas sem nenhuma camada, eles apareciam como camadas no menu, por isso essa proteção abaixo.
        if (item.Tipo != 'camada')
            return;
        //Ordem de Pai pra Filho: Container > Link > Anchor > Span > Label
        var rootItemContainer = $('<div class="menu-item" style="padding: 0; margin: 0 0 0 10px; display: ' + div_display + ';"></div>');
        
        //Divs do texto da camada
        var rootItemLink = $('<li class="nav-item col-xs-11" data-toggle="tooltip" data-placement="right" style="padding: 0; width: 100%;"></li>');
        var rootItemAnchor = $('<a style="padding: 8px 0; font-size: 12px !important;" class="nav-link collapsed" ref="tables.html"></a>');
        var rootItemSpan = $('<span class="nav-link-text"></span>');
        var rootItemLabel = $('<label class="form-check-label" style="padding: 0;  display:flex;"></label>');
        //var rootItemInfo = $('<div metadado="' + item.UuidMetadado + '" class="col-md-1" style="margin: auto 0; padding: 0;"><i class="fa fa-info-circle" aria-hidden="true"></i></div>');
        var rootItemTexto = $('<div style="padding: 0; display:flex;">' + 
                                '<span style="margin: auto 0;">' +
                                    '<a class="popover-menu-camadas" ol_uid="" ' +
                                        'srs="'+ item.SRS +'"' +
                                        'crs="'+ item.CRS +'"' + 
                                        ' bbox="' + item.bleft + ',' + item.bbottom + ',' + item.bright + ',' + item.btop +
                                        '" metadado="' + item.UuidMetadado +
                                        '" metadado-url="' + item.UrlMetadado +
                                        '" url="' + item.Url +
                                        '" camada="' + item.Descricao +
                                        '" descricao="' + item.text +
                                        '" role="button" data-toggle="popover" data-trigger="click"' +
                                        ' title="Operações Sobre a Camada" style="color:black;">' + item.text +
                                    '</a></span></div>');

        //Div do checkbox
        var rootItemCheckBox = $('<div class="col-xs-1" style="margin: auto 0; padding: 0; display:block; width: 2em;"><input class="layer-checkbox" style="margin:auto 0;" type="checkbox" url="' + item.Url + '" camada="' + item.Descricao + '" srs="' + item.SRS + '" crs="'+ item.CRS + '" bbox="' + item.bleft + ',' + item.bbottom + ',' + item.bright + ',' + item.btop + '" descricao="' + item.text + '" >&nbsp;</div>');

        //A div do checkbox vai como filha do Container
        rootItemCheckBox.appendTo(rootItemContainer);

        //Associa os elementos, tendo como filho do Container o Link
        rootItemTexto.appendTo(rootItemLabel);
        // três pontinhos no menu
        $('<span class="icon-operacoes-camada" camada="' + item.Descricao + '"><i class="fa fa-ellipsis-h"></i></span>').appendTo(rootItemLabel);
        rootItemLabel.appendTo(rootItemSpan);        
        rootItemSpan.appendTo(rootItemAnchor);        
        rootItemAnchor.appendTo(rootItemLink);
        rootItemLink.appendTo(rootItemContainer);

        //Adiciona a container ao parent_selector
        rootItemContainer.appendTo(parent_selector);
        //$(parent_selector).css('margin-left', '-1em');
    }

        //Se tiver filhos é preciso setar o id_menu que será parent_selector de outros , dar append e chamar a função recursivamente para cada filho.  
    else
    {
        menu_icon = '';
        var id_menu = '';

        if (item.children.length > 0)
            id_menu = 'collapseMulti_' + ++countTotal;

        $('<li class="nav-item" data-toggle="tooltip" data-placement="right" ><a style="padding-left: ' + padding + '; font-size: 12px !important;" class="nav-link nav-link-collapse collapsed" data-toggle="collapse" href="#' + id_menu + ' "' + data_parent + ' ><i class="fas ' + MENU_BULLET_RIGHT + ' ' + menu_icon + '">&nbsp;</i><span class="nav-link-text">' + item.text + '</span></a><ul class="sidenav-' + levelClass + ' collapse" id="' + id_menu + '"></ul></li>').appendTo(parent_selector);

        var count = countTotal;
        var new_padding = padding_value + 0.5;
        if (item.children.length > 0) {
            for (var i = 0; i < item.children.length; i++) {
                MontaMenu(item.children[i], '#' + id_menu, 'data-parent="#collapseMulti_' + count + '"', new_padding, (level + 1));
            }
        }
    }
}

function AddLayer(url, layerName, map, element) {
    //console.log('AddLayer()');
    //console.log(element);
    var wmsSource = new ol.source.TileWMS({
        url: url,
        params: {
            'LAYERS': layerName,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'SERVICE': 'WMS',
            'VERSION': '1.3.0',//'1.1.1',
            'REQUEST': 'GetMap',
            'SRS': 'EPSG:3857',
            'CQL_FILTER': null, //'NAME LIKE \'%RIO%\'', /* somente um exemplo */
            // 'BBOX': '-5792166.2545313,-3600523.7798436,-5635623.220625,-3443980.7459374',
            'TILED': true
        },
        serverType: 'geoserver',
        //crossOrigin: ''
    });
    //Layer com os dados da camada do IBGE
    var wmsLayer = new ol.layer.Tile({
        source: wmsSource
    });


    var descricaoLegenda = element.attr('descricao');
    var bbox = element.attr('bbox').split(',').map(Number) ;
    
    /*  Checar se a camada já esta no  mapa.  */

    var layers = map.getLayers().getArray();
    for (var i = 1; i < layers.length; i++) {
        //É preciso checar se a camada é do tipo "TILE" pois as "VECTOR" são dos marcadores de localidade e nao possuem o atributo "params".
        if (layers[i].type == 'TILE' && layers[i].get('name') == layerName) {
            /* Se já estiver no mapa , não adiciona, e retorna o unique id. */            
            layers[i].setVisible(true);
            element.attr('ol_uid', layers[i].ol_uid );
            AdicionaLegenda(url, layerName, layers[i].ol_uid, descricaoLegenda);
            map.render();
            $('input[ol_uid=' + layers[i].ol_uid + ']').prop('checked', true);
            $('input[camada="' + layers[i].get('name') + '"]').prop('checked', true); // garante que no menu-instituicao tb vai fica ticado???
            return layers[i].ol_uid;
        }
    }
    wmsLayer.set('name', layerName);
    wmsLayer.set('bbox', bbox);
    /* Se não estiver no mapa, adiociona e retorna o unique id. */
    map.addLayer(wmsLayer);
    //zoomToLayer(wmsLayer); // foca o zoom na camada recem adicionada. - Desistimos desta funcionalidade pois pode atrapalhar a operação do usuário dependendo do que ele quer fazer. O zoom ainda pode ser obtido com o botão da lupa no popover com operações sobre a camada.
    wmsLayer.setZIndex(map.getLayers().getLength());
    var index = map.getLayers().getLength() - 1;
    var ol_uid = map.getLayers().getArray()[index].ol_uid;
    element.attr('ol_uid', ol_uid);

    /* Registra eventos para quando uma camada começa e termina de carregar, para mostrar um gif de loading. */
    RegistraEventosCamada(wmsSource, ol_uid);

    /* Checa se o elemento já está no menu de selecionadas. Apenas adiciona se não estiver. */
    if ($('#lista-admin-camadas input[ol_uid=' + ol_uid + ']').length == 0) {
        
        var camada = element.parent().parent()[0].cloneNode(true);
        
        //Jquery Ui sortable está impedindo o botões do menu selecionadas de funcionar no mobile, por isso somente adiciona sortable se não for mobile.
        if (!isMobile)
        {
            $(camada).addClass('ui-state-default ui-sortable-handle');
        }
        
        $(camada).attr('position', index);
        $(camada).css('display', 'flex'); // se veio do visualiza camada, o display está none, assim volta para o default.
        //document.getElementById("menu-selecionadas").appendChild(camada);
        $('#lista-admin-camadas').prepend(camada);

        //var camada = element.parent().parent().parent().parent().parent()[0].cloneNode(true);  ou $(ajshdalshd).clone(true, true)
        //$(camada).appendTo('#menu-selecionadas');

        $('input[ol_uid=' + ol_uid + ']').prop('checked', true);
        $('input[camada="' + layers[i].get('name') + '"]').prop('checked', true); // garante que no menu-instituicao tb vai fica ticado???
        /*$(element.parent().parent().parent().parent()[0].outerHTML).appendTo('#menu-selecionadas');
        $('#menu-selecionadas input[ol_uid=' + ol_uid + ']').attr('checked', true);*/
                
        $('#lista-admin-camadas input[ol_uid=' + ol_uid + ']').parent().append('<button ol_uid="' + ol_uid + '" type="button" class="btn btn-link btn-full-delete-layer" style="padding-left: 0px;color: #3D4A3D;"><i class="fa fa-trash"></i></button>');
        // Para os três pontinhos também ativarem o popover de operações sobre as camadas.
        console.log('AddLayer()');
        //ApplyPopoverOnEllipsis();
    }

    /* Para fazer com que os elementos recem adiocionados no menu tenham o mesmo comportamento dos que foram criados junto com o primeiro carregamento da página */
    UpdateMenus('#lista-admin-camadas .layer-checkbox');
    InicializaPopovers('#lista-admin-camadas a [camada="' + layerName + '"]');

    AdicionaLegenda(url, layerName, ol_uid, descricaoLegenda, index);

    if (!isMobile)
    {
        //$('#menu-selecionadas').sortable({
        $('#lista-admin-camadas').sortable({
            update: function (event, ui) {
                $('.popover-camada').popover('hide');//$('.popover-camada').remove(); // para remover popovers abertos quando fechar o menu do catalogo.
                // pegar o dom do menu selecionadas, é preciso atualizar as posições
                //var dom_selecionadas = $('#menu-selecionadas .ui-sortable-handle');
                var dom_selecionadas = $('#lista-admin-camadas .ui-sortable-handle');
                var dom_legendas = $('.menu-legendas-item');
                var dom_admin_camadas = $('#lista-admin-camadas .layer-checkbox')
                for (var i = 0; i < dom_selecionadas.length; i++) {
                    // Todas as camadas devem ter a posição atualizada ( por segurança e praticidade); Tem o +1 no indice pq a primeira camada do mapa é sempre a camada base.
                    $(dom_selecionadas[i]).attr('position', i + 1);
                    console.log('testando...');
                    // Um loop adicional para mudar a posição das legendas
                    for (var j = 0; j < dom_legendas.length; j++) {
                        //somente atualiza o atributo position se tiverem o mesmo ol_uid
                        if ($(dom_legendas[j]).attr('ol_uid') == $(dom_admin_camadas[i]).attr('ol_uid'))
                        {
                            $(dom_legendas[j]).attr('position', i + 1);
                            //console.log('atualizou position...');
                            break;
                        }
                    }
                    
                    //var camada = getLayerByName($($('#menu-selecionadas .layer-checkbox')[i]).attr('camada'));
                    var camada = getLayerByName($($('#lista-admin-camadas .layer-checkbox')[i]).attr('camada'));
                    //camada.setZIndex(i + 1);
                    camada.setZIndex(dom_selecionadas.length - i);
                }                
                
                // Ordena o vetor de legendas peloa tributo position
                [].sort.call(dom_legendas, function (a, b) {
                    return -$(a).attr('position') - -$(b).attr('position');
                });

                //Apaga as legendas que agora estão fora de ordem
                $('.menu-legendas-item').remove();

                // Insere as legendas na ordem correta
                for (var i = 0; i < dom_legendas.length; i++)
                {
                    $('#menu-legendas').prepend('<div style="max-width: 334px;" class="menu-legendas-item" ol_uid="' + $(dom_legendas[i]).attr('ol_uid') + '" position="' + $(dom_legendas[i]).attr('position') + '">' + $(dom_legendas[i]).html() + '</div>');
                }                
                
                UnregisterSwipeEvents();                
            }
        });
    }
    
    //$("#menu-selecionadas").disableSelection();
    $("#lista-admin-camadas").disableSelection();

}

function RemoveLayer(id_to_remove, fullDelete) {
    //console.log('id to remove = ' + id_to_remove);
    var layers = map.getLayers().getArray();
    var layerToRemove = null;

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].ol_uid == id_to_remove) {
            layerToRemove = layers[i];
            break;
        }
    }

    if (layerToRemove == null)
    {
        //console.log('Algo deu errado pois não foi possivel encontrar a camada a ser removida.');
        return;
    }        
    
    layerToRemove.setVisible(false);

    $('input[ol_uid=' + layerToRemove.ol_uid + ']').prop('checked', false); // remove ticado dos outros menus
    $('input[camada="' + layerToRemove.get('name') + '"]').prop('checked', false); // remove ticado do menu instituição

    
    /* Apenas remover do mapa se remover do menu selecionadas, senão somente tornar invisible, para manter o mesmo ol_uid. */
    if (fullDelete) {
        $('.popover-camada').remove(); // remove o popover da camada que esta sendo excluida
        map.removeLayer(layerToRemove);
        // Remover o label "[FILTRADA]" do menu das camadas excluidas do mapa.
        $('.popover-menu-camadas[camada="' + layerToRemove.get('name') + '"] span.filtrada').remove();

        if ($('#swipe').css('display') == 'block') {
            UnregisterSwipeEvents();
            SwipeCamadas(true);
        }
    }

    RemoveLegenda(id_to_remove);

    /* Como somente mudamos a visibilidade da camada, é preciso atualizar o mapa na tela. */
    map.render();
}

function UpdateMenus(selector) {
    var inputs = $(selector);
    for (var i = 0; i < inputs.length; i++) {
        $(inputs[i]).change(function () {
           
            if ($(this).is(':checked')) {
                //console.log(' Checkbox is checked..');
                var url = $(this).attr('url');
                var camada = $(this).attr('camada');
                var element = $(this);
                AddLayer(url, camada, map, element);

            } else {
                //console.log(' Checkbox is not checked..2');
                var ol_uid = $(this).attr('ol_uid');
                //$(this).attr('ol_uid', '');
                RemoveLayer(ol_uid, false);
            }
            if ($('#swipe').css('display') == 'block') {
                UnregisterSwipeEvents();
                SwipeCamadas(true);
            }
        });
    }

    $('.btn-full-delete-layer').click(function () {
        $(this).parent().parent().remove();
        RemoveLayer($(this).attr('ol_uid'), true);        
    })
}

function AdicionaLegenda(url, layerName, ol_uid, descricaoLegenda, position) {
    /* Checa se a legenda já está presente */
    if ($('#menu-legendas div[ol_uid=' + ol_uid + ']').length == 0) {
        var urlLegenda = url + '?TRANSPARENT=TRUE&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2Fvnd.ogc.se_xml&LAYER=' + layerName + '&SCALE=13867008.52318302&FORMAT=image%2Fgif';
        var domString = '<div style="max-width: 334px;" class="menu-legendas-item" ol_uid="' + ol_uid + '" position="'+ position +'"><p><span style="font-size: 12px;">' + descricaoLegenda + '</span></p><div><img src="' + urlLegenda + '" ></div><hr /></div>';
        //$(domString).appendTo('#menu-legendas');
        // Para add a legenda por cima, como uma pilha.
        $('#menu-legendas').prepend(domString);
    }
}

function RemoveLegenda(ol_uid) {
    $('#menu-legendas div[ol_uid=' + ol_uid + ']').remove();
}

function getLevelClass(level) {
    var levelClass = '';

    switch (level) {
        case 2:
            levelClass = 'second-level';
            break;
        case 3:
            levelClass = 'third-level';
            break;
        case 4:
            levelClass = 'fourth-level';
            break;
        case 5:
            levelClass = 'fifth-level';
            break;
        case 6:
            levelClass = 'sixth-level';
            break;
        case 7:
            levelClass = 'seventh-level';
            break;
        case 8:
            levelClass = 'eigth-level';
            break;
        default:
            levelClass = 'second-level';
            break;
    }

    return levelClass;
}

/* Exibe o Metadado no Modal específico. Html do modal em Index.cshtml */
function ExibeMetadado(metadado) {
    //console.log(metadado);
    if (metadado == null) {
        $('#ModalSemMetadado').modal();
        return;
    }

    $('#titulo-modal-metadado').text(metadado.informacaoIndentificacaoCDG.titulo);

    verificaMetadado('#resumo-modal-metadado', metadado.informacaoIndentificacaoCDG.resumo);
    verificaMetadado('#data-modal-metadado', metadado.informacaoIndentificacaoCDG.data);

    verificaMetadado('#organizacao-modal-metadado', metadado.informacaoIndentificacaoCDG.organizacaoResponsavel);
    verificaMetadado('#responsavel-modal-metadado', metadado.informacaoIndentificacaoCDG.nomeResponsavel);
    

    verificaMetadado('#fax-modal-metadado', metadado.informacaoIndentificacaoCDG.faxResponsavel);
    verificaMetadado('#telefone-modal-metadado', metadado.informacaoIndentificacaoCDG.telefoneResponsavel);

    verificaMetadado('#endereco-modal-metadado', metadado.informacaoIndentificacaoCDG.enderecoResponsavel);
    verificaMetadado('#cidade-modal-metadado', metadado.informacaoIndentificacaoCDG.cidadeResponsavel);
    verificaMetadado('#cep-modal-metadado', metadado.informacaoIndentificacaoCDG.cepResponsavel);
    verificaMetadado('#pais-modal-metadado', metadado.informacaoIndentificacaoCDG.paisResponsavel);

    verificaMetadado('#palavras-modal-metadado', metadado.informacaoIndentificacaoCDG.palavrasDescritivas);
    verificaMetadado('#projecao-modal-metadado', metadado.informacoesSistemaReferencia.sistemaProtecao);
   
    $('#ModalMetadado').modal();
}

/* Verifica se o metadado está preenchido. Caso contrário, esconde o elemento. */
function verificaMetadado(id, text) {
    if (text != "") {
        $(id + "-container").removeClass("hidden");
        $(id).text(text);
    }
    else
        $(id + "-container").addClass("hidden");
}

/* Exibe a URL WMS no modal específico. Html do modal em Index.cshtml */
function ExibeUrlWms(url) {
    //console.log('WMS: ' + url);
    if (url == null) {
        $('#ModalSemMetadado').modal();
        return;
    }    
    $('#url-wms-modal').val(url);    
    $('#ModalUrlWms').modal();
}

function RetornaAnchor(item) {
    var irmaos = $(item).parent().children();
    if (irmaos != null && irmaos.length > 0) {
        var div = irmaos[0];
        if (div.children != null && div.children.length > 0 && div.children[0].children != null && div.children[0].children.length > 0) {
            var anchor = div.children[0].children[0];
            if (anchor.tagName == "A" && anchor.className.indexOf("popover-menu-camadas") != -1)
                return anchor;
        }
    }
    return item;
}

/* Monta o html dos botões de operação sobre as camadas. */
function MontaDOMPopoverCamada(item) {
    var dom = '';
    var uuid_metadado = $(item).attr('metadado');
    var url_metadado = $(item).attr('metadado-url');
    var base_url = $(item).attr('url');
    var url_wms = $(item).attr('url') + '?service=WMS&version=1.1.0&request=GetMap&layers=' + $(item).attr('camada');    
    var url_csv = $(item).attr('url') + '?service=WFS&version=1.0.0&request=GetFeature&typeName=' + $(item).attr('camada') + '&outputFormat=csv';
    var url_kml = $(item).attr('url') + '?service=WMS&version=1.1.0&request=GetMap&layers=' + $(item).attr('camada') + '&width=1024&height=768&bbox=' + $(item).attr('bbox') + '&format=application/vnd.google-earth.kmz+xml';
    var url_shapefile = $(item).attr('url') + '?service=WFS&version=1.0.0&request=GetFeature&typeName=' + $(item).attr('camada') + '&outputFormat=SHAPE-ZIP';
    
    //var btn_metadado = '<button id="btn-exibe-metadado" uuid="' + uuid_metadado + '" type="button" class="btn btn-success btn-margin-bottom btn-sm" data-toggle="tooltip" data-placement="left" title="Exibir Metadado"><img src="'+ base_url + '/Images/metadado-40x40.png" height="16" width="16" style="margin-top:-2px;"></button>';
    var btn_metadado = '<button id="btn-exibe-metadado" uuid="' + uuid_metadado + '" url_metadado="' + url_metadado  + '" camada="' + $(item).attr('camada') + '" type="button" class="btn btn-success btn-margin-bottom btn-sm" data-toggle="tooltip" data-placement="left" title="Exibir Metadado"><i class="fas fa-code"></i></button>';
    var btn_url_wms = '&nbsp;<button id="btn-url-wms" wms="' + url_wms + '" type="button" class="btn-sm btn btn-success btn-margin-bottom" data-toggle="tooltip" data-placement="left" title="Url WMS"><i class="fa fa-link"></i></button>';
    
    var btn_table_url = $(item).attr('url').replace('/wms', '');
    var btn_table_camada = $(item).attr('camada');
    var btn_table_descricao = $(item).attr('descricao');
    var btn_table = '&nbsp;<button id="btn-table" url="' + btn_table_url + '" camada="' + btn_table_camada + '" descricao="' + btn_table_descricao + '" type="button" class="btn-sm btn btn-success btn-margin-bottom" data-toggle="tooltip" data-placement="left" title="Tabela de Atributos"><i class="fa fa-table"></i></button>';

    var btn_zoomToLayerExtent = '&nbsp;<button id="btn-zoom-to-layer-extent" camada="' + $(item).attr('camada') + '" bbox="' + $(item).attr('bbox') + '" type="button" class="btn-sm btn btn-success btn-margin-bottom" data-toggle="tooltip" data-placement="left" title="Zoom Para a Camada"><i class="fa fa-search-plus"></i></button>';

    var btn_download_csv = '&nbsp;<button id="btn-download-csv" camada="' + $(item).attr('camada') +   '" url="' + url_csv + '" base_url="' + base_url + '" type="button" class="btn-sm btn btn-success btn-margin-bottom" data-toggle="tooltip" data-placement="left" title="Download Arquivo CSV"><i class="fa fa-file-o" style="font-size: 1.5em; margin-left: -3px;"><span id="txt-btn-csv" style="margin-left: -17px; color: #FFFFFF; font-size: 11px;">csv</span></i></button>';
    var btn_download_kml = '&nbsp;<button id="btn-download-kml" camada="' + $(item).attr('camada') + '"  url="' + url_kml + '" type="button" class="btn-sm btn btn-success btn-margin-bottom btn-downloads-camada" data-toggle="tooltip" data-placement="left" title="Download Arquivo KMZ"><i class="fa fa-download"></i></button>';
    var btn_download_shapefile = '&nbsp;<button id="btn-download-shapefile" camada="' + $(item).attr('camada') + '"  url="' + url_shapefile + '" type="button" class="btn-sm btn btn-success btn-margin-bottom btn-downloads-camada" data-toggle="tooltip" data-placement="left" title="Download Arquivo Shape"><i class="fa fa-file-archive-o"></i></button>';
    var slider_opacidade = '<input camada="' + $(item).attr('camada') + '" id="opacidade-range-slider" type="range" min="0" max="100" value="0" style="width: 17em;">';
    var titulo_transparencia = '<p style="margin:0;margin-top:-5px;text-align:center;font-size:10px;">Transparência</p>'

    //http://www.geoservicos.inde.gov.br/geoserver/wms?service=WFS&version=1.0.0&request=GetFeature&typeName=BNDES:AP_2014&outputFormat=SHAPE-ZIP
    var loading_gif = '</br><div id="loading-btn-table" class="alert" style="background-color:rgba(0,0,0,0); color:#999999; text-align:center; display: none; margin-bottom: -1em; margin-top: -1em;" role="alert"><img src="/Images/loading.gif" width="16" height="16" /> carregando dados...</div><div id="table-error-message" style="display: none; margin-top: -1em; text-align: center;"><span style="font-size: 10px; color: #FFC107;">Serviço indisponível</span></div>';
    // O DOM do popover é o que será incluido próprio bootstrap no popover-body (definido no template em InicializaPopovers)
    var dom = dom + btn_metadado + btn_url_wms + btn_table + btn_zoomToLayerExtent + btn_download_csv + btn_download_kml + btn_download_shapefile + loading_gif + slider_opacidade + titulo_transparencia;

    return dom;
}

function InicializaPopovers(selector) {
    //console.log('SELECTOR :  ' + selector);
    // Se for dispositivo mobile o popover vai aparecer abaixo do menu, se não, do lado direto do menu.
    var popover_spawn_position = 'right';
    
    if(isMobile)
        popover_spawn_position = 'bottom';
    //console.log(selector);
    $(function () {
        $(selector).popover({
            html: true,
            container: 'body',
            content: function () {
                //Verifica se o item passado é o <a>
                var item = this.tagName === "A" ? this : RetornaAnchor(this);
                return MontaDOMPopoverCamada($(item)[0]);
            },
            trigger: 'click',
            placement: popover_spawn_position,
            template: '<div class="popover popover-camada" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
        });
        //console.log('Inicializou popovers...');
    });
    
    $(selector).on('click', function () {
        // acrescentando [aria-describedby] no selector fica bem mais rápido porém volta ao comportamento esquisito dos botões do popover pararem de responder.
        //$('[data-toggle="popover"][aria-describedby]').popover('hide');        
        //aqui this é o pai do popover
        
        //Verifica se o item passado é o <a>
        var item = this.tagName === "A" ? this : RetornaAnchor(this);

        $('[aria-describedby]').not(item).popover('hide');

        //Se tiver popovers abertos, fecha todos
        if ($('.popover').length > 0) {
            $('[aria-describedby]').popover('hide');
        }

    });

    /* Funções para as operações sobre as camadas */
    $(selector).on('shown.bs.popover', function (event) {

        if (event.target.tagName == "A") {
            setTimeout(function () {

                // Botão para fechar o popover.
                if ($('.close-popover-camada').length == 0) {
                    var header = $('.popover-camada .popover-header');
                    header.empty();
                    header.append("Operações Sobre a Camada");
                    header.append('<button type="button" class="close close-popover-camada" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
                }

                //Verifica se o popover está errado
                /*$($('.popover-camada input')).each(function () {
                    $.each(this.attributes, function () {
                        // this.attributes is not a plain object, but an array
                        // of attribute nodes, which contain both the name and value
                        if (this.specified) {
                            console.log(this.name, this.value);
                        }
                    });
                });*/


                /* Pego o atributo com o nome da camada no input,para iterar nas camadas do mapa e achar a camada que foi clicada. */
                var layerName = $('.popover-camada input').attr('camada'); //$('.bs-popover-right input').attr('camada');
                if (isMobile) {
                    layerName = $('.bs-popover-bottom input').attr('camada');
                }
                //console.log('shown.bs.popover()');
                //console.log('*********** CAMADA: ' + layerName);
                var layers = map.getLayers().getArray();
                var layer = null;

                for (var i = 1; i < layers.length; i++) {
                    //console.log('iterando.... ' + i);
                    if (layers[i].type == 'TILE' && layers[i].get('name') == layerName) {
                        layer = layers[i];
                        //console.log('setou a camada..');
                        break;
                    }
                }
                //console.log('slider');
                /* Range Slider para alterar a opacidade Opacidade :: opacidade = 1 - (input/100) */
                var slider = document.getElementById('opacidade-range-slider');
                slider.oninput = function () {
                    var opacidade = 1 - this.value / 100;
                    try {
                        layer.setOpacity(opacidade);
                    }
                    // Se ainda nao tiver dado tempo da camada ser adicionada ao mapa, é levantado um erro. Tentamos de novo.
                    catch (erro) {
                        //console.log(erro);
                        setTimeout(function () {

                            layers = map.getLayers().getArray();
                            for (var i = 1; i < layers.length; i++) {
                                if (layers[i].type == 'TILE' && layers[i].get('name') == layerName) {
                                    layer = layers[i];
                                    //console.log('setou a camada..');
                                    break;
                                }
                            }
                            layer.setOpacity(opacidade);

                        }, 100);

                    }

                };
                //console.log('metadado');

                /* Ação do botão exibir Metadado */
                $('#btn-exibe-metadado').click(function () {
                    var uuid_metadado = $(this).attr('uuid');
                    var url_metadado = $(this).attr('url_metadado');
                    console.log(url_metadado);
                    var botao = this;

                    //Se for a primeira vez que o botao é clicado, o uuid do metadados era nulo.
                    if ( url_metadado == null || url_metadado == '' && (uuid_metadado == null || uuid_metadado == '') ) {
                        console.log('*********************** INTEGRAÇÃO INDE INDA');
                        //Buscar uuid na integracao inde inda com o nome da camada.
                        var camada = $(this).attr('camada');

                        // Busca o uuid  do metadado na integracao inde inda.
                        $.getJSON('/api/integracaoindeinda/get?url=' + INTEGRACAO_INDE_INDA_URL + camada)
                        .fail(function (e) {
                            //console.log(e);
                            ExibeMetadado(null);
                        })
                        .done(function (uuid) {
                            uuid = JSON.parse(uuid);
                            if (uuid.length > 0 && uuid[0].Uuid != null && uuid[0].Uuid != '' && uuid[0].Uuid != 'undefined') {

                                // Atualiza o dom do menu da camada E do botao do metadado no popover para nas requisições seguintes nao entrar neste if, 
                                // e nao fazer requisições adicionais à integracao inde inda.
                                //
                                $($('.popover-menu-camadas[camada="' + camada + '"]')[0]).attr('metadado', uuid[0].Uuid);
                                $('#btn-exibe-metadado').attr('uuid', uuid[0].Uuid); // para evitar requisições antes mesmo de fechar o popover e clicar de novo na camada.

                                uuid_metadado = uuid[0].Uuid;

                                //Caso uuid continue null (pode nao estar na integração)
                                if ((uuid_metadado == '' || uuid_metadado == null)) {
                                    ExibeMetadado(null);
                                    return;
                                }

                                var uriMetadado = '/api/metadado/get?uuid=' + uuid_metadado + '&url=';
                                $('#btn-pdf-metadado').attr('href', 'http://www.metadados.inde.gov.br/geonetwork/srv/br/pdf?uuid=' + uuid_metadado);
                                $.getJSON(uriMetadado)
                                    .fail(function (e) {
                                        //console.log(e);
                                        ExibeMetadado(null);
                                    })
                                    .done(function (metadado) {
                                        // codigo google

                                        script = document.createElement('script');
                                        script.type = "text/javascript";

                                        script.setAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=' + GEONETWORK_PROD_GOOGLE_TAG);
                                        $("#scripts-container").append(script);

                                        window.dataLayer = window.dataLayer || [];
                                        function gtag() { dataLayer.push(arguments); }
                                        gtag('js', new Date());
                                        gtag('config', GEONETWORK_PROD_GOOGLE_TAG);
                                        ExibeMetadado(metadado);
                                        //console.log(metadado);
                                    });

                            }
                            else {
                                ExibeMetadado(null);
                            }

                        });

                        return;
                    }
                    console.log('***************** JA TEM UUID OU VAI PEGAR A URL NO GEOSERVER');
                    // Botão para pdf do metadado (gerado pelo geonetwork) , já dentro do modal de exibição.
                    var uriMetadado = '/api/metadado/get?uuid=' + uuid_metadado + '&url=' + encodeURIComponent(url_metadado);
                    if (url_metadado == null || url_metadado == '' || url_metadado.includes('metadados.inde.gov.br')) {
                        $('#btn-pdf-metadado').attr('href', 'http://www.metadados.inde.gov.br/geonetwork/srv/br/pdf?uuid=' + uuid_metadado);
                    }
                    console.log(uriMetadado);
                    $.getJSON(uriMetadado)
                        .fail(function (e) {
                            //console.log(e);
                            ExibeMetadado(null);
                        })
                        .done(function (metadado) {
                            // codigo google
                            //gtag('config', 'UA-65810600-6');
                            if (url_metadado == null || url_metadado == '' ||  url_metadado.includes('metadados.inde.gov.br')) {
                                window.dataLayer = window.dataLayer || [];
                                function gtag() { dataLayer.push(arguments); }
                                gtag('js', new Date());
                                gtag('config', GEONETWORK_PROD_GOOGLE_TAG);
                                console.log('GEONETWORK_PROD_GOOGLE_TAG');
                            }                            

                            ExibeMetadado(metadado);
                            console.log(metadado);
                        });


                });
                //console.log('wms');
                /* Ação do botão exibir URL WMS */
                $('#btn-url-wms').click(function () {
                    var url = $(this).attr('wms');
                    //console.log(url);
                    ExibeUrlWms(url);
                });

                /* Ação do botão download CSV,KML, ShapeFile */
                /*
                @TODO
                Fazer um função separada para o botão csv para poder tirar a geometria do arquivo a ser exportado (usando describefeaturetype. o controller já está pronto, é o mesmo da tabela de atributos.)
                */
                $('.btn-downloads-camada').click(function () {

                    // Foram adicionados condições para verificar se a camada está no mapa e se possui filtro.
                    var camada = getLayerByName($(this).attr('camada'));

                    if (camada != null) {
                        var cql_filter = camada.getSource().getParams().CQL_FILTER;
                        //console.log(cql_filter);                        
                        if (cql_filter == null || cql_filter == 'null' || cql_filter == '') {
                            window.open($(this).attr('url'));
                        }
                        else {                            
                            window.open($(this).attr('url') + '&CQL_FILTER=' + encodeURI(cql_filter));
                        }
                    }
                    else {
                        window.open($(this).attr('url'));
                    }

                });

                $('#btn-download-csv').click(function () {

                    var base_url = $(this).attr('base_url');
                    var url_csv = $(this).attr('url');
                    var campos = '';
                    var camada = getLayerByName($(this).attr('camada'));
                    
                    //$.getJSON('/api/feature/get?urlServer=' + $(this).attr('url') + '&layerName=' + $(this).attr('camada') + '&describeOnly=false')
                    $.getJSON('/api/feature/get?urlServer=' + base_url + '&layerName=' + $(this).attr('camada') + '&describeOnly=true')
                        .fail(function (error) {
                            //A requisição para a api feature é somente para usar o describe feature type para retirar campos de geometria do csv. Caso falhe, podemos continuar exportando o arquivo.
                            console.log('fail');
                            window.open(url_csv);
                        })
                        .done(function (data) {
                            console.log('done');
                            campos = '&propertyName=' + data;
                            url_csv += campos;

                            if (camada != null) {
                                // Foram adicionados condições para verificar se a camada está no mapa e se possui filtro.
                                var cql_filter = camada.getSource().getParams().CQL_FILTER;
                                //console.log(cql_filter);
                                
                                if (cql_filter == null || cql_filter == 'null' || cql_filter == '') {
                                    window.open(url_csv);
                                }
                                else {                                    
                                    window.open(url_csv + '&CQL_FILTER=' + encodeURI(cql_filter));
                                }
                            }
                            else {
                                //se a camada nao estiver no mapa , nao tem filtro. abrir o arquivo.
                                //console.log('camada nao esta no mapa. abrindo arquivo...');
                                //console.log(url_csv);
                                window.open(url_csv);
                            }

                        });
                });


                /* Ação do botão Tabelas e Filtros */
                $('#btn-table').click(function () {
                    $('#loading-btn-table').css('display', 'block');
                    $('#table-error-message').css('display', 'none');
                    $.getJSON('/api/feature/get?urlServer=' + $(this).attr('url') + '&layerName=' + $(this).attr('camada') + '&describeOnly=false')
                        .fail(function (e) {
                            //console.log('falhou...');
                            //console.log(e);
                            $('#loading-btn-table').css('display', 'none');
                            $('#table-error-message').css('display', 'block');
                            setTimeout(function () { $('#table-error-message').css('display', 'none'); }, 3000);
                        })
                        .done(function (data) {

                            var arrayDatatablesData = [];
                            var arrayDatatablesCols = [];
                            //console.log(data);
                            if (data == null || data.length == 0) {
                                //console.log('falhou...');
                                //console.log(e);
                                $('#loading-btn-table').css('display', 'none');
                                $('#table-error-message').css('display', 'block');
                                setTimeout(function () { $('#table-error-message').css('display', 'none'); }, 3000);
                                return;
                            }

                            // O primeiro elemento do array retornado contém o nome das colunas da tabela.
                            var colunas = data.shift();
                            //console.log(colunas);
                            // Monta um objeto com o nome da coluna e adiciono no array de colunas.
                            $.each(colunas.Element, function (key, item) {
                                arrayDatatablesCols.push({ 'title': item.Value, 'range': item.DataType == 'number' ? true : false });
                            });
                            //console.log(arrayDatatablesCols);

                            // Itero no array de retorno para popular um objeto com os dados. O nome do campo vira um propriedade do objeto. Element é o nome de uma classe que veio do backend.
                            for (var i = 0; i < data.length; i++) {
                                var dataTablesObject = {};
                                $.each(data[i].Element, function (key, item) {
                                    //console.log(item.Key + ' = ' + item.Value);
                                    dataTablesObject[item.Key] = item.Value;
                                });

                                arrayDatatablesData.push(
                                   $.map(dataTablesObject, function (value, index) {
                                       return [value];
                                   })
                               );
                            }
                            //console.log(arrayDatatablesData);              
                            $('.dataTables_wrapper').remove();
                            $('#ModalTabela table').remove();
                            console.log('btn-table.click()');
                            // Entrego os dados para uma função que se encarrega de desenhar uma tag de tabela no DOM da página e configurar o datatables.
                            ExibeTabela(arrayDatatablesCols, arrayDatatablesData, $('#btn-table').attr('descricao')); //Função definida em ActionsOnLayers.js
                            $('#loading-btn-table').css('display', 'none');
                        });
                });

                /* Ação do Botão Zoom para a Camada. */
                $('#btn-zoom-to-layer-extent').click(function () {
                    zoomToLayer(getLayerByName($(this).attr('camada')));
                });

                $('.close-popover-camada').click(function () {
                    $('.popover-camada').popover('hide');
                });



            }, 300); //Valor arbitrário em milissegundos para dar tempo do popover anterior ser eliminado antes de registrar as funções no novo popover, senão os botões não funcionam.
        }
        else if (event.target.tagName == "SPAN") {
            var parent = event.target.parentElement;

            while (parent != null && parent.tagName != "UL") {
                parent = parent.parentElement;
            }

            if (parent != null)
                ApplyPopoverOnEllipsisClickFunction(parent.id, event.target);
        }
    });
    
}

function DefaultFileDownload(item, type)
{

}

function FiltraMenuCamadas(tokens) {
    // Array de itens filtrados inicialmente é vazio.
    var itens_filtrados = [];

    //É necessário remover quaisquer itens filtrados que já estejam sendo exibidos, para não acumular um grande número e melhorar a visualização.
    $('#menu-filtradas .menu-item').remove();

    //Pego somente as camadas que estão no menu de instituições, por performance: estão melhor indexadas e não se repetem.
    $('#menu-aplicacao .menu-item').each(function () {
        //console.log('entrou...');
        // A descrição da camada é um atributo no input.
        var descricao_camada = $(this).find('li a span label div span a').attr('descricao').toUpperCase();

        //Para retornar deve conter todos os itens da pesquisa. Inicialmente a condição de teste é false.
        var containsAll = false;

        for (var i = 0; i < tokens.length; i++) {
            //A função split do javascript pode acabar trazendo virgulas e espaços em branco. Se o token for desse tipo, pulamos  a iteração.
            if (tokens[i] == ',' || tokens[i] == ' ' || tokens[i] == '' || tokens[i] == null) {
                continue;
            }
            // Se um dos itens de pesquisa não estiver presente, setamos o teste para false e interrompemos o loop.
            if (descricao_camada.indexOf(tokens[i].toUpperCase()) < 0) {
                containsAll = false;
                break;
            }
                // Se o item pesquisado estiver na descrição da camada, setamos o teste para true.
            else {
                containsAll = true;
            }
        }
        // Se todos os itens estiverem presentes o teste ao final do loop estará como true. Colocamos o item no array de filtrados.
        if (containsAll) {
            itens_filtrados.push(this.cloneNode(true));
        }


    });

    //console.log(itens_filtrados);

    //Por ultimo, adicionamos os itens filtrados ao DOM. OBS.: Uma busca vazia vai limpar o menu com as camadas filtradas.
    for (var i = 0; i < itens_filtrados.length; i++) {
        $(itens_filtrados[i]).appendTo('#menu-filtradas');
    }

    //console.log(itens_filtrados.length);
    //console.log(tokens.length);

    // Mensagem para quando a busca nao retornar resultados.
    if(itens_filtrados.length == 0 && tokens.length > 0) {
        $('<p id="busca-sem-resultados" style="font-style: italic;color: #999;text-align:center;" class="menu-item"> A busca não retornou nenhum resultado.</p>').appendTo('#menu-filtradas');
        window.setTimeout(function () {
            $('#busca-sem-resultados').remove();
        }, 2000);
    }    

    UpdateMenus('#menu-filtradas .layer-checkbox');
    InicializaPopovers('#menu-filtradas [data-toggle="popover"]');
}

function getLayerByName(layerName)
{    
    //var layers = map.getLayers().getArray();
    for (var i = 0; i < map.getLayers().getLength(); i++) {
        //console.log(layers[i].get('name'));
        //É preciso checar se a camada é do tipo "TILE" pois as "VECTOR" são dos marcadores de localidade e nao possuem o atributo "params".
        if (map.getLayers().item(i).get('name') == layerName) {
            return map.getLayers().item(i);
        }
    }
    return null;
}

// Função para aproximar a visão para o retangulo envolvente da camada. 
// Está funcionando perfeitamente mas ainda não  está sendo chamada diretamente pelo menu pois os bbox da BD do visualizador estão errados.
function zoomToLayer(layer)
{
    var bbox = []; 
    if (layer != null)        
        bbox = layer.get('bbox');
    //console.log(bbox);
    if (bbox.length == 4 && !isNaN(bbox[0]) && !isNaN(bbox[1]) && !isNaN(bbox[2]) && !isNaN(bbox[3]) && bbox[0] != null && bbox[1] != null && bbox[2] != null && bbox[3] != null)
    {
        var minx = bbox[0];
        var miny = bbox[1];
        var maxx = bbox[2];
        var maxy = bbox[3];
    }
    else
    {        
        var minx = -74;
        var miny = -34;
        var maxx = -27;
        var maxy = 6;
    }

    bbox = [minx, miny, maxx, maxy]; // para ficar na ordem da documentação de transformExtent
    map.getView().fit(ol.proj.transformExtent(bbox, 'CRS:84', 'EPSG:3857'), map.getSize());
    
    /*var x = (minx + maxx) / 2;
    var y = (miny + maxy) / 2;

    if (isNaN(x) || isNaN(y))
    {
        return null;
    }    

    var extent = [x, y];

    map.setView(new ol.View({
        center: ol.proj.transform(
              extent, 'CRS:84', 'EPSG:3857'),
        zoom: 5,
        minZoom: 3,        
    }));*/
}

function atualizaBuscarCamadas() {
    $('.popover-camada').popover('hide');//$('.popover-camada').remove(); // para remover popovers abertos quando fechar o menu do catalogo.
    $("#url-wms-externo").val($("#url-wms-externo-select").val());
}

//Registra eventos para quando uma camada começa e termina de carregar, para mostrar um gif de loading.
function RegistraEventosCamada(wmsSource, ol_uid)
{
    var contador_tiles = 0;

    wmsSource.on('tileloadstart', function (e) {
        //console.log('Começou a  carregar a camada...');
        contador_tiles++;
        //console.log('contador_tiles = ' + contador_tiles);
        if ($('img[ol_uid=' + ol_uid + ']').length == 0) {
            $('input[ol_uid=' + ol_uid + ']').css('display', 'none');
            $('input[ol_uid=' + ol_uid + ']').parent().prepend($('<img src="/Images/loading.gif" style="display:inline;" width="16" height="16" class="loading" ol_uid=' + ol_uid + ' />'));
        }
    });

    wmsSource.on('tileloadend', function (e) {
        //console.log('Terminou de carregar a camada.');
        contador_tiles--;
        //console.log('contador_tiles = ' + contador_tiles);
        if (contador_tiles <= 0) {
            $('img[ol_uid=' + ol_uid + ']').remove();
            $('input[ol_uid=' + ol_uid + ']').css('display', 'inline');
        }
    });

    wmsSource.on('tileloaderror', function (e) {
        console.log('Erro ao carregar a camada.');
        contador_tiles--;
        $('img[ol_uid=' + ol_uid + ']').remove();
        $('input[ol_uid=' + ol_uid + ']').css('display', 'inline');
    });
}

/* Função usada para fazer a requisição do GetFeatureInfo somente para a camada que estiver mais no topo do mapa. */
/* Os parâmetros "a" e "b" são camadas do mapa */ 
function compareByZIndex(a, b) {
    if (a.getZIndex() < b.getZIndex())
        return -1;
    if (a.getZIndex() > b.getZIndex())
        return 1;
    return 0;
}

function compareByPositionAttr(a, b)
{
    if ($(a).attr('position') < $(b).attr('position'))
        return -1;
    if ($(a).attr('position') > $(b).attr('position'))
        return 1;
    return 0;
}

function copyModalLink() {
    var copyText = document.getElementById("url-wms-modal");
    if (copyText.value != null && copyText.value != "") {
        copyText.select();
        document.execCommand("Copy");
        alert("URL copiada para a área de transferência.")
    }
}

function showContactModal() {
    $('#ModalContact').modal('toggle');
    grecaptcha.reset();
}

function showHelpModal() {
    $('#ModalHelp').modal('toggle');
}

//Função chamada ao enviar formulário de contato
function getCaptchaResponse(form) {
    var captchaResponse = $("#g-recaptcha-response").val();
    //Envia form
    $.get("/api/captcha", { captcha: captchaResponse })
        .fail(function (e) {
            //console.log(e);
        })
        .done(function (data) {
            //Captcha Success
            if (data == "Google reCaptcha validation success") {
                $("#recaptchaMessage").empty();
                sendContactForm(form);
            }
            else {
                $("#recaptchaMessage").empty().html("<p style=\"font-style:italic;color:red;\">Você deve marcar o campo \"Não sou um robô\"</p>");
            }
        });
    return false;
}

function sendContactForm(form) {
    //Envia form
    $.get("/api/email",
        {
            nome: form.elements.nome.value,
            email: form.elements.email.value,
            assunto: form.elements.assunto.value,
            mensagem: form.elements.mensagem.value
        })
    .done(function (data) {
        $("#botao-limpa-contact-form").click();
        $('#ModalContact').modal('hide');
        alert(data);//("Mensagem enviada! Em breve entraremos em contato.");
        //console.log("Response: " + data);
    });
}

function VisualizaCamada()
{
    var nomeCamada = $('#visualiza_camada').val();
    var elemento = $('#menu-aplicacao .layer-checkbox[camada="' + nomeCamada + '"]');
    var url = $(elemento).attr('url');
    
    // Inicialmente quando existia o menu de instituições, todas as camadas que vinham do banco de dados estavam no DOM. 
    // Atualmente temos somente o menu temas vindo do banco de dados, e muitas camadas não estão associadas a nenhum tema.
    // Essas camadas precisam ter o DOM construído, para aproveitarmos todo o mecanismo já existente de gerenciar camadas.
    if (url == "" || url == null || url == 'undefined')
    {
        ConstructVisualizaCamada();
        return;
    }

    //console.log(nomeCamada);
    //console.log($('#menu-aplicacao-instituicao .layer-checkbox[camada="' + nomeCamada + '"]'));
    //console.log(elemento[0]);
    //console.log(url);
    AddLayer(url, nomeCamada, map, elemento);

    //function AddLayer(url, layerName, map, element) 
}

// Contrói o DOM de camadas que não estão na página.
function ConstructVisualizaCamada()
{
    if(visualiza_camada_obj)
    {
        MontaMenu(visualiza_camada_obj, '#menu-aplicacao', '  data-parent="#menu-aplicacao"', 0, 2, 'none');
    }
    //  0) mudar o objeto  visualiza_camada_obj para ficar igual ao item do banco de dados q MontaMenu recebe
    //  1) Chamar MontaMenu com o visualiza_camada_obj. passar display: none e preencher lá,a  camada nao deve ser visivel no DOM;
    //  2) Chamar AddLayer com o selector para a camada normalmente.
    
    //visualiza_camada_obj : Global construída em Index.cshtml
    var elemento = $('#menu-aplicacao .layer-checkbox[camada="' + visualiza_camada_obj.Descricao + '"]');
    
    AddLayer(visualiza_camada_obj.Url, visualiza_camada_obj.Descricao, map, elemento);
}

function ApplyBulletsLogic()
{
    $('#menu-aplicacao a.nav-link-collapse').click(function ()
    {
        // Primeiro corrijo o item que foi clicado.
        // A tag i que contem o marcador, é sempre o primeiro filho.
        var i_tag = $(this).children()[0];
        // Basta dar toggle nas duas classes, a que existir vai ser excluida, a ausente sera incluida.
        $(i_tag).toggleClass(MENU_BULLET_DOWN + ' ' + MENU_BULLET_RIGHT );

        // Agora sigo para corrgir os outros niveis, porem somente devo alterar os itens que estao no mesmo nivel do que foi clicado.
        var data_parent = $(this).attr('data-parent'); // guardo o nivel na estrutura, do elemento que foi clicado.
        //console.log(data_parent);
        // Esta linha é para o acompanhar o efeito accordion do template. Todos os niveis colapsados que estao com seta para baixo devem ser corrigidos.
        // O codigo é executado antes do accordion retornar (o certo seria um listener [ex: bs.hide.collapse], mas nao estava respondendo ) por isso os atributos e classes
        // estao com os valores "pré click" (expandido e nao colapsado).
        $('#menu-aplicacao a.nav-link-collapse[aria-expanded=true][data-parent="' + data_parent + '"] > i.' + MENU_BULLET_DOWN).not(this).toggleClass(MENU_BULLET_DOWN + ' ' + MENU_BULLET_RIGHT);
        
    });
}

function ApplyPopoverOnEllipsis() {
    $('span.icon-operacoes-camada').click(function () {
        var parent = this.parentElement;

        while (parent != null && parent.tagName != "UL") {
            parent = parent.parentElement;
        }

        if (parent != null && parent.id != null)
            ApplyPopoverOnEllipsisClickFunction(parent.id, this);
    });
}

function ApplyPopoverOnEllipsisClickFunction(parentContainer, element) {
    //console.log('ApplyPopoverOnEllipsis()');
    var nomeCamada = $(element).attr('camada');
    $('.popover-camada').popover('hide');
    if (parentContainer != null && parentContainer != "")
        $($('#' + parentContainer + ' a.popover-menu-camadas[camada="' + nomeCamada + '"][data-toggle=popover]')[0]).popover('toggle');
}

function HandleDisclaimer() {
    var dismiss = getCookie('dismiss_disclaimer');
    console.log(dismiss);
    if (!dismiss)
        showHelpModal();
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//Este comentário serve para o script ser mostrado no debbugger, já que ele é carregado dinamicamente para a lógica de minimização

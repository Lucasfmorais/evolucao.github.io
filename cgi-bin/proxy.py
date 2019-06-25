#!/usr/bin/env python


"""Este é um proxy cego que usamos para contornar o navegador
restrições que impedem o Javascript de carregar páginas que não estão no
mesmo servidor que o Javascript. Isso tem vários problemas: é menos
eficiente, pode quebrar alguns sites e é um risco de segurança porque
as pessoas podem usar este proxy para navegar na web e possivelmente fazer coisas ruins
com isso. Só carrega páginas via http e https, mas pode carregar qualquer
tipo de conteúdo. Suporta pedidos GET e POST.
Contribuidores do Copyright 2011 OpenLayers
Adaptado por Gabor Farkas"""

import urllib2
import cgi
import sys
import os

method = os.environ['REQUEST_METHOD']

if method == "POST":
    qs = os.environ["QUERY_STRING"]
    d = cgi.parse_qs(qs)
    if d.has_key("url"):
        url = d["url"][0]
    else:
        url = "http://www.openlayers.org"
else:
    fs = cgi.FieldStorage()
    url = os.environ["QUERY_STRING"]
    url = urllib2.unquote(url)

try:
    if url.startswith("http://") or url.startswith("https://"):
        if method == "POST":
            length = int(os.environ["CONTENT_LENGTH"])
            headers = {"Content-Type": os.environ["CONTENT_TYPE"]}
            body = sys.stdin.read(length)
            r = urllib2.Request(url, body, headers)
            y = urllib2.urlopen(r)
        else:
            y = urllib2.urlopen(url)
        # print content type header
        i = y.info()
        if i.has_key("Content-Type"):
            print "Content-Type: %s" % (i["Content-Type"])
        else:
            print "Content-Type: text/plain"
        print
        print y.read()
        y.close()
    else:
        print "Content-Type: text/plain"
        print
        print "Illegal request."
except Exception, E:
    print "Status: 500 Unexpected Error"
    print "Content-Type: text/plain"
    print 
    print "Some unexpected error occurred. Error text was:", E
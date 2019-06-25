#!/usr/bin/env python3
from bottle import route, app
from http.server import HTTPServer, SimpleHTTPRequestHandler, test
import sys

class CORSRequestHandler (SimpleHTTPRequestHandler):
	def end_headers (self):
		self.send_header('Access-Control-Allow-Origin', 'http://localhost:8000')
		SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
	test(CORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
	
def cors(func):
    def wrapper(*args, **kwargs):
        bottle.response.set_header("Access-Control-Allow-Origin", "*")
        bottle.response.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        bottle.response.set_header("Access-Control-Allow-Headers", "Origin, Content-Type")
        
        # skip the function if it is not needed
        if bottle.request.method == 'OPTIONS':
            return

        return func(*arg, **kwargs)
    return wrapper

@route('/', methods='GET OPTIONS'.split())
@cors
def index():
    return 'ok'

if __name__=='__main':
    app.run()
from bottle import route, app

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
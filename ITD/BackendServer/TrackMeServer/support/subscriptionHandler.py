from http.server import HTTPServer, BaseHTTPRequestHandler
from io import BytesIO
import json

bindAddr = '127.0.0.1'
bindPort = 1337

class SubscriptionHandler(BaseHTTPRequestHandler):
    def do_POST(self): # POST handler
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        data = BytesIO()
        data.write(body)
        print(data) # todo
        self.send_response(200)
        self.end_headers()


httpd = HTTPServer((bindAddr, bindPort), SubscriptionHandler)
httpd.serve_forever()
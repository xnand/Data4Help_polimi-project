from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import signal
import sys

# to use this you must start the script and subscribe on a authorized
# request giving 'http://bindAddr:bindPort' as forwardingLink,
# where bindAddr and bindPort are the values of the two variables
# defined below

bindAddr = '127.0.0.1' # i discourage to change this one
bindPort = 1337
dumpFileName = 'subscription.json'

first = True

with open(dumpFileName, 'w') as f:
    f.write('[')

class SubscriptionHandler(BaseHTTPRequestHandler):
    def do_POST(self): # POST handler
        global first
        contentLength = int(self.headers['Content-Length'])
        if contentLength > 0:
            body = self.rfile.read(contentLength)
            j = json.loads(body)
            with open(dumpFileName, 'a') as f:
                if not first:
                    f.write(',\n')
                json.dump(j, f)
                first = False
            print(j)
        self.send_response(200)
        self.end_headers()

def sigint_handler(a, b):
    with open(dumpFileName, 'a') as f:
        f.write(']')
    sys.exit(0)

signal.signal(signal.SIGINT, sigint_handler)
httpd = HTTPServer((bindAddr, bindPort), SubscriptionHandler)
httpd.serve_forever()
from os import curdir
import SimpleHTTPServer
import SocketServer
import urllib

class GifticHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if '?' not in self.path:
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
            return
        p, q = self.path.split('?')
        if p == '/gifload':
            v, g = q.split('=')
            f, h = urllib.urlretrieve(g)
            gif = open(f, 'rb')
            d = gif.read()
            gif.close()
            self.send_response(200)
            self.send_header("Content-Type", "image/gif")
            self.send_header("Content-Length", str(len(d)))
            self.end_headers()
            self.wfile.write(d)

server = None

try:
    server = SocketServer.TCPServer(('127.0.0.1', 8080), GifticHandler)
    # server.server_bind()
    # server.server_activate()
    print "Server started"
    server.serve_forever()
except KeyboardInterrupt:
    pass
if server:
    print "Shutting down server"
    server.shutdown()
    server.server_close()
print "Exiting"

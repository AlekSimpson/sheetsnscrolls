import http.server

httpd = http.server.HTTPServer(('localhost', 3000), http.server.SimpleHTTPRequestHandler)

httpd.serve_forever()

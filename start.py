import http.server
import ssl

httpd = http.server.HTTPServer(('localhost', 3000), http.server.SimpleHTTPRequestHandler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('./localhost+1.pem', './localhost+1-key.pem')
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

httpd.serve_forever()
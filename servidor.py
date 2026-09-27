from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import os,webbrowser
os.chdir(os.path.dirname(__file__))
print("Yovarela V4: http://127.0.0.1:8000")
webbrowser.open("http://127.0.0.1:8000")
ThreadingHTTPServer(("127.0.0.1",8000),SimpleHTTPRequestHandler).serve_forever()

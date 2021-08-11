from app import app
from flask_socketio import *

if __name__ == "__main__":
    socketio = SocketIO(app, cors_allowed_origins="*")
    socketio.run(app, debug=True)

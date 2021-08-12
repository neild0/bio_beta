from app import app
from flask_socketio import *

if __name__ == "__main__":
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading', async_handlers=True, ping_timeout=10)
    socketio.run(app, debug=True)

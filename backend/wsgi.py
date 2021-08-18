from app import app
from flask_socketio import *

if __name__ == "__main__":
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        async_mode="threading",
        async_handlers=False,
        ping_timeout=30,
        ping_interval=60,
        always_connect=False,
    )
    socketio.run(app, debug=True)

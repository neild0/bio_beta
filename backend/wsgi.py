from app import app

if __name__ == "__main__":
    app.run(host='0.0.0.0', ssl_context=('./cert.pem', './privkey.pem'), port=3334)
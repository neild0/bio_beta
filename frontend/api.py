# import flask, requests, JSON
from flask import Flask, jsonify, request
import requests
import json

app = Flask(__name__)
app.config['DEBUG'] = True


# decorator to set up API route for GET
@app.route('/', methods=['GET'])
# route for home
def home():
    return "Welcome to Unicorn!"


# route to take data as parameters, execute ML model, and display results
@app.route('/predict', methods=['POST'])
def predict():
    # take data as parameters
    values = request.get_json()
    # parse values to get parameters
    data = values.get("data")
    # figure out names of parameters/keys
    # model =
    return jsonify(values), 200


app.run()

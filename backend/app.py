#!/usr/bin/python3
# import flask, requests, JSON
from flask import Flask, jsonify, request
from inference.pathology.pc_chip.pc_chip import PC_CHiP
from inference.genomics.enformer.enformer import Enformer
from inference.proteomics.protTrans.protTrans import ProtTrans

import requests
import json

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
cors = CORS(app, resource={
    r"/*":{
        "origins":"*"
    }
})

app.config['DEBUG'] = True

chip = None # PC_CHiP()
prot = ProtTrans()
enf = None # Enformer()

# decorator to set up API route for GET
@app.route('/', methods=['GET'])
# route for home
def home():
    return "Welcome to Unicorn!"

@app.route('/test', methods=['GET'])
# route for home
def test():
    print('here')
    return jsonify("Welcome to Unicorn!"), 200


# route to take data as parameters, execute ML model, and display results
@app.route('/api/site_image_predict', methods=['GET'])
def predict_image_predict():
    preds = chip.predict('./uploads/images')
    results = [{'filepath':pred[0][9:], 'class': 'Normal Tissue' if 'tumor' not in pred[1][0][0] else 'Diseased Tissue'} for pred in preds]
    print(results)
    return jsonify(results), 200

@app.route('/api/site_protTrans', methods=['GET'])
def predict_protTrans():
    lines = []
    with open('./uploads/protein/protein.txt') as infile:
        for line in infile:
            lines.append(line.rstrip())
    main, protString = lines[0], "".join(lines[1:])

    MS_pred = prot.MS_predict([protString])
    SS3_pred = prot.SS3_predict([protString])
    LCL_predict = prot.LCL_predict([protString])
    results = {'main':protString, 'MS':MS_pred,'SS3':SS3_pred, 'LCL': LCL_predict}
    return jsonify(results), 200

@app.route('/api/site_Enformer', methods=['GET'])
def predict_Enformer():
    preds = enf.predict('./uploads/images')
    results = [{'filepath':pred[0][9:], 'class': 'Normal Tissue' if 'tumor' not in pred[1][0][0] else 'Diseased Tissue'} for pred in preds]
    print(results)
    return jsonify(results), 200


app.run()
#!/usr/bin/python3
# import flask, requests, JSON
import hashlib
import lzma
import sqlite3
import string
from contextlib import closing
import subprocess
import os
import secrets
import boto3
from boto3.dynamodb.conditions import Key

from flask import Flask, jsonify, request, Response
import flask_monitoringdashboard as dashboard

# from inference.pathology.pc_chip.pc_chip import PC_CHiP
# from inference.genomics.enformer.enformer import Enformer
# from inference.proteomics.protTrans.protTrans import ProtTrans
from inference.proteomics.alphafold2.alphafold_model import AlphaFold2
import numpy as np
import requests
import json
from flask_socketio import *
from flask_cors import CORS, cross_origin


def noCache(response, content_type="application/json; charset=utf-8"):
    response.headers.add("Cache-Control", "no-store")
    return response


app = Flask(__name__)
dashboard.config.init_from(file="./config.cfg")
dashboard.bind(app)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

import logging

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)
app.logger.disabled = True
log.disabled = True

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading",
    async_handlers=True,
    ping_timeout=30,
    ping_interval=60,
    always_connect=False,
)

app.config["DEBUG"] = True

if not os.path.isfile("protein_data.db"):
    with closing(sqlite3.connect("protein_data.db")) as connection:
        with closing(connection.cursor()) as cursor:
            cursor.execute(
                "CREATE TABLE protein_data (encoded_seq TEXT, short_code TEXT, pdb TEXT, model TEXT)"
            )


# chip = PC_CHiP()
# prot = ProtTrans()
# enf = Enformer()

# decorator to set up API route for GET
@app.route("/", methods=["GET"])
# route for home
def home():
    return "Welcome to Moonbear!"


@app.route("/test", methods=["GET"])
# @cross_origin()
# route for home
def test():
    return jsonify("Welcome to Moonbear!"), 200


# route to take data as parameters, execute ML model, and display results
# @app.route('/api/site_image_predict', methods=['GET'])
# def predict_image_predict():
#     preds = chip.predict('./uploads/images')
#     results = [{'filepath':pred[0][9:], 'class': 'Normal Tissue' if 'tumor' not in pred[1][0][0] else 'Diseased Tissue'} for pred in preds]
#     print(results)
#     return jsonify(results), 200
#
# @app.route('/api/site_protTrans', methods=['GET'])
# def predict_protTrans():
#     lines = []
#     with open('./uploads/protein/protein.txt') as infile:
#         for line in infile:
#             lines.append(line.rstrip())
#     main, protString = lines[0], "".join(lines[1:])
#
#     MS_pred = prot.MS_predict([protString])
#     SS3_pred = prot.SS3_predict([protString])
#     LCL_predict = prot.LCL_predict([protString])
#     results = {'main':protString, 'MS':MS_pred,'SS3':SS3_pred, 'LCL': LCL_predict}
#     return jsonify(results), 200

# import time
# TODO: setup pTM model scripts and look into their meaning


@app.route("/api/site_alphafold2_lite", methods=["GET", "OPTIONS"])
def predict_alphaFold2Lite():
    dbU, model = databaseUtils(), "alphafold2_lite"
    sequence = request.args.get("sequence", type=str).upper()
    name = request.args.get("name", type=str)
    print(sequence, name)

    encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
    db_data = dbU.get(
        Key("encoded_seq").eq(encoded_seq) & Key("model").eq(model),
        "short_code, pdb",
        True,
    )
    if db_data is not None:
        jobName, code, pdb = (
            encoded_seq,
            db_data["short_code"],
            lzma.decompress(db_data["pdb"].value).decode("utf-8"),
        )
        response = jsonify({"name": jobName, "pdb": pdb, "code": code})
        print("found - aflite")
        return response, 200
    else:
        db_data = dbU.get(Key("encoded_seq").eq(encoded_seq), "short_code, pdb", True)
        if db_data is not None:
            jobName, code, pdb = (
                encoded_seq,
                db_data["short_code"],
                lzma.decompress(db_data["pdb"].value).decode("utf-8"),
            )
            response = jsonify({"name": jobName, "pdb": pdb, "code": code})
            print("found - af2")
            return response, 200
        else:
            print("not found - aflite")
            response = jsonify({"name": None, "pdb": None, "code": None})
            response = noCache(response)
            return response, 404


@app.route("/api/site_alphafold2", methods=["GET", "OPTIONS"])
def predict_alphaFold2():
    dbU, model = databaseUtils(), "alphafold2"
    sequence = request.args.get("sequence", type=str).upper()
    name = request.args.get("name", type=str)
    print(sequence, name)

    encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
    db_data = dbU.get(
        Key("encoded_seq").eq(encoded_seq) & Key("model").eq(model),
        "short_code, pdb",
        True,
    )
    if db_data is not None:
        jobName, code, pdb = (
            encoded_seq,
            db_data["short_code"],
            lzma.decompress(db_data["pdb"].value).decode("utf-8"),
        )
        response = jsonify({"name": jobName, "pdb": pdb, "code": code})
        print("found - af2")
        return response, 200
    else:
        print("not found - af2")

        response = jsonify({"name": None, "pdb": None, "code": None})
        response = noCache(response)
        return response, 404


@app.route("/api/get_alphafold_state", methods=["GET"])
def getState():
    dbU = databaseUtils()
    short_code = request.args.get("code", type=str)
    print(f"Get Code: {short_code}")
    db_data = dbU.get(Key("short_code").eq(short_code), "pdb")
    if db_data is not None:
        pdb = lzma.decompress(db_data["pdb"].value).decode("utf-8")
        response = jsonify({"pdb": pdb})
    else:
        print("not found")
        response = jsonify({"pdb": None})
        response = noCache(response)
    return response, 200


class databaseUtils:
    def __init__(self, db_name="ProteinData"):
        dynamodb = boto3.resource("dynamodb", region_name="us-east-2")
        self.table = dynamodb.Table(db_name)

    def generateRandom(self, search_col):
        alphabet = (
            (string.ascii_letters + string.digits).replace("l", "").replace("I", "")
        )
        while True:
            code = "".join(secrets.choice(alphabet) for i in range(6))
            response = self.table.query(
                KeyConditionExpression=Key(search_col).eq(code), Limit=1
            )
            if len(response["Items"]) == 0:
                return code

    def get(self, search, return_keys, secondIndex=False):
        if not secondIndex:
            response = self.table.query(
                ProjectionExpression=return_keys, KeyConditionExpression=search, Limit=1
            )
        else:
            response = self.table.query(
                IndexName="encoded_seq-model-index",
                ProjectionExpression=return_keys,
                KeyConditionExpression=search,
                Limit=1,
            )
        if len(response["Items"]) == 0:
            return None
        else:
            return response["Items"][0]

    def set(self, encoded_seq, short_code, pdb, model, sequence):
        prot_item = {
            "encoded_seq": encoded_seq,
            "short_code": short_code,
            "pdb": pdb,
            "model": model,
            "sequence": sequence,
        }
        self.table.put_item(Item=prot_item)
        print(f"Set Code: {short_code}")


# SocketIO Events
@socketio.on("connect")
def connected():
    print("Connected")


@socketio.on("disconnect")
def disconnected():
    print("Disconnected")


@socketio.on("fold")
def fold(data):
    print("Running Fold", data["seq"], data["model"])
    sequence = data["seq"].upper()
    dbU, model = databaseUtils(), data["model"]
    encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
    if model == "alphafold2":
        AF2 = AlphaFold2()
        jobName, pdbs, outs = AF2.predict(sequence, jobname=encoded_seq)
    else:
        AF2 = AlphaFold2(models=["model_3"])
        jobName, pdbs, outs = AF2.predict(sequence, jobname=encoded_seq, msa_mode="U")
    del AF2
    bestModel = max(pdbs.keys(), key=lambda model: outs[model]["pae"])
    code, pdb = dbU.generateRandom("short_code"), pdbs[bestModel]
    db_data = dbU.get(
        Key("encoded_seq").eq(encoded_seq) & Key("model").eq(model), "short_code", True
    )
    if db_data is None:
        dbU.set(
            encoded_seq,
            code,
            lzma.compress(pdb.encode("utf-8"), preset=9),
            model,
            sequence,
        )
        db_data = {"short_code": code}
    emit(
        "foldedProtein",
        {"data": {"pdb": pdb, "name": jobName, "code": db_data["short_code"]}},
    )


@app.route("/alphafold2", methods=["GET", "POST", "OPTIONS"])
def predict_alphaFold2_api():
    dbU, model = databaseUtils(), "alphafold2"
    print(request.args)
    sequence = request.args.get("sequence", type=str).upper()
    name = request.args.get("jobName", "NULL", type=str)
    code = request.args.get("token", None, type=str)

    if code != "2b1fc4a5cf2d09ac252934aa3ec60fb8":
        response = jsonify({"pdb": pdb, "name": jobName, "code": db_data["short_code"]})
        return "Invalid Token", 404

    print(sequence, name)

    encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
    db_data = dbU.get(
        Key("encoded_seq").eq(encoded_seq) & Key("model").eq(model),
        "short_code, pdb",
        True,
    )
    if db_data is not None:
        jobName, code, pdb = (
            encoded_seq,
            db_data["short_code"],
            lzma.decompress(db_data["pdb"].value).decode("utf-8"),
        )
        response = jsonify({"name": jobName, "pdb": pdb, "code": code})
        print("found - af2")
        return response, 200
    else:
        print("not found - af2")
        print("Running Fold", sequence, model)
        dbU = databaseUtils()
        encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
        if model == "alphafold2":
            AF2 = AlphaFold2()
            jobName, pdbs, outs = AF2.predict(sequence, jobname=encoded_seq)
        else:
            AF2 = AlphaFold2(models=["model_3"])
            jobName, pdbs, outs = AF2.predict(
                sequence, jobname=encoded_seq, msa_mode="U"
            )
        del AF2
        bestModel = max(pdbs.keys(), key=lambda model: outs[model]["pae"])
        code, pdb = dbU.generateRandom("short_code"), pdbs[bestModel]
        db_data = dbU.get(
            Key("encoded_seq").eq(encoded_seq) & Key("model").eq(model),
            "short_code",
            True,
        )
        if db_data is None:
            dbU.set(
                encoded_seq,
                code,
                lzma.compress(pdb.encode("utf-8"), preset=9),
                model,
                sequence,
            )
            db_data = {"short_code": code}

        response = jsonify({"pdb": pdb, "name": jobName, "code": db_data["short_code"]})
        return response, 200


# @app.route('/api/site_enformer', methods=['GET'])
# def predict_Enformer():
#     chrom, start, end = int(request.args.get('chrom')), int(request.args.get('start')), int(request.args.get('end'))
#     chr = 12
#     preds = enf.predict_expression('./uploads/genetics/genetic.fasta', chrom, start, end)[:,chr].tolist()
#     result = []
#     for x,y in zip(np.linspace(start, end, num=len(preds)), preds):
#         result.append({'x':x,'y':y})
#     print(result)
#     return jsonify(result), 200
#
# #add to postprocessing object
# @app.route('/api/genomic_tracks', methods=['GET'])
# def get_genomic_tracks():
#     track_info = []
#     with open('./inference/genomics/enformer/data/genomic_tracks.txt') as f:
#         for line in f:
#             track_info.append({'value':line.rstrip()})
#     return jsonify(track_info), 200

# def predict_protTransAF2(seq, model):
#     chrom, start, end = int(request.args(get('chrom'))), int(request.)

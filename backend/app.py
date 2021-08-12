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

from flask import Flask, jsonify, request
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

app = Flask(__name__)
dashboard.config.init_from(file="./config.cfg")
dashboard.bind(app)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading",
    async_handlers=True,
    ping_timeout=720,
    ping_interval=90
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
    return "Welcome to Unicorn!"


@app.route("/test", methods=["GET"])
# @cross_origin()
# route for home
def test():
    print("here")
    return jsonify("Welcome to Unicorn!"), 200


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
    dbU, model = databaseUtils(), "AlphaFold2Lite"
    sequence = request.args.get("sequence", type=str).upper()
    name = request.args.get("name", type=str)
    print(sequence, name)

    encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
    db_data = dbU.get(encoded_seq, "encoded_seq", ["short_code", "pdb"])
    if db_data is not None:
        jobName, code, pdb = (
            encoded_seq,
            db_data[0],
            lzma.decompress(db_data[1]).decode("utf-8"),
        )
        response = jsonify({"name": jobName, "pdb": pdb, "code": code})
        return response, 200
    else:
        return jsonify({"name": None, "pdb": None, "code": None}), 404


@app.route("/api/site_alphafold2", methods=["GET", "OPTIONS"])
def predict_alphaFold2():
    dbU, model = databaseUtils(), "AlphaFold2"
    sequence = request.args.get("sequence", type=str).upper()
    name = request.args.get("name", type=str)
    print(sequence, name)

    encoded_seq = hashlib.sha1(sequence.encode()).hexdigest()
    db_data = dbU.get(encoded_seq, "encoded_seq", ["short_code", "pdb", "model"])
    if db_data is not None and db_data[2] == model:
        jobName, code, pdb = (
            encoded_seq,
            db_data[0],
            lzma.decompress(db_data[1]).decode("utf-8"),
        )
        response = jsonify({"name": jobName, "pdb": pdb, "code": code})
        return response, 200
    else:
        return jsonify({"name": None, "pdb": None, "code": None}), 404


@app.route("/api/get_alphafold_state", methods=["GET"])
def getState():
    dbU = databaseUtils()
    print("Get Code")
    short_code = request.args.get("code", type=str)
    db_data = dbU.get(short_code, "short_code", ["pdb"])
    if db_data is not None:
        pdb = lzma.decompress(db_data[0]).decode("utf-8")
    else:
        pdb = None
    response = jsonify({"pdb": pdb})
    return response, 200


class databaseUtils:
    def __init__(self, db_file="protein_data.db", table_name="protein_data"):
        self.db_file = db_file
        self.table_name = table_name

    def generateRandom(self, search_col):
        with closing(sqlite3.connect(self.db_file)) as connection:
            with closing(connection.cursor()) as cursor:
                alphabet = (
                    (string.ascii_letters + string.digits)
                    .replace("l", "")
                    .replace("I", "")
                )
                while True:
                    code = "".join(secrets.choice(alphabet) for i in range(6))
                    rows = cursor.execute(
                        f"SELECT 1 FROM {self.table_name} WHERE {search_col} = ? LIMIT 1",
                        (code,),
                    ).fetchone()
                    if rows is None:
                        return code

    def get(self, key, search_col, return_col):
        with closing(sqlite3.connect(self.db_file)) as connection:
            with closing(connection.cursor()) as cursor:
                return_col_query = ", ".join(return_col)
                rows = cursor.execute(
                    f"SELECT {return_col_query} FROM {self.table_name} WHERE {search_col} = ? LIMIT 1",
                    (key,),
                ).fetchone()
                return rows

    def set(self, encoded_seq, short_code, pdb, model):
        with closing(sqlite3.connect(self.db_file)) as connection:
            with closing(connection.cursor()) as cursor:
                cursor.execute(
                    f"INSERT INTO {self.table_name} VALUES (?, ?, ?, ?)",
                    (encoded_seq, short_code, pdb, model),
                )
                connection.commit()
                print(f"Added Value: {encoded_seq} {short_code}")

    def update(self, encoded_seq, pdb, model):
        with closing(sqlite3.connect(self.db_file)) as connection:
            with closing(connection.cursor()) as cursor:
                rows = cursor.execute(
                    f"UPDATE {self.table_name} SET pdb = ?, model = ? WHERE encoded_seq = ?",
                    (pdb, model, encoded_seq),
                ).fetchall()
                connection.commit()
                print(f"Updated Value: {encoded_seq}")


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
    db_data = dbU.get(encoded_seq, "encoded_seq", ["short_code", 'model'])
    if db_data is None or (model == "alphafold2" and model != db_data[1]):
        dbU.set(encoded_seq, code, lzma.compress(pdb.encode("utf-8"), preset=9), model)
    emit("foldedProtein", {"data": {"pdb": pdb, "name": jobName, "code": code}})


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

#!/bin/bash

if [[ "$2" = "og" ]]
then
  wget -q --show-progress -O ${1}/model/model.zip https://www.ebi.ac.uk/biostudies/files/S-BSST292/u/Retrained_Inception_v4.zip && unzip -q ${1}/model/model.zip -d ${1}/model

elif [[ "$2" = "alt" ]]
then
  wget -q --show-progress -O ${1}/model/model.zip https://www.ebi.ac.uk/biostudies/files/S-BSST292/u/Retrained_Inception_v4_alt.zip && unzip -q ${1}/model/model.zip -d ${1}/model && rm ${1}/model/model.zip
fi
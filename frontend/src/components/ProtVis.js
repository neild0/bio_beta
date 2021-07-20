import React, { Component } from "react";
import axios from "axios";
import Header from "./Header";
import { Row, Col, Divider, Image, Upload } from "antd";
import "./my-theme.css";
import { InboxOutlined } from "@ant-design/icons";
import Viztein from "viztein";

const { Dragger } = Upload;

const serv = "http://3.137.178.208";

class ProtVis extends React.Component {
  state = {
    pdb: false,
  };

  render() {
    const UploadFasta = async (options) => {
      const { onSuccess, onError, file, onProgress } = options;
      // const [defaultFileList, setDefaultFileList] = useState([]);
      const fmData = new FormData();
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          console.log((event.loaded / event.total) * 100);
          onProgress({ percent: (event.loaded / event.total) * 100 }, file);
        },
      };
      fmData.append("uploadedImages", file);
      axios
        .post(`${serv}:3333/api/protein_data`, fmData, config)
        .then((res) => {
          onSuccess(file);
          console.log(res);
        })
        .catch((err) => {
          const error = new Error("Some error");
          onError({ event: error });
        });
      this.setState({ pdb: `${serv}:3333/proteins/unrelaxed_model_1.pdb` });
      // await axios.get(`${serv}:3334/api/site_alphafold`);
    };
    return (
      <>
        <Row>
          <div style={{ fontSize: 20, fontWeight: 1000 }}> Hosted Model</div>
        </Row>
        <Row>
          <Dragger
            multiple={false}
            customRequest={UploadFasta}
            style={{ marginTop: "10px", marginLeft: "-30px" }}
            accept=".seq,.fasta"
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">Upload Fasta File Here</p>
          </Dragger>
        </Row>
        <Row>
          <span style={{ fontWeight: 200, fontSize: 16 }}>
            {this.state.pdb != false && (
              <Viztein
                data={{
                  filename: this.state.pdb,
                }}
                viewportId="viewport-1"
                viewportStyle={{
                  width: "300px",
                  height: "300px",
                  backgroundColor: "white",
                  marginLeft: 10,
                  top: "50px",
                }}
              />
            )}
          </span>
        </Row>
      </>
    );
  }
}
export default ProtVis;

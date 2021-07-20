import React, { Component } from "react";
import axios from "axios";
import Header from "./Header";
import { Row, Col, Divider, Image, Upload, Progress } from "antd";
import "./my-theme.css";
import { InboxOutlined } from "@ant-design/icons";
import Viztein from "viztein";

const { Dragger } = Upload;

const serv = "http://3.137.178.208";

class ProtVis extends React.Component {
  state = {
    running: false,
    pdb: false,
    seconds: 0,
  };

  tick() {
    this.setState((state) => ({
      seconds: state.seconds + 1,
    }));
  }

  render() {
    const UploadFasta = async (options) => {
      const { onSuccess, onError, file, onProgress } = options;
      // const [defaultFileList, setDefaultFileList] = useState([]);
      const fmData = new FormData();
      this.setState({ running: true });
      this.interval = setInterval(() => this.tick(), 500);
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          console.log((event.loaded / event.total) * 100);
          onProgress({ percent: (event.loaded / event.total) * 100 }, file);
        },
      };
      fmData.append("uploadedImages", file);
      await axios
        .post(`${serv}:3333/api/protein_data`, fmData, config)
        .then((res) => {
          onSuccess(file);
          axios.get(`${serv}:3334/api/site_alphafold`).then((res) => {
            this.setState({
              pdb: `${serv}:3333/proteins/test.pdb`,
              running: false,
              seconds: 0,
            });
            clearInterval(this.interval);
          });
          console.log(res);
        })
        .catch((err) => {
          const error = new Error("Some error");
          clearInterval(this.interval);
          onError({ event: error });
        });
    };
    return (
      <>
        <Row>
          <div style={{ fontSize: 20, fontWeight: 1000 }}> Hosted Model</div>
        </Row>
        <Row>
          {!this.state.running ? (
            <Dragger
              multiple={false}
              customRequest={UploadFasta}
              style={{ marginTop: "10px", width: "200%" }}
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
          ) : (
            <>
              {" "}
              <img
                src="http://25.media.tumblr.com/4c6404c75a3771c6627116d5674ce278/tumblr_n11nbzoVoI1tqn5m5o1_400.gif"
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                width="600"
                height="404"
              ></img>{" "}
              <Progress
                strokeColor={{
                  from: "#FFA3BE",
                  to: "#FFBD81",
                }}
                style={{ width: "70%" }}
                percent={this.state.seconds}
                status="active"
                showInfo={false}
              />
            </>
          )}
        </Row>
        <Row>
          <span style={{ fontWeight: 200, fontSize: 16 }}>
            {this.state.pdb != false && (
              <Viztein
                data={{
                  filename: `${serv}:3333/proteins/test.pdb`,
                }}
                viewportId="viewport-1"
                viewportStyle={{
                  borderRadius: "50px",
                  width: "30vw",
                  height: "30vw",
                  backgroundColor: "#f9f9f9",
                  top: "50px",
                  marginTop: "20px",
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

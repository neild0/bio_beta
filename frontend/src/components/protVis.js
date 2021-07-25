import React, { Component } from "react";
import axios from "axios";
import Header from "./Header";
import { Row, Col, Divider, Image, Upload, Progress } from "antd";
import "./my-theme.css";
import { FileTextOutlined, ExperimentOutlined } from "@ant-design/icons";
import Viztein from "viztein";
import StomIcon from "./stom_icon";

const { Dragger } = Upload;

const serv_data = "https://api.getmoonbear.com:443";
const serv_api= "https://api.getmoonbear.com:444";


class ProtVis extends React.Component {
  state = {
    running: false,
    name: null,
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
      console.log("TEST", file.size);
      if (file.size < 500) {
        const fmData = new FormData();
        this.setState({ running: true });
        this.interval = setInterval(() => this.tick(), 3000);
        const config = {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            console.log((event.loaded / event.total) * 100);
            onProgress({ percent: (event.loaded / event.total) * 100 }, file);
          },
        };
        fmData.append("uploadedImages", file);
        await axios
          .post(`${serv_data}/api/protein_data`, fmData, config)
          .then((res) => {
            onSuccess(file);
            axios.get(`${serv_api}/api/site_alphafold`).then((res) => {
              this.setState({
                pdb: `${serv_data}/proteins/test.pdb`,
                running: false,
                seconds: 0,
                name: res.data.name,
              });
              clearInterval(this.interval);
            });
            console.log(res);
          })
          .catch((err) => {
            const error = new Error("Some error");
            clearInterval(this.interval);
            onError({ event: error });
            //TODO: better specify timeout error on frontend

          });
      } else {
        window.alert("Sequence is too large, please input smaller fasta.");
      }
    };
    return (
      <>
        <Row>
          <div style={{ fontSize: 20, fontWeight: 1000 }}> Hosted Model</div>
        </Row>
        <Row style={{ marginBottom: 30 }}>
          <div style={{ width: "100%" }}>
            <Dragger
              multiple={false}
              customRequest={UploadFasta}
              style={{ marginTop: "10px" }}
              accept=".seq,.fasta"
              showUploadList={false}
              disabled={this.state.running}
            >
              <p className="ant-upload-drag-icon">
                {this.state.running ? (
                  <ExperimentOutlined style={{ color: "#55ad81" }} />
                ) : (
                  <FileTextOutlined />
                )}
              </p>
              <p className="ant-upload-text" style={{ fontWeight: 1000 }}>
                {this.state.running
                  ? `Running Model`
                  : `Click or drag sequence file here to run model`}
              </p>
            </Dragger>
          </div>
        </Row>

        {this.state.running && (
          <div style={{ width: "100%" }}>
            <Row>
              <Progress
                strokeColor={{
                  from: "#FFA3BE",
                  to: "#FFBD81",
                }}
                format={(percent) => (
                  <>
                    <StomIcon spin style={{ fontSize: "12px" }} />
                  </>
                )}
                style={{ width: "100%", alignSelf: "center" }}
                percent={this.state.seconds}
                status="active"
                showInfo={true}
                strokeWidth="50px"
              />
            </Row>
          </div>
        )}

        {this.state.pdb != false && this.state.running == false && (
          <span style={{ fontWeight: 200, fontSize: 16 }}>
            {/*<Divider style={{marginBottom:"-20px", width:"5px", margin:"20px 0px -300px" }}>{`Modeled Protein: ${this.state.name}`}</Divider>*/}
            {/*TODO: add divider to display protein name*/}
            <Viztein
              data={{
                filename: `${serv_data}:3333/proteins/test.pdb`,
              }}
              viewportId="viewport-1"
              viewportStyle={{
                borderRadius: "50px",
                width: "100%",
                height: "52.5vh",
                backgroundColor: "#f9f9f9",
                bottom: "50px",
                marginTop: "-34px",
                bordered: true,
                borderBlockColor: "black",
              }}
            />
          </span>
        )}
      </>
    );
  }
}
export default ProtVis;

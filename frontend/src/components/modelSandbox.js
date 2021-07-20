import React, { Component } from "react";
import axios from "axios";
import Header from "./Header";
import { Row, Col, Divider, Image, Upload } from "antd";
import "./my-theme.css";
import { InboxOutlined } from "@ant-design/icons";
import ProtVis from "./protVis";

const { Dragger } = Upload;
const serv = "http://3.137.178.208";

class ModelSandbox extends Component {
  state = {
    pdb: false,
  };
  render() {
    const { model, info, sandbox } = this.props;

    return (
      <>
        <Header />
        <Row>
          <span
            style={{
              position: "absolute",
              fontWeight: 1000,
              fontSize: 32,
              marginLeft: 30,
              marginTop: 30,
            }}
          >
            {model}
          </span>
          <Divider
            style={{
              position: "absolute",
              fontWeight: 1000,
              fontSize: 40,
              marginLeft: 30,
              marginTop: 100,
            }}
          />
        </Row>
        <Row>
          <Col span={16} style={{ marginTop: 120, minHeight: "80vh" }}>
            <iframe
              src="http://3.137.178.208:3333/alphafold_paper.pdf"
              height="80%"
              width="90%"
              style={{ marginLeft: "30px" }}
              frameBorder={10}
            />
            {/*<Divider*/}
            {/*  type="vertical"*/}
            {/*  style={{ height: "100vh", marginLeft: "30px" }}*/}
            {/*/>*/}
          </Col>

          <Col span={8} style={{ marginTop: 120, minHeight: "80vh" }}>
            <ProtVis/>
          </Col>
        </Row>
      </>
    );
  }
}
export default ModelSandbox;

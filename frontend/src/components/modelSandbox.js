import React, { Component } from "react";
import axios from "axios";
import Header from "./Header";
import { Row, Col, Divider, Image, Upload } from "antd";
import "./my-theme.css";
import { InboxOutlined } from "@ant-design/icons";
import ProtVis from "./protVis";

const { Dragger } = Upload;
const serv = "https://3.137.178.208";

class ModelSandbox extends Component {
  state = {
    pdb: false,
  };
  render() {
    const { model, info, sandbox } = this.props;

    return (
      <>
        <Header />
        <Row
          style={{
            fontWeight: 1000,
            fontSize: 32,
            marginLeft: 30,
            marginTop: 30,
            marginBottom: -20,
          }}
        >
          {model}
        </Row>
        <Row>
          <Divider
            style={{
              fontWeight: 1000,
              fontSize: 40,
              marginLeft: "30px",
            }}
          />
        </Row>
        <Row>
          <Col span={15} style={{ minHeight: "70vh" }}>
            <iframe
              src="https://3.137.178.208:3333/alphafold_paper.pdf"
              height="100%"
              width="93.25%"
              style={{ marginLeft: "30px" }}
              frameBorder={10}
            />
          </Col>
          <Col span={1} style={{ minHeight: "70vh", marginRight: -15 }}>
            <Divider
              type="vertical"
              style={{ height: "103%", marginTop: -23 }}
            />
          </Col>

          <Col
            span={8}
            style={{
              minHeight: "70vh",
              alignSelf: "flex-start",
              paddingRight: 20,
            }}
          >
            <ProtVis />
          </Col>
        </Row>
      </>
    );
  }
}
export default ModelSandbox;

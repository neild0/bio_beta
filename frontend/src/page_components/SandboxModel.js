import React, { Component } from "react";
import Header from "./Header";
import { Col, Divider, Row, Upload } from "antd";
import ProteinVisualization from "../sandbox_components/ProteinVisualization";

const { Dragger } = Upload;

class SandboxModel extends Component {
  state = {
    pdb: false,
  };

  render() {
    const { model, info, sandbox, api, model_info } = this.props;
    const sandboxToElement = {
      protein_vis: <ProteinVisualization api={api} model={model} />,
    };
    return (
      <>
        <Header />
        <Row
          style={{
            fontWeight: 1000,
            fontSize: 32,
            marginLeft: "min(30px,3vw)",
            marginTop: 10,
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
              marginLeft: "min(30px,3vw)",
            }}
          />
        </Row>
        <Row>
          <Col
            sm={8}
            xs={0}
            style={{
              height: "max(550px, calc(200%-20px)), calc(100vh - 260px)",
              marginLeft: "min(30px,3vw)",
              marginRight: "min(-10px,-1vw)",
            }}
          >
            <iframe
              src={`model_info/${model_info}`}
              height="100%"
              width="93.25%"
              style={{}}
              frameBorder={10}
            />
          </Col>
          <Col
            sm={2}
            xs={0}
            style={{
              height: "max(570px, calc(100%-10px)), calc(100vh - 250px)",
              marginRight: "min(-10px,-7.25vw)",
              marginTop: -23,
            }}
          >
            <Divider type="vertical" style={{ height: "103%" }} />
          </Col>

          <Col
            sm={15}
            xs={24}
            style={{
              height: "clamp(550px, calc(100vh - 245px), 10000px)",
              width: "100vh",
              alignSelf: "flex-start",
              paddingRight: -10,
              paddingLeft: 20,
            }}
          >
            {sandboxToElement[sandbox]}
          </Col>
        </Row>
      </>
    );
  }
}

export default SandboxModel;

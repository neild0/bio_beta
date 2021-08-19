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
              marginLeft: "min(30px,3vw)",
              marginRight: "min(-10px,-1vw)",
            }}
          >
            <iframe
              src={`model_info/${model_info}`}
              height="88%"
              width="93.25%"
              frameBorder={10}
            />
            <div
              style={{
                width: "93.25%",
                marginTop: "-20px",
                marginRight: "20px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Divider />
              <a
                href={
                  "https://www.biorxiv.org/content/10.1101/2021.08.15.456425v1.full.pdf+html"
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: -15,
                  marginLeft: 5,
                  fontSize: 10,
                  color: "black",
                }}
              >
                <b> MSA Generation: </b> Mirdita, M., Ovchinnikov, S., & Steinegger, M. ColabFold—Making protein folding accessible to all. BioRxiv (2021).
              </a>
                <a
                    href={
                        "https://www.nature.com/articles/s41586-021-03819-2"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        marginTop: 5,
                        marginLeft: 5,
                        fontSize: 10,
                        color: "black",
                    }}
                >
                    <b> Protein Folding Base: </b> Jumper, J., Evans, R., Pritzel, A. et al. Highly accurate protein structure prediction with AlphaFold. Nature (2021).
                </a>
            </div>
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
            <Divider type="vertical" style={{ height: "102%" }} />
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

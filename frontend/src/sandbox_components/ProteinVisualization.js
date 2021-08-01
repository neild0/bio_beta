import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Input, Progress, Row, Tabs, Upload } from "antd";
import "../themes/protein-visualization-theme.css";
import "molstar/build/viewer/molstar.css";
import notif from "../assets/notif.mp3";

import {
  EditOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Viztein from "viztein";
import StomIcon from "../page_components/stom_icon";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import {
  DefaultPluginUISpec,
  PluginUISpec,
} from "molstar/lib/mol-plugin-ui/spec";
import { PluginConfig } from "molstar/lib/mol-plugin/config";
import { Viewer } from "molstar/build/viewer/molstar";
import MolstarRender from "./MolstarRender";
import useSound from "use-sound";

const { Dragger } = Upload;
const { TabPane } = Tabs;
const { Search } = Input;

const serv_data = "https://api.getmoonbear.com:443";
const serv_api = "https://api.getmoonbear.com:444";

const ProteinVisualization = (props) => {
  const [running, setRun] = useState(false);
  const [name, setName] = useState(null);
  const [sequence, setSeq] = useState(null);
  const [pdb, setPDB] = useState(null);
  const [seconds, setSec] = useState(0);
  const [play] = useSound(notif, { volume: 0.075 });

  useEffect(() => {
    let intervalId;
    if (running) {
      intervalId = setInterval(() => {
        setSec(seconds + 1);
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [running, seconds]);

  const showNotification = () => {
    let options = {
      body: "Your folded protein is waiting in the sandbox! 🌙",
      icon: "https://www.getmoonbear.com/favicon.png",
      dir: "ltr",
    };
    let notification = new Notification(
      `Finished Running ${props.model}`,
      options
    );
    notification.addEventListener(
      "click",
      function (e) {
        window.focus();
        e.target.close();
      },
      false
    );
    play();
  };

  const UploadSeq = async (sequence, name) => {
    console.log(sequence, name);
    if (sequence.length < 500) {
      if (/^[a-zA-Z]+$/.test(sequence)) {
        if (!("Notification" in window)) {
          console.log("This browser does not support desktop notification");
        } else {
          await Notification.requestPermission();
        }
        setRun(true);
        axios
          .get(`${serv_api}/api/site_${props.api}`, {
            params: {
              sequence: sequence,
              name: name,
            },
          })
          .then((res) => {
            // setPDB(`${serv_data}/proteins/${res.data.name}.pdb`);
            setPDB(res.data.pdb);
            setRun(false);
            setSec(0);
            setName(res.data.name);
            showNotification();
          })
          .catch((err) => {
            const error = new Error("Some error");
            // onError({ event: error });
            //TODO: better specify timeout error on frontend
          });
      } else {
        window.alert(
          "Sequence is invalid, please ensure the sequence only contains letters."
        );
      }
    } else {
      window.alert("Sequence is too long, please input smaller fasta.");
    }
  };
  const UploadInput = async (sequence) => {
    await UploadSeq(sequence, "null");
  };
  const ReadFasta = async (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let seq = e.target.result.split(/\r?\n/).slice(1).join("");
        resolve(seq);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsText(file);
    });
  };
  const UploadFasta = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    if (file.size < 2000) {
      let seq = await ReadFasta(file);
      let filename = file.name.split(".").slice(0, -1).join(".");
      setSeq(seq);
      await UploadSeq(seq, filename);
    } else {
      window.alert("File is too large, please input smaller fasta.");
    }
  };

  return (
    <>
      <>
        <Row>
          <div style={{ fontSize: 20, fontWeight: 1000 }}> Hosted Model</div>
        </Row>
        <Row style={{ marginBottom: 30 }}>
          <div style={{ width: "100%" }}>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab={
                  <span>
                    <EditOutlined />
                    Input Sequence
                  </span>
                }
                key="1"
              >
                <Search
                  placeholder="Input protein sequence here..."
                  enterButton="Compute"
                  size="large"
                  color="#000000"
                  onSearch={UploadInput}
                  value={sequence}
                  onChange={(e) => {
                    setSeq(e.target.value);
                  }}
                  disabled={running}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <UploadOutlined />
                    Upload File
                  </span>
                }
                key="2"
                style={{ height: "100%" }}
              >
                <Dragger
                  multiple={false}
                  customRequest={UploadFasta}
                  style={{ marginTop: "10px" }}
                  accept=".seq,.fasta"
                  showUploadList={false}
                  disabled={running}
                >
                  <p className="ant-upload-drag-icon">
                    {running ? (
                      <ExperimentOutlined style={{ color: "#55ad81" }} />
                    ) : (
                      <FileTextOutlined />
                    )}
                  </p>
                  <p className="ant-upload-text" style={{ fontWeight: 1000 }}>
                    {running
                      ? `Running Model`
                      : `Click or drag sequence file here to run model`}
                  </p>
                </Dragger>
              </TabPane>
            </Tabs>
          </div>
        </Row>

        {running && (
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
                percent={seconds / 1.75}
                status="active"
                showInfo={true}
                strokeWidth="50px"
              />
            </Row>
          </div>
        )}

        {pdb != null && running == false && (
          <span style={{ fontWeight: 200, fontSize: 16 }}>
            {/*<Divider style={{marginBottom:"-20px", width:"5px", margin:"20px 0px -300px" }}>{`Modeled Protein: ${this.state.name}`}</Divider>*/}
            {/*TODO: add divider to display protein name*/}
            {/*<Viztein*/}
            {/*  data={{*/}
            {/*    filename: pdb,*/}
            {/*  }}*/}
            {/*  viewportId="viewport-1"*/}
            {/*  width="100%"*/}
            {/*  viewportStyle={{*/}
            {/*    borderRadius: "50px",*/}
            {/*    width: "100%",*/}
            {/*    height: "52.5vh",*/}
            {/*    backgroundColor: "#f9f9f9",*/}
            {/*    bottom: "50px",*/}
            {/*    marginTop: "-45px",*/}
            {/*    bordered: true,*/}
            {/*    borderBlockColor: "black",*/}
            {/*  }}*/}
            {/*/>*/}
            {/*<MolstarViewer url={pdb} options={{layoutIsExpanded: false,*/}
            {/*  layoutShowControls: false,*/}
            {/*  layoutShowRemoteState: false,*/}
            {/*  layoutShowSequence: false,*/}
            {/*  layoutShowLog: false,*/}
            {/*  layoutShowLeftPanel: false,*/}
            {/*  collapseLeftPanel: true,*/}
            {/*}}/>*/}
            <MolstarRender pdb={pdb} />
          </span>
        )}
      </>
    </>
  );
};

export default ProteinVisualization;

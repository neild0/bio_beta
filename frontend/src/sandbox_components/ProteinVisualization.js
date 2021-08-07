import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Divider, Input, Progress, Row, Tabs, Upload } from "antd";
import "../themes/protein-visualization-theme.css";
import "molstar/build/viewer/molstar.css";
import notif from "../assets/notif.mp3";
import { Share } from "react-twitter-widgets";
import {
  EditOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  UploadOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import StomIcon from "../page_components/stom_icon";
import MolstarRender from "./custom_molstar/MolstarRender";
import useSound from "use-sound";
import ClipboardJS from "clipboard";

const { Dragger } = Upload;
const { TabPane } = Tabs;
const { Search } = Input;

const serv_data = "https://api.getmoonbear.com:443";
const serv_api = "https://api.getmoonbear.com:444";

new ClipboardJS(".btn");

const ProteinVisualization = (props) => {
  const [running, setRun] = useState(false);
  const [name, setName] = useState(null);
  const [sequence, setSeq] = useState(null);
  const [pdb, setPDB] = useState(null);
  const [seconds, setSec] = useState(0);
  const [inputCode, setInputCode] = useState("");
  const [stateCode, setStateCode] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [play] = useSound(notif, { volume: 0.5 });

  useEffect(() => {
    let url_code = new URLSearchParams(window.location.search).get(
      "state_code"
    );
    console.log(url_code);
    if (url_code != null) {
      LoadState(url_code);
    }
  }, []);

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
      body: "Your folded protein is waiting in the sandbox! 🌙 🧸",
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
    if (sequence.length < 500 && sequence.length > 15) {
      if (/^[a-zA-Z]+$/.test(sequence)) {
        if (!("Notification" in window)) {
          console.log("This browser does not support desktop notification");
        } else {
          await Notification.requestPermission();
        }
        setRun(true);
        setInputCode("");
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
            setStateCode(res.data.code);
            setInputCode(res.data.code);
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
      if (sequence.length > 500) {
        window.alert("Sequence is too long, please input smaller sequence.");
      } else {
        window.alert("Sequence is too short, please input larger sequence.");
      }
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

  const LoadState = async (code) => {
    if (code.length != 6) {
      window.alert("Invalid code - must be 6 characters long.");
    } else {
      setLoadingState(true);
      axios
        .get(`${serv_api}/api/get_alphafold_state`, {
          params: {
            code: code,
          },
        })
        .then((res) => {
          let temp_pdb = res.data.pdb;
          if (temp_pdb != null) {
            setPDB(temp_pdb);
            setStateCode(code);
            setInputCode(code);
          } else {
            window.alert("Invalid code - please check your input and casing.");
            setInputCode(stateCode);
          }
          setLoadingState(false);
        })
        .catch((err) => {
          const error = new Error("Some error");
          // onError({ event: error });
          //TODO: better specify timeout error on frontend
        });
    }
  };

  return (
    <div style={{ height: "100%" }}>
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
                onChange={(e) => {
                  setSeq(e.target.value);
                }}
                disabled={running || loadingState}
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
                style={{ marginTop: "0px" }}
                accept=".seq,.fasta"
                showUploadList={false}
                disabled={running || loadingState}
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
            <TabPane
              tab={
                <span>
                  <CodeOutlined />
                  Load/Share Visualization
                </span>
              }
              key="3"
              style={{ height: "100%" }}
            >
              <Row
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Search
                  placeholder="Input state code..."
                  enterButton={
                    <Button
                      type="primary"
                      loading={loadingState}
                      onClick={LoadState}
                      disabled={inputCode == stateCode || inputCode.length != 6}
                    >
                      Load
                    </Button>
                  }
                  size="large"
                  color="#000000"
                  onSearch={LoadState}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                  }}
                  maxLength={6}
                  disabled={running}
                  style={{ width: "250px" }}
                />
                <div style={{width:'100px'}}>
                  <Share
                    url={`https://getmoonbear.com`}
                    options={{
                      text: "Take a look at the awesome protein I folded with #AlphaFold2 on #GetMoonbear!",
                      size: "large",
                      dnt: true,
                    }}
                  />
                </div>
                {/*<input id="foo" value="https://github.com/zenorocha/clipboard.js.git"/>*/}

                {/*<button className="btn" data-clipboard-target="#foo">*/}
                {/*  HEHE*/}
                {/*</button>*/}
              </Row>
            </TabPane>
          </Tabs>
        </div>
      </Row>

      <div style={{ width: "100%" }}>
        <Row>
          {running ? (
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
          ) : (
            pdb != null && (
              <Divider
                style={{
                  alignSelf: "center",
                  top: 215,
                  position: "absolute",
                }}
              />
            )
          )}
        </Row>
      </div>

      {pdb != null && running == false && (
        <div
          style={{
            fontWeight: 200,
            fontSize: 16,
            top: 0,
            bottom: 10,
          }}
        >
          {/*TODO: add divider to display protein name*/}
          <MolstarRender pdb={pdb} />
        </div>
      )}
    </div>
  );
};

export default ProteinVisualization;

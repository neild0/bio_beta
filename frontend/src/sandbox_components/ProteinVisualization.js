import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import axios from "axios";
import {
  Button,
  Divider,
  Input,
  Progress,
  Row,
  Tabs,
  Tooltip,
  Upload,
} from "antd";
import "../themes/protein-visualization-theme.css";
import "molstar/build/viewer/molstar.css";
// import notif from "../assets/notif.mp3";
import { Share } from "react-twitter-widgets";
import io from "socket.io-client";
import {
  EditOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  UploadOutlined,
  CodeOutlined,
  LinkOutlined,
  DownloadOutlined,
  NodeIndexOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import StomIcon from "../page_components/stom_icon";
import MolstarRender from "./custom_molstar/MolstarRender";
import useSound from "use-sound";
import ClipboardJS from "clipboard";

const { Dragger } = Upload;
const { TabPane } = Tabs;
const { Search } = Input;

const sampleProtein = "MdhwXh";

const serv_api = "https://api.getmoonbear.com";
const socket = io(serv_api);

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
  const [imageData, setImageData] = useState(null);
  // const [play] = useSound(notif, { volume: 0.5 });
  const [funcTab, setFuncTab] = useState("1");

  const history = useHistory();
  const location = useLocation();

  const molstarViz = useRef();

  const foldHandler = (res) => {
    setFuncTab("1");
    setPDB(res.data.pdb);
    setRun(false);
    setSec(0);
    setName(res.data.name);
    setStateCode(res.data.code);
    setInputCode(res.data.code);
    let params = new URLSearchParams({ state_code: res.data.code });
    history.replace({
      pathname: location.pathname,
      search: params.toString(),
    });
    showNotification();
  };

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

  useEffect(() => {
    socket.disconnect();
  }, [pdb]);

  const showNotification = () => {
    let options = {
      body: "Your folded protein is waiting in the sandbox! 🌙 🧸",
      icon: "favicon.png",
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
    // play();
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
        history.replace({ pathname: location.pathname, search: "" });
        setSeq(sequence);
        axios
          .get(`${serv_api}/api/site_${props.api}`, {
            params: {
              sequence: sequence,
              name: name,
            },
          })
          .then(foldHandler)
          .catch((err) => {
            console.log("Connected socket");
            socket.connect();
            socket.emit("fold", { seq: sequence, model: props.api });
            socket.once("foldedProtein", foldHandler);
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
      await UploadSeq(seq, filename);
    } else {
      window.alert("File is too large, please input smaller fasta.");
    }
  };

  const LoadState = async (code) => {
    if (code.length != 6) {
      window.alert("Invalid code - must be 6 characters long.");
      history.replace({ pathname: location.pathname, search: "" });
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
            let params = new URLSearchParams({ state_code: code });
            history.replace({
              pathname: location.pathname,
              search: params.toString(),
            });
          } else {
            window.alert("Invalid code - please check your input and casing.");
            setInputCode(stateCode);
            history.replace({ pathname: location.pathname, search: "" });
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
  const copyState = () => {
    navigator.clipboard.writeText(
      `www.getmoonbear.com/${props.model.replace(
        " ",
        ""
      )}?state_code=${stateCode}`
    );
  };

  const downloadState = () => {
    if (pdb != null) {
      const element = document.createElement("a");
      const file = new Blob([pdb], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = `${stateCode}_Moonbear-Protein-AF2.pdb`;
      document.body.appendChild(element);
      element.click();
    }
  };

  // const downloadState = () => {
  //   if (molstarViz.current) {
  //     molstarViz.current.downloadState(`${stateCode}_Moonbear-Protein-AF2`)
  //   }
  // };

  return (
    <div style={{ height: "100%" }}>
      <Row>
        <div style={{ fontSize: 20, fontWeight: 1000 }}> Hosted Model</div>
      </Row>
      <Row style={{ marginBottom: 30 }}>
        <div style={{ width: "100%" }}>
          <Tabs
            activeKey={funcTab}
            onChange={(key) => {
              setFuncTab(key);
            }}
          >
            <TabPane
              tab={
                <span>
                  <CodeOutlined />
                  Load/Share Visualization
                </span>
              }
              key="1"
              style={{ height: "100%" }}
            >
              <Row
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Search
                  placeholder="State code here..."
                  enterButton={
                    <Button
                      type="primary"
                      icon={
                        inputCode == stateCode || inputCode.length != 6 ? (
                          <StopOutlined />
                        ) : (
                          <PlayCircleOutlined />
                        )
                      }
                      loading={loadingState}
                      onClick={LoadState}
                      style={{
                        boxShadow:
                          "inset 0px -3px 5px 1px rgba(208, 216, 243, 0.6) !important",
                        borderRadius: "0px 5px 5px 0px",
                      }}
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
                  style={{ width: "clamp(160px,20vw,230px)" }}
                />

                {pdb == null && (
                  <Button
                    type="dashed"
                    icon={<NodeIndexOutlined />}
                    loading={loadingState}
                    size="large"
                    onClick={() => {
                      LoadState(sampleProtein);
                    }}
                    style={{ marginRight: 10 }}
                  >
                    Load Example Protein (GFP)
                  </Button>
                )}

                {pdb != null && running == false && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                      width: "max(270px, 40%)",
                      flexWrap: "wrap",
                    }}
                  >
                    <Tooltip title="State PDB Downloaded!" trigger="click">
                      <Button
                        type="dashed"
                        icon={<DownloadOutlined />}
                        loading={loadingState}
                        size="middle"
                        onClick={downloadState}
                        style={{ marginRight: 10, height: 30 }}
                      >
                        PDB
                      </Button>
                    </Tooltip>
                    <Tooltip title="State Link Copied!" trigger="click">
                      <Button
                        type="dashed"
                        icon={<LinkOutlined />}
                        loading={loadingState}
                        size="middle"
                        onClick={copyState}
                        style={{ marginRight: 10, height: 30 }}
                      >
                        Link
                      </Button>
                    </Tooltip>
                    <Tooltip title="Shared Protein!" trigger="click">
                      <Share
                        url={`www.getmoonbear.com/${props.model.replace(
                          " ",
                          ""
                        )}?state_code=${stateCode}`}
                        options={{
                          text: "Take a look at the awesome protein I folded with #AlphaFold2 on #GetMoonbear!",
                          size: "large",
                          dnt: true,
                          height: "400",
                        }}
                      />
                    </Tooltip>
                  </div>
                )}
              </Row>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <UploadOutlined />
                  Upload File
                </span>
              }
              key="2"
            >
              <Dragger
                multiple={false}
                customRequest={UploadFasta}
                style={{ marginTop: "0px", alignItems: "center" }}
                accept=".seq,.fasta"
                showUploadList={false}
                disabled={running || loadingState}
              >
                <p className="ant-upload-text" style={{ fontWeight: 1000 }}>
                  {running ? (
                    <>
                      {" "}
                      <ExperimentOutlined style={{ color: "#55ad81" }} />{" "}
                      <span
                        style={{ marginLeft: ".5rem", marginRight: ".5rem" }}
                      >
                        Running Model
                      </span>
                      <ExperimentOutlined style={{ color: "#55ad81" }} />
                    </>
                  ) : (
                    <>
                      {" "}
                      <FileTextOutlined style={{ color: "#3387e1" }} />
                      <span
                        style={{ marginLeft: ".5rem", marginRight: ".5rem" }}
                      >
                        Click or drag sequence file here to run model
                      </span>
                      <FileTextOutlined style={{ color: "#3387e1" }} />
                    </>
                  )}
                </p>
              </Dragger>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <EditOutlined />
                  Input Sequence
                </span>
              }
              key="3"
            >
              <Search
                placeholder="Input protein sequence here..."
                enterButton={
                  <Button
                    type="primary"
                    onClick={(code) => {
                      UploadInput(code);
                    }}
                    style={{
                      boxShadow:
                        "inset 0px -3px 5px 1px rgba(208, 216, 243, 0.5)",
                      borderRadius: "0px 5px 5px 0px",
                      backgroundColor: "#666bff",
                    }}
                    disabled={running || loadingState}
                  >
                    Compute
                  </Button>
                }
                size="large"
                color="#000000"
                onChange={(e) => {
                  setSeq(e.target.value);
                }}
                value={sequence}
                onSearch={(code) => {
                  UploadInput(code);
                }}
                disabled={running || loadingState}
              />
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
              <div
                style={{
                  top: 140,
                  position: "absolute",
                  width: "calc(100% - max(1.2vh, 20px))",
                }}
              >
                <Divider
                  style={{
                    alignSelf: "center",
                    zIndex: 1,
                  }}
                />
              </div>
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
          <MolstarRender pdb={pdb} ref={molstarViz} />
          <div
            className="legend-text"
            style={{
              color: "rgb(42,0,121)",
              bottom: "115px",
              right: "20px",
              fontSize: "small",
              display: 'flex',
              justifyContent:'right',
              alignItems:'right',
              flexDirection: 'column',
              fontWeight:400,
              width:185
            }}
          >
            Residue Confidence (pLDDT)
            <Divider
                style={{
                  alignSelf: "center",
                  zIndex: 1,
                  marginTop:0,
                  marginBottom:10
                }}
            />
          </div>
          <div style={{width:205, height:140, bottom:10, right:10, position:'absolute',   background: 'rgba(238,236,231,0.5)'}}>
            <div
                className="legend-box"
                style={{
                  backgroundColor: "rgba(85,0,255,0.35)",
                  bottom: "85px",
                }}
            />
            <div
                className="legend-text"
                style={{ color: "rgba(85,0,255,0.75)", bottom: "85px" }}
            >
              Very high (pLDDT > 90)
            </div>
            <div
                className="legend-box"
                style={{
                  backgroundColor: "rgba(51,135,225,0.49)",
                  bottom: "60px",
                }}
            />
            <div
                className="legend-text"
                style={{ color: "rgba(0,68,136,0.71)", bottom: "60px" }}
            >
              Confident (90 > | > 70)
            </div>
            <div
                className="legend-box"
                style={{
                  backgroundColor: "rgba(255,205,0,0.57)",
                  bottom: "35px",
                }}
            />
            <div
                className="legend-text"
                style={{ color: "rgba(196,128,0,0.83)", bottom: "35px" }}
            >
              Low (70 > pLDDT > 50)
            </div>
            <div
                className="legend-box"
                style={{
                  backgroundColor: "rgba(255,144,0,0.62)",
                  bottom: "10px",
                }}
            />
            <div
                className="legend-text"
                style={{ color: "rgba(194,105,3,0.76)", bottom: "10px" }}
            >
              Very low (pLDDT &lt; 50)
            </div>
          </div>
          </div>
      )}
    </div>
  );
};

export default ProteinVisualization;

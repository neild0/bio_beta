import React from "react";
import { Text, StyleSheet } from "react-native";
import axios from "axios";
import {
  Card,
  Button,
  Row,
  Col,
  Divider,
  Slider,
  InputNumber,
  AutoComplete,
} from "antd";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
  Crosshair,
  AreaSeries,
  Hint,
  VerticalGridLines,
} from "react-vis";
import { PlayCircleOutlined } from "@ant-design/icons";

const { Meta } = Card;

class ImageResults extends React.Component {
  state = {
    key: "LCL",
    contentList: { LCL: null, MS: null, SS3: null },
    tracks: null,
    selectedTrack: null,
    start: 50_223_589,
    end: 54_223_589,
    chrom: 12,
    value: false,
    tabList: [
      {
        key: "LCL",
        tab: "LCL",
      },
      {
        key: "MS",
        tab: "MS",
      },
      {
        key: "SS3",
        tab: "SS3",
      },
    ],
  };

  onTabChange = (key, type) => {
    this.setState({ [type]: key });
  };

  runExperiment() {
    this.setState({
      contentList: { ...this.state.contentList, LCL: "loading" },
    });
    axios
      .get("http://192.168.1.202:3334/api/site_enformer", {
        params: {
          chrom: this.state.chrom,
          start: this.state.start,
          end: this.state.end,
        },
      })
      .then((res) => {
        console.log(JSON.stringify(res));
        let content = (
          <>
            <XYPlot
              animation={true}
              width={1200}
              height={300}
              onMouseLeave={() => this.setState({ value: false })}
            >
              <VerticalGridLines />
              <HorizontalGridLines />
              <AreaSeries
                data={res.data}
                onNearestX={(d) => this.setState({ value: d })}
              />
              <XAxis tickTotal={5} />
              <YAxis />
              {<Crosshair values={[this.state.value]} />}
              <Hint value={this.state.value} />
            </XYPlot>
            {/*<Hint value={1}>*/}
            {/*    <div style={{background: 'black'}}>*/}
            {/*        <h3>Value of hint</h3>*/}
            {/*        <p>{2}</p>*/}
            {/*    </div>*/}
            {/*</Hint>*/}
          </>
        );
        this.setState({
          contentList: { ...this.state.contentList, LCL: content },
        });
      });
  }

  componentDidMount() {
    axios.get("http://192.168.1.202:3334/api/genomic_tracks").then((res) => {
      this.setState({ tracks: res.data });
    });
  }

  render() {
    console.log(JSON.stringify(this.state.tracks));
    const contentList = {
      LCL: [
        // add range check
        <>
          <Divider orientation="left">Experiment Settings</Divider>
          <Row gutter={16}>
            <Col span={4}>
              Chromosome:
              <InputNumber
                min={1}
                max={23}
                style={{ margin: "0 16px", width: 40 }}
                value={this.state.chrom}
                onChange={(value) => {
                  this.setState({ chrom: value });
                }}
              />
              <Divider type="vertical" style={{ height: "100%" }} />
            </Col>
            <Col span={6}>
              <AutoComplete
                style={{ margin: "0 16px", width: 200 }}
                options={this.state.tracks}
                placeholder="Genomic Track"
                filterOption={(inputValue, option) =>
                  option.value
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
                onChange={(value) => {
                  this.setState({ selectedTrack: value });
                }}
              />
              <Divider type="vertical" style={{ height: "100%" }} />
            </Col>
            <Col span={3.5}>
              Range:
              <InputNumber
                min={0}
                max={1e8}
                style={{ margin: "0 16px", width: 100 }}
                value={this.state.start}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                onChange={(value) => {
                  this.setState({ start: value });
                }}
              />
            </Col>
            <Col span={6}>
              <Slider
                min={0}
                max={1e8}
                range={{ draggableTrack: true }}
                onChange={(values) => {
                  this.setState({ start: values[0], end: values[1] });
                }}
                tipFormatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                value={[this.state.start, this.state.end]}
              />
            </Col>
            <Col span={2}>
              <InputNumber
                min={0}
                max={1e8}
                style={{ margin: "0 16px", width: 100 }}
                value={this.state.end}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                onChange={(value) => {
                  this.setState({ end: value });
                }}
              />
            </Col>
          </Row>
          <Divider orientation="left" />
          <Row>
            <Button
              type="primary"
              shape="round"
              icon={<PlayCircleOutlined />}
              size={12}
              onClick={() => this.runExperiment()}
              disabled={!this.state.selectedTrack}
            >
              {" "}
              Run Experiment{" "}
            </Button>
          </Row>
        </>,
      ],
      MS: [],
      SS3: [],
    };

    return (
      <>
        <Card
          tabList={this.state.tabList}
          activeTabKey={this.state.key}
          onTabChange={(key) => {
            this.onTabChange(key, "key");
          }}
        >
          {contentList[this.state.key]}
        </Card>
        {this.state.contentList[this.state.key] == null ? null : this.state
            .contentList[this.state.key] == "loading" ? (
          <Card
            style={{ width: "100%", textAlign: "center" }}
            loading={true}
          ></Card>
        ) : (
          this.state.contentList[this.state.key]
        )}
      </>
    );
  }
}

export default ImageResults;

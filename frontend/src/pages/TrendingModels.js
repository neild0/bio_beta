import React from "react";
import axios from "axios";
import Header from "../page_components/Header";
import ModelCard from "../page_components/ModelCard";
import { Divider, Row } from "antd";

const serv = "https://api.getmoonbear.com:443";

class TrendingModels extends React.Component {
  state = {
    trending_model_data: false,
  };

  // TODO: init wildcard cert for getmoonbear.com
  componentDidMount() {
    axios
      .get(`${serv}/api/get_model_data`)
      .then((res) => {
        let trending_data = [];
        trending_data = res.data.map((modelData, i) => {
          return (
            <ModelCard
              key={i}
              card_pic={modelData.card_pic}
              model_name={modelData.name}
              creator_icon={modelData.creator_icon}
              creator={modelData.creator}
              area={modelData.area}
              functions={modelData.functions}
              redirect={modelData.name.split(" ").join("")}
            />
          );
        });

        this.setState({ trending_model_data: trending_data });
      })
      .catch((err) => {});
    // const viewer = new Viewer('app', {
    //         layoutIsExpanded: false,
    //         layoutShowControls: false,
    //         layoutShowRemoteState: false,
    //         layoutShowSequence: true,
    //         layoutShowLog: false,
    //         layoutShowLeftPanel: true,
    //         viewportShowExpand: true,
    //         viewportShowSelectionMode: false,
    //         viewportShowAnimation: false,
    //         pdbProvider: 'rcsb',
    //         emdbProvider: 'rcsb',
    //     });
    // this.viewer.loadPdb('7bv2');
    // this.viewer.loadEmdb('EMD-30210', { detail: 6 });

    //Set options (Checkout available options list in the documentation)
    const options = {
      moleculeId: "2nnu",
      hideControls: true,
    };

    //Get element from HTML/Template to place the viewer
    const viewerContainer = document.getElementById("myViewer");
  }

  render() {
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
            Trending Models
          </span>
          <Divider
            style={{
              position: "relative",
              fontWeight: 1000,
              fontSize: 40,
              marginLeft: 30,
              marginTop: 100,
              width: "100%-1000px",
            }}
          />
        </Row>
        <Row
          justify={"left"}
          style={{
            marginLeft: 40,
            marginRight: 40,
          }}
        >
          {this.state.trending_model_data}
        </Row>
        {/*<div id="app"></div>*/}
        {/*<Viewmolstar/>*/}
      </>
    );
  }
}

export default TrendingModels;

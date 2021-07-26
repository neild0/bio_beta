import React from "react";
import axios from "axios";
import Header from "./Header";
import ModelCard from "./ModelCard";
import { Divider, Row } from "antd";
const serv = "http://3.137.178.208";

class HomePage extends React.Component {
  state = {
    trending_model_data: false,
  };

  componentDidMount() {
    axios
      .get(`${serv}:3333/api/get_model_data`)
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
    console.log(JSON.stringify(this.state.trending_model_data));
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
              position: "absolute",
              fontWeight: 1000,
              fontSize: 40,
              marginLeft: 30,
              marginTop: 100,
            }}
          />
        </Row>
        <Row
          justify={"space-between"}
          style={{
            marginLeft: 30,
            marginRight: 30,
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

export default HomePage;

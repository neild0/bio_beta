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
  }

  render() {
    return (
      <>
        <Header />
        <Row
          style={{
            fontWeight: 1000,
            fontSize: 32,
            marginLeft: 30,
            marginTop: 10,
            marginBottom: -10,
          }}
        >
          Trending Models
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
        <Row
          justify={"left"}
          style={{
            marginLeft: 40,
            marginRight: 40,
          }}
        >
          {this.state.trending_model_data}
        </Row>
      </>
    );
  }
}

export default TrendingModels;

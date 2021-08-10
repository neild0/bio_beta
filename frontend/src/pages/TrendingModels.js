import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../page_components/Header";
import ModelCard from "../page_components/ModelCard";
import { Divider, Row } from "antd";

const TrendingModels = (props) => {
  const [trendingData, setTrendingData] = useState(null);

  useEffect(() => {
    fetch("model_card_data.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then(function (data) {
        setTrendingData(
          data.map((modelData, i) => {
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
          })
        );
      });
  }, []);

  return (
    <>
      <Header />
      <Row
        style={{
          fontWeight: 1000,
          fontSize: 32,
          marginLeft: 'min(30px,3vw)',
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
          marginRight: 'min(30px,3vw)',
        }}
      >
        {trendingData}
      </Row>
    </>
  );
};

export default TrendingModels;

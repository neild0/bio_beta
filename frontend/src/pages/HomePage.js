import React from "react";
import axios from "axios";
import Header from "../page_components/Header";
import ModelCard from "../page_components/ModelCard";
import { Divider, Row } from "antd";
import "../themes/homepage-theme.css";

const getHighlightModel = () => {
  fetch("model_card_data.json", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then(function (data) {
      for (let modelData in data) {
          console.log(modelData.highlight)
        if (modelData.highlight == true) {
            console.log(modelData.highlight)
          return (
            <ModelCard
              key={0}
              card_pic={modelData.card_pic}
              model_name={modelData.name}
              creator_icon={modelData.creator_icon}
              creator={modelData.creator}
              area={modelData.area}
              functions={modelData.functions}
              redirect={modelData.name.split(" ").join("")}
            />
          );
        }
      }
    });
};

const HomePage = (props) => {
    const modelData = getHighlightModel()
  return (
    <>
      <Header />
      <div
        className="background-transition"
        style={{
          position: "absolute",
          width: "100vw",
          height: "calc(100vh - 115px)",
          marginTop: "-25px",
          zIndex: -1,
        }}
      ></div>
        {modelData}
      <div
        className="title-text"
        style={{
          marginLeft: "50vw",
          marginTop: "150px",
          textAlign: "center",
          marginRight: "100px",
        }}
      >
        Use the most powerful models in biology, without writing any code.
      </div>
    </>
  );
};

export default HomePage;

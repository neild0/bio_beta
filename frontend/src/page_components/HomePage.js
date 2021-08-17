import React from "react";
import axios from "axios";
import Header from "./Header";
import ModelCard from "./ModelCard";
import { Divider, Row } from "antd";
import "../themes/homepage-theme.css";

const HomePage = (props) => {
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
        
      <div className="title-text" style={{marginLeft: "50vw", marginTop:"150px",textAlign:'center', marginRight:'100px'}}>
          Use the most powerful models in biology, without writing any code.
      </div>
    </>
  );
};

export default HomePage;

import { Card, Image } from "antd";
import React from "react";
import "../themes/card-theme.css";

const { Meta } = Card;

class ModelCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      card_pic: props.card_pic,
      model_name: props.model_name,
      creator_icon: props.creator_icon,
      creator: props.creator,
      area: props.area,
      functions: props.functions,
      redirect: props.redirect,
    };
  }

  render() {
    return (
      <a href={`./${this.state.redirect}`}>
        <Card
          style={{
            width: "clamp(350px, 20vw, 350px)",
            height: "clamp(550px, calc(100vh - 290px), 10000px)",
            backgroundColor: "#000000",
            borderRadius: "30px",
            color: "#ffffff",
            boxShadow: "0px 0px 10px 10px rgba(208, 216, 243, 0.6)",
            marginRight: "50px",
          }}
          href="./AlphaFold"
          cover={
            <img
              src={this.state.card_pic}
              height="300vh"
              style={{ objectFit: "contain" }}
            />
          }
          hoverable={true}
        >
          <Meta
            title={this.state.model_name}
            description={
              <>
                {" "}
                <Image
                  width={25}
                  src={this.state.creator_icon}
                  preview={false}
                  style={{
                    top: "50%",
                    position: "absolute",
                    msTransform: "translateY(-50%)",
                    transform: "translateY(-50%",
                  }}
                />
                <div
                  style={{
                    marginLeft: 30,
                    fontSize: "medium",
                    marginTop: -18.5,
                  }}
                >
                  {" "}
                  @{this.state.creator}{" "}
                </div>
                <span
                  style={{ position: "absolute", marginTop: 35, marginLeft: 5 }}
                >
                  <h1 style={{ color: "white", fontWeight: 800, fontSize: 18 }}>
                    Area
                  </h1>
                </span>
                <span
                  style={{ position: "absolute", marginTop: 70, marginLeft: 5 }}
                  className="area-gradient-text"
                >
                  <h1 style={{ fontWeight: 800, fontSize: 18 }}>
                    {this.state.area}
                  </h1>
                </span>
                <span
                  style={{
                    position: "absolute",
                    marginTop: 35,
                    marginLeft: 160,
                  }}
                >
                  <h1 style={{ color: "white", fontWeight: 800, fontSize: 18 }}>
                    Function
                  </h1>
                </span>
                <span
                  style={{
                    position: "absolute",
                    marginTop: 70,
                    marginLeft: 160,
                    marginRight: 5,
                  }}
                  className="func-gradient-text"
                >
                  <h1 style={{ color: "white", fontWeight: 800, fontSize: 15 }}>
                    {this.state.functions}
                  </h1>
                </span>
              </>
            }
            style={{ backgroundColor: "#ffffff" }}
          />
        </Card>
      </a>
    );
  }
}

export default ModelCard;

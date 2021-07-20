import { Card, Image } from "antd";
import React from "react";
import HomePage from "./HomePage";
const { Meta } = Card;
class ModelCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      card_pic: props.card_pic,
      model_name: props.model_name,
      creator_icon: props.creator_icon,
      creator: props.creator,
    };
  }

  render() {
    return (
        <a href="./AlphaFold">
      <Card
        style={{
          width: "20vw",
            height: "65vh",
          backgroundColor: "#000000",
          borderRadius: "30px",
          marginTop: "150px",
          color: "#ffffff",
            boxShadow: "0px 4px 15px 3px rgba(208, 216, 243, 0.6)",
        }}
        href="./AlphaFold"
        cover={
          <img
            src={this.state.card_pic}
            height="400vh"
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
              <Image width={25} src={this.state.creator_icon} preview={false} style={{top:"50%", position:"absolute",msTransform:"translateY(-50%)", transform:"translateY(-50%"}}/>
                <div style={{marginLeft:30, fontSize:"medium", marginTop:-18.5}}> @{this.state.creator}{" "}</div>
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

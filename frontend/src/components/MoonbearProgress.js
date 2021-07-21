import {Card, Image, Progress} from "antd";
import React from "react";
import TrendingModels from "./HomePage";
import StomIcon from "./stom_icon";
const { Meta } = Card;
//TODO: Implement Hooks, add/center text to progress
class MoonbearProgress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: props.progress,
        };
    }

    render() {
        return (
            <Progress
                strokeColor={{
                    from: "#FFA3BE",
                    to: "#FFBD81",
                }}
                format={(percent) => (
                    <StomIcon spin style={{ fontSize: "12px" }} />
                )}
                style={{ width: "100%" }}
                percent={this.state.progress}
                status="active"
                showInfo={true}
                strokeWidth="50px"
            />
        );
    }
}

export default MoonbearProgress;

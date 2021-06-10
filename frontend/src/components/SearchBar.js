import {SearchBar, Button, WhiteSpace, WingBlank} from "antd-mobile";
import React from "react";
import {css, jsx} from "@emotion/react";
import {IconName} from "react-icons/ai";

class SearchBarExample extends React.Component {
    state = {};

    componentDidMount() {
        this.autoFocusInst.focus();
    }

    onChange = (value) => {
        this.setState({value});
    };
    clear = () => {
        this.setState({value: ""});
    };
    handleClick = () => {
        this.manualFocusInst.focus();
    };

    render() {
        return (
            <div>
                <WingBlank>
                    <div className="sub-title"></div>
                </WingBlank>
                <WhiteSpace/>
                <WingBlank></WingBlank>
                <SearchBar ref={(ref) => (this.autoFocusInst = ref)}/>
                <WhiteSpace/>
                <WingBlank>
                    <div className="sub-title"></div>
                </WingBlank>

                <WhiteSpace/>
                <WingBlank></WingBlank>
                <WhiteSpace/>
                <WingBlank>
                    <div className="sub-title"></div>
                </WingBlank>
                <SearchBar
                    value={this.state.value}
                    placeholder="Search"
                    onSubmit={(value) => console.log(value, "onSubmit")}
                    onClear={(value) => console.log(value, "onClear")}
                    onFocus={() => console.log("onFocus")}
                    onBlur={() => console.log("onBlur")}
                    onChange={this.onChange}
                />
            </div>
        );
    }
}

export default SearchBarExample;

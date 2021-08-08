import React from "react";
import { Col, Divider, Input, Row, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../themes/header-theme.css";

class Header extends React.Component {
  render() {
    return (
      <>
        <Row align="top" justify="space-between">
          <Col flex={"200px"} style={{ marginLeft: 30, marginTop: 30 }}>
            <a href={"./"}>
              <span
                className="gradient-shift-text"
                style={{
                  fontWeight: 1000,
                  fontSize: 40,
                }}
              >
                Moonbear
              </span>
            </a>
          </Col>
          <Col
            style={{ marginLeft: 30, marginRight: 30 }}
            xl={9}
            sm={11}
            xs={0}
          >
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search Moonbear..."
              style={{
                borderRadius: "30px",
                fontSize: 30,
                marginTop: 35,
                backgroundColor: "#EEEEEE",
                color: "#9E9C9B",
                boxShadow: "0px 4px 15px 3px rgba(208, 216, 243, 0.6)",
                fontWeight: 1000,
              }}
            />
          </Col>
          <Col
            // span={10}
            style={{ marginTop: 45, marginLeft: 60, marginRight: 45 }}
            xl={7}
            xs={0}
          >
            <span
              style={{
                fontWeight: 1000,
                fontSize: 20,
                justifyContent: "space-between",
                alignItems: "center",
                display: "flex",
              }}
            >
              <Tooltip title="Under Development!">Model Hub</Tooltip>
              <Tooltip title="Under Development!">Datasets</Tooltip>
              <Tooltip title="Under Development!">Your Notebook</Tooltip>
            </span>
          </Col>
        </Row>
        <Divider style={{ borderColor: "#D9D7D7" }} />
      </>
    );
  }
}

export default Header;

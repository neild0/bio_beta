import React from "react";
import { Col, Divider, Input, Row, AutoComplete, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../themes/header-theme.css";

class Header extends React.Component {
  render() {
    return (
      <>
        <Row gutter={10} offset={80} align="top" justify="space-between">
          <Col span={4}>
            <a href={"./"}>
              <span
                className="gradient-shift-text"
                style={{
                  position: "absolute",
                  fontWeight: 1000,
                  fontSize: 40,
                  marginLeft: 30,
                  marginTop: 30,
                }}
              >
                Moonbear
              </span>
            </a>
          </Col>
          <Col span={8}>
            <Input
              className="aaaa"
              prefix={<SearchOutlined />}
              placeholder="Search Moonbear..."
              style={{
                borderRadius: "30px",
                position: "relative",
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
            span={10}
            style={{ marginTop: 45, marginLeft: 60, marginRight: 45 }}
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

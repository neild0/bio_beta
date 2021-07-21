import React from "react";
import { Text, StyleSheet } from "react-native";
import axios from "axios";
import { Row, Col, Space, Input, TextArea, Button, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./my-theme.css";

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
          <Col span={0.1} />
          <Col span={3}>
            <span
              style={{
                position: "absolute",
                fontWeight: 1000,
                fontSize: 20,
                marginTop: 45,
                textAlign: "center",
              }}
            >
              Model Hub
            </span>
          </Col>
          <Col span={3}>
            <span
              style={{
                position: "absolute",
                fontWeight: 1000,
                fontSize: 20,
                marginTop: 45,
              }}
            >
              Datasets
            </span>
          </Col>
          <Col span={3}>
            <span
              style={{
                position: "absolute",
                fontWeight: 1000,
                fontSize: 20,
                marginTop: 45,
              }}
            >
              Your Notebook
            </span>
          </Col>
        </Row>
        <Divider style={{ borderColor: "#D9D7D7" }} />
      </>
    );
  }
}

export default Header;

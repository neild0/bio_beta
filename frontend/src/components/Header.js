import React from "react";
import { Text, StyleSheet } from 'react-native';
import axios from "axios";
import { Row, Col, Space, Input, TextArea } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

class Header extends React.Component {
    render() {
        return (
            <Row gutter={12}>
                <Col span={4}>
                    <span style={{position: "absolute", fontWeight: 1000, fontSize: 40, marginLeft:30, marginTop: 30}}>
                    Moonbear
                    </span>
                </Col>
                <Col span={12}>
                    <Input
                        prefix={ <SearchOutlined />}
                        placeholder="    Search Moonbear..."
                        style={{borderRadius: '30px', position: "absolute", fontSize: 30, marginLeft:50, marginTop: 35, backgroundColor:"#EEEEEE", }}
                    />
                </Col>
            </Row>
        )}
}

export default Header;
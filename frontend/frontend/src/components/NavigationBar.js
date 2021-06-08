/** @jsxRuntime classic */
/** @jsx jsx */
import {Menu} from "antd";
import {
    MailOutlined,
    AppstoreOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import React, {useState} from "react";
import {css, jsx} from "@emotion/react";

const {SubMenu} = Menu;

function NavigationBar() {
    const [current, setCurrent] = useState("mail");
    const abcd = () => {
        setCurrent("app");
    };
    return (
        <Menu onClick={abcd} selectedKeys={[current]} mode="horizontal">
            <Menu.Item>
        <span
            css={css`
            font-size: 20px;
            padding-left: 80px;
            color: #776f6f;
            padding-right: 80px;
          `}
        >
          Notebook ✨
        </span>
                <a href="http://localhost:3000/login"></a>
            </Menu.Item>
            <Menu.Item>
        <span
            css={css`
            font-size: 20px;
            padding-left: 80px;
            color: #776f6f;
            padding-right: 80px;
          `}
        >
          Dataset 🔎
        </span>

                <a href="http://localhost:3000/pathology"></a>
            </Menu.Item>
            <Menu.Item>
        <span
            css={css`
            font-size: 20px;
            padding-left: 80px;
            color: #776f6f;
            padding-right: 80px;
          `}
        >
          ML Models 🦄
        </span>

                <a href="http://localhost:3000/models"></a>
            </Menu.Item>

            <Menu.Item>
        <span
            css={css`
            font-size: 20px;
            padding-left: 80px;
            color: #776f6f;
            padding-right: 80px;
          `}
        >
          Results 🔬
        </span>
                <a href="http://localhost:3000/results"></a>

                {/* <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
          
        </a> */}
            </Menu.Item>
        </Menu>
    );
}

export default NavigationBar;

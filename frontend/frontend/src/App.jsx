/** @jsxRuntime classic */
/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import logo from "./unicorn.png";
import "./App.css";
import React from "react";
import { Button, Menu } from "antd";
//import NavigationBar from './components/NavigationBar'
import Upload from "./components/Upload";

const buttonCss = css`
  position: absolute;
  right: 30px;
  bottom: 30px;
`;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Upload></Upload>
        {/* <NavigationBar></NavigationBar> */}
        <img src={logo} className="App-logo" alt="logo" />
        <h1> Welcome to Unicorn! </h1>
        <p>we're so happy you're here🦄✨</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        ></a>
      </header>
      <Button type="primary" css={buttonCss}>
        Button
      </Button>
    </div>
  );
}

export default App;

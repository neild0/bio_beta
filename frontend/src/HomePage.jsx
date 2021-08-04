/** @jsxRuntime classic */
/** @jsx jsx */
// import logo from "./unicorn.png";
import "./App.css";
import React from "react";
import { history } from "./routes";
import { withRouter } from "react-router-dom";
import TrendingModels from "./page_components/HomePage";

// const buttonCss = css`
//   color: pink;
//   position: absolute;
//   right: 30px;
//   bottom: 30px;
// `;

function Home() {
  const navigateToLoginPage = () => {
    history.push("/login");
  };

  return (
    <TrendingModels />
    // <div className="App">
    //     <header className="App-header">
    //         <img src={logo} className="App-logo" alt="logo"/>
    //         <h1> Welcome to Unicorn! </h1>
    //         <p>we're so happy you're here🦄✨</p>
    //         <a
    //             className="App-link"
    //             href="https://reactjs.org"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //         ></a>
    //     </header>
    //     <Button css={buttonCss} onClick={navigateToLoginPage}>
    //         enter
    //     </Button>
    // </div>
  );
}

export default withRouter(Home);

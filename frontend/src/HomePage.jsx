/** @jsxRuntime classic */
/** @jsx jsx */
// import logo from "./unicorn.png";
import "./App.css";
import React from "react";
import { history } from "./routes";
import { withRouter } from "react-router-dom";
import TrendingModels from "./pages/HomePage";

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

  return <TrendingModels />;
}

export default withRouter(Home);

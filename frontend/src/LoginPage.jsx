/** @jsxRuntime classic */
/** @jsx jsx */
import {css, jsx} from "@emotion/react";
import "./App.css";
import React from "react";
import {Button} from "antd";
import pathologyLogo from "./pathology.png";
import omicsLogo from "./omics.png";
import ddLogo from "./dd.png";
import unicornLogo from "./unicorn.png";
import uploadLogo from "./uploadData.png";
import {history} from "./routes";
import Upload from "./components/UploadButton";
import kennyLogo from "./kenny.png";
import NavigationBar from "./components/NavigationBar";
import SearchBar from "./components/SearchBar";
//import HeaderSearch from "./components/HeaderSearch";

const backgroundContainerCss = css`
  background: #fffaf5;
  height: 65vh;
  width: 100vw;
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

/*const buttonUploadCard = css`
  background-image: url(${uploadLogo});
  border-radius: 25px;
  //filter: brightness(80%);
  //drop-shadow(0px 20px 80px rgba(0, 0, 0, 0.25));
  box-shadow: 5px 5px 10px 4px #ccc;
  background-size: cover;
  height: 282px;
  color: #fffff;
  width: 246px;
  border: none;
  bottom: 30px;
  margin: 0 40px;
  &:hover {
    background-image: url(${uploadLogo});
    background-size: cover;
`;*/

const buttonPathologyCard = css`
  background-image: url(${pathologyLogo});
  border-radius: 25px;
  //filter: brightness(80%);
  //drop-shadow(0px 20px 80px rgba(0, 0, 0, 0.25));
  box-shadow: 5px 5px 10px 4px #ccc;
  background-size: cover;
  height: 282px;
  color: #fffff;
  width: 246px;
  border: none;
  bottom: 30px;
  margin: 0 40px;
  &:hover {
    background-image: url(${pathologyLogo});
    background-size: cover;
  `;

const buttonOmicsCard = css`
  background-image: url(${omicsLogo});
  background-size: cover;
  border-radius: 25px;
  box-shadow: 5px 5px 10px 4px #ccc;
  //filter: brightness(80%);
  height: 282px;
  width: 246px;
  border: none;
  bottom: 30px;
  margin: 0 40px;
  &:hover {
    background-image: url(${omicsLogo});
    background-size: cover;
  }
`;

const buttonDrugDiscoveryCard = css`
  background-image: url(${ddLogo});
  background-size: cover;
  border-radius: 25px;
  box-shadow: 5px 5px 10px 4px #ccc;
  //filter: brightness(80%);
  height: 282px;
  width: 246px;
  border: none;
  bottom: 30px;
  margin: 0 40px;
  &:hover {
    background-image: url(${ddLogo});
    background-size: cover;
  }
`;

/*const titleCss = css`
  color: #fffff;
  `;*/

function Login() {
    const navigateToPathologyPage = () => {
        history.push("/pathology");
    };

    const navigateToProteomicsPage = () => {
        history.push("/proteomics");
    };
    return (
        <div
            css={css`
        background: #fffaf5;
        padding-left: 20px;
        padding-top: 20px;
        padding-bottom: 200px;
      `}
        >
            <a href="/">
                <img src={unicornLogo} width={50}></img>
            </a>
            <a
                css={css`
          padding-left: 1050px;
        `}
            >
                {" "}
                <img src={kennyLogo} width={45}></img>
            </a>
            <a
                css={css`
          font-family: sf pro display;
          padding-left: 10px;
          color: #776f6f;
        `}
            >
                Kenny Workman
            </a>

            {/* <HeaderSearch></HeaderSearch>
      {""} */}

            <div
                css={css`
          font-family: sf pro display;
          font-size: 34px;
          margin: 10px 10px 25px 40px;
          //padding-left: 100px;
          font-family: 'Open Sans', sans-serif;
        `}
            >
                <h
                    css={css`
            padding-bottom: 20px;
            padding-left: 16px;
            font-family: 'Open Sans', sans-serif;
          `}
                >
                    {" "}
                    🔬Your workspace
                </h>
                <NavigationBar
                    css={css`
            padding-top: 20px;
            padding-left: 20px;
          `}
                ></NavigationBar>
                {""}
            </div>
            {/* <div
        css={css`
          padding-left: 1150px;
        `}
      >
        <SearchBar></SearchBar> {""}
      </div> */}

            <div css={backgroundContainerCss}>
                {/* <NavigationBar></NavigationBar> */}
                {/* <Button css={buttonUploadCard}>
          <h1
            css={css`
              color: white;
              height: 50px;
              padding-top: 20px;
            `}
          ></h1>
        </Button> */}
                <h1
                    css={css`
            padding-bottom: 300px;
            padding-top: 300px;
            padding-right: 80px;
          `}
                >
                    <Upload></Upload>{" "}
                </h1>
                <Button css={buttonPathologyCard} onClick={navigateToPathologyPage}>
                    &nbsp;
                    <h1
                        css={css`
              color: white;
              height: 50px;
              padding-top: 20px;
            `}
                    >
                        {" "}
                        pathology
                    </h1>
                    <h2
                        css={css`
              color: white;
              font-family: sf pro display;
              padding-top: 20px;
              font-family: 'Open Sans', sans-serif;
            `}
                    >
                        🏷️ image
                    </h2>
                    {/* using sf symbols might be an issue later* */}
                </Button>
                <Button css={buttonOmicsCard} onClick={navigateToProteomicsPage}>
                    &nbsp;
                    <h1
                        css={css`
              color: white;
              height: 50px;
              padding-top: 20px;
              font-family: 'Open Sans', sans-serif;
            `}
                    >
                        {" "}
                        omics
                    </h1>
                    <h2
                        css={css`
              color: white;
              font-family: sf pro display;
              padding-top: 20px;
              font-family: 'Open Sans', sans-serif;
            `}
                    >
                        🏷️ tabular data
                    </h2>
                </Button>
                <Button css={buttonDrugDiscoveryCard}>
                    &nbsp;
                    <h1
                        css={css`
              color: white;
              height: 50px;
              padding-top: 20px;
              font-family: 'Open Sans', sans-serif;
            `}
                    >
                        {" "}
                        drug discovery
                    </h1>
                    <h2
                        css={css`
              color: white;
              font-family: sf pro display;
              padding-top: 20px;
              font-family: 'Open Sans', sans-serif;
            `}
                    >
                        🏷️ tabular data
                    </h2>
                </Button>

                {/* <Button css={buttonCss}>Text</Button> */}
            </div>
        </div>
    );
}

export default Login;

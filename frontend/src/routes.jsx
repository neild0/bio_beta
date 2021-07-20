import React from "react";
import {
  Router,
  Switch,
  Route,
  Redirect,
  BrowserRouter,
} from "react-router-dom";
import HomePage from "./HomePage";
import axios from "axios";

import LoginPage from "./LoginPage";
import PathologyPage from "./PathologyPage";
import ProteomicsPage from "./ProteomicsPage";
import MLModelsPage from "./MLModelsPage";
import ResultsPage from "./ResultsPage";
import ProteinResultsPage from "./ProteinResultsPage";
import GenomicsPage from "./GenomicsPage";
import GeneResultsPage from "./GeneResultsPage";

import { createBrowserHistory } from "history";
import ModelCard from "./components/modelCard";
import ModelSandbox from "./components/modelSandbox";
import Viztein from "viztein";

export const history = createBrowserHistory();
let modelPages = [];
const serv = 'http://18.223.172.249'

function Routes() {
  axios
    .get(`${serv}:3333/api/get_model_data`)
    .then((res) => {
      modelPages = res.data;
    })
    .catch((err) => {});
  const DynamicRoutes = () => {
    return modelPages.map((item, index) => {
      return (
        <Route
          exact
          key={index}
          path="/AlphaFoldLite"
          component={() => (
            <ModelSandbox
              model="aaaaaaaaa"
              info="aaaaa"
              sandbox="protein_vis"
            />
          )}
        />
      );
    });
  };
  return (
    <BrowserRouter history={history}>
      <Switch>
        {/*<Route exact path="/login" component={LoginPage}/>*/}
        <Route exact path="/" component={HomePage} />
        <Route exact path="/AlphaFoldLite" component={() => (<ModelSandbox
            model="AlphaFold Lite"
            info={null}
            sandbox="protein_vis"
        />)}/>

        {/*<Route exact path="/pathology" component={PathologyPage}/>*/}
        {/*<Route exact path="/proteomics" component={ProteomicsPage}/>*/}
        {/*<Route exact path="/genomics" component={GenomicsPage}/>*/}
        {/*<Route exact path="/models" component={MLModelsPage}/>*/}
        {/*<Route exact path="/results" component={ResultsPage}/>*/}
        {/*<Route exact path="/protein_results" component={ProteinResultsPage}/>*/}
        {/*<Route exact path="/gene_results" component={GeneResultsPage}/>*/}
          <Redirect from='*' to="/" />

          <Routes/>
      </Switch>
    </BrowserRouter>
  );
}

export default Routes;

import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import PathologyPage from "./PathologyPage";
import MLModelsPage from "./MLModelsPage";
import ResultsPage from "./ResultsPage";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

export default function Routes() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/" component={HomePage} />
        <Route exact path="/pathology" component={PathologyPage} />
        <Route exact path="/models" component={MLModelsPage} />
        <Route exact path="/results" component={ResultsPage} />
      </Switch>
    </Router>
  );
}

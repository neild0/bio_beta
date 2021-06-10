import React from "react";
import {Router, Switch, Route} from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import PathologyPage from "./PathologyPage";
import ProteomicsPage from "./ProteomicsPage";
import MLModelsPage from "./MLModelsPage";
import ResultsPage from "./ResultsPage";
import ProteinResultsPage from "./ProteinResultsPage";
import {createBrowserHistory} from "history";

export const history = createBrowserHistory();

export default function Routes() {
    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/login" component={LoginPage}/>
                <Route exact path="/" component={HomePage}/>
                <Route exact path="/pathology" component={PathologyPage}/>
                <Route exact path="/proteomics" component={ProteomicsPage}/>
                <Route exact path="/models" component={MLModelsPage}/>
                <Route exact path="/results" component={ResultsPage}/>
                <Route exact path="/protein_results" component={ProteinResultsPage}/>
            </Switch>
        </Router>
    );
}

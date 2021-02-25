import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { ManagerProvider } from "./manager.context";
import QueryExplorer from './QueryExplorer';

type AppProps = {}

function App(props: AppProps) {
  return (
    <ManagerProvider>
      <Router>
        <Switch>
          <Route exact path="/">
            <QueryExplorer />
          </Route>
          <Route exact path="/query/:namespace/:queryName/:revision?">
            <QueryExplorer />
          </Route>
        </Switch>
      </Router>
    </ManagerProvider>
  );
}

export default App;

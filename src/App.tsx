import {useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { ManagerProvider, initializeManager, useManagerDispatch, useManagerState } from "./manager.context";
import QueryExplorer from './QueryExplorer';
import ResourceEditor from "./ResourceEditor";

function Scaffold() {
  const managerState = useManagerState();
  const managerDispatch = useManagerDispatch();
  useEffect(() => {
    initializeManager(managerDispatch);
  }, []);

    
  if (managerState.status !== 'completed') {
    return <p>Loading...</p>
  }

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <QueryExplorer />
        </Route>
        <Route path="/query/:namespace/:queryName/:revision?">
          <QueryExplorer />
        </Route>
        <Route patch="/resources">
          <ResourceEditor />
        </Route>
      </Switch>
    </Router>
  )
}

function App() {
  return (
    <ManagerProvider>
      <Scaffold />
    </ManagerProvider>
  );
}

export default App;

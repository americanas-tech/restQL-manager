import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import QueryExplorer from './QueryExplorer';

type AppProps = {}

function App(props: AppProps) {
  return (
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
  );
}

export default App;

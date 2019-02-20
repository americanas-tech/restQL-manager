import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import QueryEditorScreen from './components/query/QueryEditorScreen';
import ResourcesEditorScreen from './components/resources/ResourcesEditorScreen';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

const store = require('./store/storeConfig').store;

window.store = store;

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Route path="/" exact={true} component={QueryEditorScreen} />
            <Route path="/query/:namespace/:queryName/:revision?" component={QueryEditorScreen}/>
            <Route path="/resources-editor" exact={true} component={ResourcesEditorScreen} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;

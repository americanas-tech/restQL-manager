/**
 * Every action related to the query components
 * is centralized here.
 */

// Redux actions
import { QUERY_ACTIONS } from "../reducers/queryReducer";
import { SIDEBAR_ACTIONS } from "../reducers/sidebarReducer"

// API Calls and processing dependencies
import {
  loadNamespaces,
  loadQueries,
  loadRevisions,
  loadRevision,
  loadRevisionByUrl,
  runQuery,
  saveQuery
} from "../api/restQLAPI";

const store = require("../store/storeConfig").store;

// UI State manipulation
export function handleNewQuery() {
  store.dispatch({
    type: QUERY_ACTIONS.INITIAL_STATE,
  });

  store.dispatch({
    type: SIDEBAR_ACTIONS.INITIAL_STATE,
  });

  handleLoadNamespaces();
}

export function handleShowModal() {
  store.dispatch({
    type: QUERY_ACTIONS.TOGGLE_SAVE_MODAL
  });
}

export function handleToggleSidebar() {
  store.dispatch({
    type: QUERY_ACTIONS.TOGGLE_SIDEBAR
  });
}

// Listeners
export function handleNamespaceChange(evt) {
  store.dispatch({
    type: QUERY_ACTIONS.NAMESPACE_CHANGED,
    value: evt.target.value
  });
}

export function handleQueryNameChange(evt) {
  store.dispatch({
    type: QUERY_ACTIONS.QUERY_NAME_CHANGED,
    value: evt.target.value
  });
}

export function handleQueryStringChange(text) {
  store.dispatch({
    type: QUERY_ACTIONS.READ_QUERY,
    value: text
  });
}

export function handleParamsChange(evt) {
  store.dispatch({
    type: QUERY_ACTIONS.READ_QUERY_PARAMS,
    value: evt.target.value
  });
}

// Async API Calls
export function handleRunQuery() {
  const dispatch = store.dispatch;
  const { query, queryParams } = store.getState().queryReducer;
  const { tenant } = store.getState().environmentReducer;

  dispatch({
    type: QUERY_ACTIONS.RUNNING_QUERY
  });

  runQuery(query, queryParams, tenant, (result, error) => {
    if (error) {
      let processedString = JSON.stringify(error, null, 2);

      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: processedString
      });
    } else {
      let processedString = JSON.stringify(result, null, 2);

      dispatch({
        type: QUERY_ACTIONS.QUERY_SUCCESS,
        value: processedString
      });
    }
  });
}

export function handleSaveQuery() {
  const dispatch = store.dispatch;
  const { namespace, queryName, query } = store.getState().queryReducer;
  const { tenant } = store.getState().environmentReducer;

  dispatch({
    type: QUERY_ACTIONS.SAVING_QUERY
  });

  if (
    namespace.trim() === "" ||
    queryName.trim() === "" ||
    query.trim() === ""
  ) {
    const error = { error: "Namespace, Query Name and Query can't be empty!" };

    return dispatch({
      type: QUERY_ACTIONS.QUERY_ERROR,
      value: JSON.stringify(error, null, 2)
    });
  }

  saveQuery(tenant, namespace, queryName, query, (result, error) => {
    if (error) {
      let processedString = JSON.stringify(error, null, 2);

      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: processedString
      });
    } else {
      let processedString = JSON.stringify(result, null, 2);

      dispatch({
        type: QUERY_ACTIONS.QUERY_SAVED,
        value: processedString
      });

      dispatch({
        type: QUERY_ACTIONS.LOAD_REVISIONS
      });

      handleLoadNamespaces();
    }
  });
}

export function handleLoadNamespaces() {
  const dispatch = store.dispatch;

  dispatch({ type: QUERY_ACTIONS.NAMESPACES_LOADING });

  loadNamespaces((response, error) => {
    if (error) {
      dispatch({ type: QUERY_ACTIONS.NAMESPACES_LOADED, value: [] });
      alert("Error loading namespaces: " + error);
    } else {
      dispatch({ type: QUERY_ACTIONS.NAMESPACES_LOADED, value: response });
    }
  });
}

export function handleLoadRevisions() {
  const dispatch = store.dispatch;

  const { namespace, queryName } = store.getState().queryReducer;

  dispatch({ type: QUERY_ACTIONS.REVISIONS_LOADING });

  loadRevisions(namespace, queryName, (response, error) => {
    if (error) {
      dispatch({
        type: QUERY_ACTIONS.REVISIONS_LOADED,
        value: []
      });
    } else {
      dispatch({
        type: QUERY_ACTIONS.REVISIONS_LOADED,
        value: response.revisions
      });
    }
  });
}

export const handleRedirectToQuery = navigation => evt => {  
  const revision = evt.target.value

  const { namespace, queryName } = store.getState().queryReducer;

  let path = `/query/${namespace}/${queryName}/${revision}`

  return navigation.push(path)
}

export function handleLoadQueryFromURL({ namespace, queryName, revision }) {
  const dispatch = store.dispatch;

  dispatch({ type: QUERY_ACTIONS.QUERY_LOADING });

  loadRevision(namespace, queryName, revision, (response, error) => {
    if (error) {
      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: error
      });
    } else {
      dispatch({
        type: QUERY_ACTIONS.QUERY_LOADED,
        namespace: namespace,
        queryName: queryName,
        revision: revision,
        value: response
      });
      dispatch({ type: QUERY_ACTIONS.LOAD_REVISIONS })
    }
  });
}

export function handleLoadQueries(namespace) {
  const dispatch = store.dispatch;

  dispatch({
    type: QUERY_ACTIONS.QUERIES_LOADING,
    value: namespace
  });

  loadQueries(namespace, (response, error) => {
    if (error) {
      dispatch({ type: QUERY_ACTIONS.QUERIES_LOADED, value: [] });
      alert("Error loading queries: " + error);
    } else {
      dispatch({
        type: QUERY_ACTIONS.QUERIES_LOADED,
        value: response.queries
      });
    }
  });
}

export function handleLoadQuery(query) {
  const dispatch = store.dispatch;

  dispatch({
    type: QUERY_ACTIONS.QUERY_LOADING
  });

  loadRevisionByUrl(query["last-revision"], (response, error) => {
    if (error) {
      dispatch({
        type: QUERY_ACTIONS.QUERY_ERROR,
        value: error
      });
    } else {
      dispatch({
        type: QUERY_ACTIONS.QUERY_LOADED,
        queryName: query.id,
        value: response
      });

      dispatch({
        type: QUERY_ACTIONS.LOAD_REVISIONS
      });
    }
  });
}

// Redux actions
import { SIDEBAR_ACTIONS } from "../reducers/sidebarReducer";
import { loadQueries, loadRevisionByUrl } from "../api/restQLAPI";

const store = require("../store/storeConfig").store;

export function handleSidebarLoadQueries(namespace) {
  const dispatch = store.dispatch;

  dispatch({
    type: SIDEBAR_ACTIONS.QUERIES_LOADING,
    value: namespace
  });

  loadQueries(namespace, (response, error) => {
    if (error) {
      dispatch({ type: SIDEBAR_ACTIONS.QUERIES_LOADED, value: [] });
      alert("Error loading queries: " + error);
    } else {
      dispatch({
        type: SIDEBAR_ACTIONS.QUERIES_LOADED,
        value:
          (response.queries &&
            response.queries.sort(function(a, b) {
              return a.id.toLowerCase().localeCompare(b.id.toLowerCase());
            })) ||
          []
      });
    }
  });
}

export function handleSidebarLoadQuery(query) {
  const dispatch = store.dispatch;

  dispatch({
    type: SIDEBAR_ACTIONS.QUERY_LOADING
  });

  loadRevisionByUrl(query["last-revision"], (response, error) => {
    if (error) {
      dispatch({
        type: SIDEBAR_ACTIONS.QUERY_ERROR,
        value: error
      });
    } else {
      dispatch({
        type: SIDEBAR_ACTIONS.QUERY_LOADED,
        queryName: query.id,
        value: response
      });

      dispatch({
        type: SIDEBAR_ACTIONS.LOAD_REVISIONS
      });
    }
  });
}

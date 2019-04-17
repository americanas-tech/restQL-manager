export const initialState = {
    namespace: "",
    queryName: "",
    revision: null,
  };

export const SIDEBAR_ACTIONS = {
  INITIAL_STATE: "SIDEBAR_INITIAL_STATE",

  QUERIES_LOADING: "SIDEBAR_QUERIES_LOADING",
  QUERIES_LOADED: "SIDEBAR_QUERIES_LOADED",
  QUERY_LOADING: "SIDEBAR_QUERY_LOADING",
  QUERY_LOADED: "SIDEBAR_QUERY_LOADED"

  };

  const sidebarReducer = (state = initialState, action) => {
    switch (action.type) {
      case SIDEBAR_ACTIONS.QUERIES_LOADING:
        return {
          ...initialState,
          loadingQueries: true,
          namespace: action.value
        };
      case SIDEBAR_ACTIONS.QUERIES_LOADED:
        return { ...state, loadingQueries: false, queries: action.value };
      case SIDEBAR_ACTIONS.QUERY_LOADING:
        return { ...state, query: "", queryResult: "", running: true };
      case SIDEBAR_ACTIONS.QUERY_LOADED:
        return {
            ...state,
            namespace: action.namespace,
            queryName: action.queryName,
            revision: action.revision,
            query: action.value,
            running: false,
            showSidebar: false
        };

      case SIDEBAR_ACTIONS.INITIAL_STATE:
        return initialState;
  
      default:
        return state;
    }
}

export default sidebarReducer;

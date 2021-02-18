import { createContext, ReactNode, useContext, useReducer } from "react";
import { Query } from "./queries";
import { fetchNamespaces, fetchQueriesFromNamespace, fetchTenants } from "../api";

type ExplorerState = {
  tenants: string[],
  namespaces: string[],
  queries: Record<string, Query[]>,
  selections: {
    namespace: string,
    query: Query | null,
  }
}

const initialState: ExplorerState = {
  tenants: [],
  namespaces: [],
  queries: {},
  selections: {
    namespace: "",
    query: null,
  },
}

type ExplorerAction = 
  {type: 'set_tenants', tenants: string[]}
  | {type: 'set_namespaces', namespaces: string[]}
  | {type: 'set_queries', queries: Record<string, Query[]>}

type Dispatch = React.Dispatch<ExplorerAction>;

const QueryExplorerStateContext = createContext<ExplorerState | null>(null);
const QueryExplorerDispatchContext = createContext<Dispatch | null>(null);

function queryExplorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case "set_tenants":
      return {...state, tenants: action.tenants};
    case 'set_queries':
      return {...state, queries: action.queries};
    case "set_namespaces":
      return {...state, tenants: action.namespaces};
    default:
      return state;
  }
}


export function QueryExplorerProvider(props: {children: ReactNode}) {
  const [state, dispatch] = useReducer(queryExplorerReducer, initialState);

  return (
      <QueryExplorerDispatchContext.Provider value={dispatch}>
        <QueryExplorerStateContext.Provider value={state}>
            {props.children}
        </QueryExplorerStateContext.Provider>
      </QueryExplorerDispatchContext.Provider>
  )
}

export function useQueryExplorerState(): ExplorerState {
  const context = useContext(QueryExplorerStateContext);
  if (context === null) {
    throw new Error('useQueryExploreerState must be used within a QueryExplorerProvider')
  }
  return context;
}

export function useQueryExplorerDispatch(): Dispatch {
  const context = useContext(QueryExplorerDispatchContext);
  if (context === null) {
    throw new Error('useQueryExploreerDispatch must be used within a QueryExplorerProvider')
  }
  return context
}

export async function initializeExplorer(dispatch: Dispatch) {
  const tenants = await fetchTenants();
  dispatch({type: "set_tenants", tenants: tenants});

  const namespaces = await fetchNamespaces();
  const queriesForNamespace = await Promise.all(namespaces.map(n => fetchQueriesFromNamespace(n)))
  
  const queriesByNamespace: Record<string, Query[]> = {};
  for (const namespaceQueries of queriesForNamespace) {
    queriesByNamespace[namespaceQueries.namespace] = namespaceQueries.queries;
  }

  dispatch({type: "set_queries", queries: queriesByNamespace});
}
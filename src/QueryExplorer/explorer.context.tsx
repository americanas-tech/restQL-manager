import { createContext, ReactNode, useContext, useReducer } from "react";
import { Query, QueryRevision } from "./queries";
import { fetchNamespaces, fetchQueriesFromNamespace, fetchTenants } from "../api";

export type ExplorerState = {
  status: "initial" | "loading" | "completed" | "error",
  tenants: string[],
  namespaces: string[],
  queries: Record<string, Query[]>,
  selectedQuery: QueryRevision | null,
}

const initialState: ExplorerState = {
  status: "initial",
  tenants: [],
  namespaces: [],
  queries: {},
  selectedQuery: null,
}

type ExplorerAction = 
  {type: 'set_tenants', tenants: string[]}
  | {type: 'set_namespaces', namespaces: string[]}
  | {type: 'set_queries', queries: Record<string, Query[]>}
  | {type: 'select_query', queryRevision: QueryRevision}
  | {type: 'initialization_started'}
  | {type: 'initialization_completed', queries: Record<string, Query[]>, tenants: string[]}

  
type Dispatch = React.Dispatch<ExplorerAction>;

const QueryExplorerStateContext = createContext<ExplorerState | null>(null);
const QueryExplorerDispatchContext = createContext<Dispatch | null>(null);

function queryExplorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case 'set_tenants':
      return {...state, tenants: action.tenants};
    case 'set_queries':
      return {...state, queries: action.queries};
    case 'set_namespaces':
      return {...state, tenants: action.namespaces};
    case 'select_query':
      return {...state, selectedQuery: action.queryRevision};
    case 'initialization_started':
      return {...state, status: 'loading'};
    case 'initialization_completed':
      return {...state, status: 'completed', tenants: action.tenants, queries: action.queries};
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
  // dispatch({type: "select_query", query: {namespace: "checkout-app-bff", name: "TICKET__cart-summary", revisions: [{text: "from cart", revision: 1}, {text: "from cart", revision: 2}, {text: "from cart", revision: 3}, {text: "from cart", revision: 4}]}});
  const tenants = await fetchTenants();

  dispatch({type: "initialization_started"});

  const namespaces = await fetchNamespaces();
  const queriesForNamespace = await Promise.all(namespaces.map(n => fetchQueriesFromNamespace(n)))
  
  const queriesByNamespace: Record<string, Query[]> = {};
  for (const namespaceQueries of queriesForNamespace) {
    queriesByNamespace[namespaceQueries.namespace] = namespaceQueries.queries;
  }

  dispatch({type: "initialization_completed", tenants: tenants, queries: queriesByNamespace});
}
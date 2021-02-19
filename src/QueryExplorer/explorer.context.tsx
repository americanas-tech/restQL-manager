import { createContext, ReactNode, useContext, useReducer } from "react";
import { Query, QueryRevision } from "./queries";
import { fetchNamespaces, fetchQueriesFromNamespace, fetchTenants } from "../api";

export type ExplorerState = {
  status: "initial" | "loading" | "completed" | "error",
  tenants: string[],
  namespaces: string[],
  queries: Record<string, Query[]>,
  selectedQuery: QueryRevision | null,
  selectedTenant: string,
  queryText: string,
  debug: boolean,
}

const initialState: ExplorerState = {
  status: "initial",
  tenants: [],
  namespaces: [],
  queries: {},
  selectedQuery: null,
  selectedTenant: "",
  queryText: "",
  debug: false,
}

type ExplorerAction = 
  {type: 'initialization_started'}
  | {type: 'set_namespaces', namespaces: string[]}
  | {type: 'initialization_completed', queries: Record<string, Query[]>, tenants: string[]}
  | {type: 'select_query', queryRevision: QueryRevision}
  | {type: 'set_debug', debug: boolean}
  | {type: 'updated_query_text', text: string}
  | {type: 'select_tenant', tenant: string}
  
type Dispatch = React.Dispatch<ExplorerAction>;

const QueryExplorerStateContext = createContext<ExplorerState | null>(null);
const QueryExplorerDispatchContext = createContext<Dispatch | null>(null);

function queryExplorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case 'initialization_started':
      return {...state, status: 'loading'};
    case 'set_namespaces':
      return {...state, tenants: action.namespaces};
    case 'initialization_completed':
      return {
        ...state, 
        status: 'completed', 
        tenants: action.tenants, 
        queries: action.queries,
        selectedTenant: action.tenants[0],
      };
    case 'select_query':
      return {...state, selectedQuery: action.queryRevision, queryText: action.queryRevision.text};
    case 'set_debug':
      return {...state, debug: action.debug};
    case 'updated_query_text':
      return {...state, queryText: action.text};
    case 'select_tenant':
      return {...state, selectedTenant: action.tenant};
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
  dispatch({type: "initialization_started"});

  const tenants = await fetchTenants();
  const namespaces = await fetchNamespaces();
  const queriesForNamespace = await Promise.all(namespaces.map(n => fetchQueriesFromNamespace(n)))
  
  const queriesByNamespace: Record<string, Query[]> = {};
  for (const namespaceQueries of queriesForNamespace) {
    queriesByNamespace[namespaceQueries.namespace] = namespaceQueries.queries;
  }

  dispatch({type: "initialization_completed", tenants: tenants, queries: queriesByNamespace});
}
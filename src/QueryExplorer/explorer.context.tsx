import { createContext, ReactNode, useContext, useReducer } from "react";
import { Query, QueryRevision } from "./queries";
import { fetchNamespaces, fetchQueriesFromNamespace, fetchTenants, runQuery } from "../api";
import { Param } from "./parameters";

export type ExplorerState = {
  status: "initial" | "loading" | "completed" | "error",
  tenants: string[],
  namespaces: string[],
  queries: Record<string, Query[]>,
  selectedQuery: QueryRevision | null,
  selectedTenant: string,
  currentQueryText: string,
  debug: boolean,
  queryResult: {
    status: 'stale' | 'running',
    json: any,
  },
}

const initialState: ExplorerState = {
  status: "initial",
  tenants: [],
  namespaces: [],
  queries: {},
  selectedQuery: null,
  selectedTenant: "",
  currentQueryText: "",
  debug: false,
  queryResult: {
    status: 'stale',
    json: {},
  },
}

type ExplorerAction = 
  {type: 'initialization_started'}
  | {type: 'set_namespaces', namespaces: string[]}
  | {type: 'initialization_completed', queries: Record<string, Query[]>, tenants: string[]}
  | {type: 'select_query', queryRevision: QueryRevision}
  | {type: 'set_debug', debug: boolean}
  | {type: 'updated_query_text', text: string}
  | {type: 'select_tenant', tenant: string}
  | {type: 'query_execution_started'}
  | {type: 'query_execution_finished', result: any}
  
type Dispatch = React.Dispatch<ExplorerAction>;

const QueryExplorerStateContext = createContext<ExplorerState | null>(null);
const QueryExplorerDispatchContext = createContext<Dispatch | null>(null);

function queryExplorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case 'initialization_started':
      return {...state, status: 'loading'};
    case 'set_namespaces':
      return {...state, namespaces: action.namespaces.sort()};
    case 'initialization_completed':
      return {
        ...state, 
        status: 'completed', 
        tenants: action.tenants.sort(), 
        queries: action.queries,
        selectedTenant: action.tenants[0],
      };
    case 'select_query':
      return {...state, selectedQuery: action.queryRevision, currentQueryText: action.queryRevision.text};
    case 'set_debug':
      return {...state, debug: action.debug};
    case 'updated_query_text':
      return {...state, currentQueryText: action.text};
    case 'select_tenant':
      return {...state, selectedTenant: action.tenant};
    case 'query_execution_started':
      return {...state, queryResult: {...state.queryResult, status: 'running'}};
    case 'query_execution_finished':
      return {...state, queryResult: {
        status: 'stale',
        json: action.result,
      }};
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

export async function runExplorerQuery(dispatch: Dispatch, state: ExplorerState, params: Param[]): Promise<void> {
  dispatch({type:'query_execution_started'});

  const inputParams = params
    .filter(p => p.enabled)
    .reduce((queryParams: Record<string, any>, p: Param) => {
      if (p.key in queryParams) {
        const listParam = [queryParams[p.key], p.value].flatMap(x => x);
        return {...queryParams, [p.key]: listParam};
      }

      return {...queryParams, [p.key]: p.value};
    }, {});

  const queryParams = {...inputParams, tenant: state.selectedTenant, "_debug": state.debug};
  const queryText = state.currentQueryText;

  const result = await runQuery(queryText, queryParams);
  dispatch({type:'query_execution_finished', result: result});
}
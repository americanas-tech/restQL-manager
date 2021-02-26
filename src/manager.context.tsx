import { createContext, ReactNode, useContext, useReducer } from "react";
import { lastRevision, Query, QueryRevision } from "./QueryExplorer/queries";
import { fetchNamespaces, fetchQueriesFromNamespace, fetchTenants, fetchMappingsFromTenant, runQuery, saveQuery, setResource } from "./api";
import { Param } from "./QueryExplorer/parameters";

export type MappingsByTenant = {
  [tenant: string]: {
    [resource: string]: {url: string, source: string}
  }
};

export type ManagerState = {
  status: "initial" | "loading" | "completed" | "error",
  mappings: MappingsByTenant,
  queries: Record<string, Query[]>,
  selectedQuery: QueryRevision | null,
  selectedTenant: string,
  currentQueryText: string,
  debug: boolean,
  queryResult: {
    status: 'stale' | 'running',
    json: any,
  },
  saveQueryModal: {
    status: 'stale' | 'saving',
    error: string
  },
  manageResourceModal: {
    status: 'stale' | 'saving',
    error: string
  }
}

const initialState: ManagerState = {
  status: "initial",
  mappings: {},
  queries: {},
  selectedQuery: null,
  selectedTenant: "",
  currentQueryText: "",
  debug: false,
  queryResult: {
    status: 'stale',
    json: {},
  },
  saveQueryModal: {
    status: 'stale',
    error: ''
  },
  manageResourceModal: {
    status: 'stale',
    error: ''
  }
}

type ManagerAction = 
  {type: 'initialization_started'}
  | {type: 'initialization_completed', queries: Record<string, Query[]>, mappingsByTenant: MappingsByTenant}
  | {type: 'refresh_queries', queries: Record<string, Query[]>}
  | {type: 'select_query', queryRevision: QueryRevision}
  | {type: 'set_debug', debug: boolean}
  | {type: 'updated_query_text', text: string}
  | {type: 'select_tenant', tenant: string}
  | {type: 'query_execution_started'}
  | {type: 'query_execution_finished', result: any}
  | {type: 'save_query_started'}
  | {type: 'save_query_finished'}
  | {type: 'save_query_failed', error: string}
  | {type: 'set_resource_started'}
  | {type: 'set_resource_finished'}
  | {type: 'set_resource_failed', error: string}
  | {type: 'refresh_mappings', mappings: MappingsByTenant}
  
type Dispatch = React.Dispatch<ManagerAction>;

const ManagerStateContext = createContext<ManagerState | null>(null);
const ManagerDispatchContext = createContext<Dispatch | null>(null);

function managerReducer(state: ManagerState, action: ManagerAction): ManagerState {
  switch (action.type) {
    case 'initialization_started':
      return {...state, status: 'loading'};
    case 'initialization_completed':
      const tenants = getTenants(action.mappingsByTenant);
      return {
        ...state, 
        status: 'completed', 
        mappings: action.mappingsByTenant,
        queries: action.queries,
        selectedTenant: tenants[0],
      };
    case 'refresh_queries':
      return {
        ...state, 
        queries: action.queries,
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
    case 'save_query_started':
      return {...state, saveQueryModal: {status: 'saving', error: ""}}
    case 'save_query_finished':
      return {...state, saveQueryModal: {status: 'stale', error: ""}}
    case 'save_query_failed':
      return {...state, saveQueryModal: {status: 'stale', error: action.error}}
    case 'set_resource_started':
      return {...state, manageResourceModal: {status: 'saving', error: ""}}
    case 'set_resource_finished':
      return {...state, manageResourceModal: {status: 'stale', error: ""}}
    case 'set_resource_failed':
      return {...state, manageResourceModal: {status: 'stale', error: action.error}}
    case 'refresh_mappings':
      return {...state, mappings: action.mappings}
    default:
      return state;
  }
}


export function ManagerProvider(props: {children: ReactNode}) {
  const [state, dispatch] = useReducer(managerReducer, initialState);

  return (
      <ManagerDispatchContext.Provider value={dispatch}>
        <ManagerStateContext.Provider value={state}>
            {props.children}
        </ManagerStateContext.Provider>
      </ManagerDispatchContext.Provider>
  )
}

export function useManagerState(): ManagerState {
  const context = useContext(ManagerStateContext);
  if (context === null) {
    throw new Error('useQueryExploreerState must be used within a QueryExplorerProvider')
  }
  return context;
}

export function useManagerDispatch(): Dispatch {
  const context = useContext(ManagerDispatchContext);
  if (context === null) {
    throw new Error('useQueryExploreerDispatch must be used within a QueryExplorerProvider')
  }
  return context
}

export function getTenants(mappings: MappingsByTenant): string[] {
  return Object.keys(mappings).sort();
}

export async function initializeManager(dispatch: Dispatch) {
  dispatch({type: "initialization_started"});

  const mappingsByTenant = await fetchMappingsByTenant();
  const queriesByNamespace = await fetchNamespacesAndQueries();

  dispatch({type: "initialization_completed", mappingsByTenant: mappingsByTenant, queries: queriesByNamespace});
}

export async function runQueryOnRestql(dispatch: Dispatch, state: ManagerState, params: Param[]): Promise<void> {
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

export async function saveQueryOnRestql(dispatch: Dispatch, state: ManagerState, queryNamespace: string, queryName: string) {
  dispatch({type:'save_query_started'});

  const queryText = state.currentQueryText;
  try {
    await saveQuery(queryNamespace, queryName, queryText);
    
    const queriesByNamespace = await fetchNamespacesAndQueries();
    dispatch({type:'refresh_queries', queries: queriesByNamespace});

    const newRevision = getNewRevision(queriesByNamespace, queryNamespace, queryName);
    dispatch({type: 'select_query', queryRevision: newRevision});
    
    dispatch({type:'save_query_finished'});
  } catch (error) {
    dispatch({type:'save_query_failed', error: error});
  }
}

export async function setResourceOnRestql(dispatch: Dispatch, tenant: string, resourceName: string, resourceUrl: string, authorizationCode: string) {
  dispatch({type:'set_resource_started'});

  try {
    await setResource(tenant, resourceName, resourceUrl, authorizationCode);
    
    const mappingsByTenant = await fetchMappingsByTenant();

    dispatch({type:'refresh_mappings', mappings: mappingsByTenant});
    
    dispatch({type:'set_resource_finished'});
  } catch (error) {
    dispatch({type:'set_resource_failed', error: error});
  }
}

function getNewRevision(queriesByNamespace: Record<string, Query[]>, namespace: string, name: string): QueryRevision {
  const namespacedQueries = queriesByNamespace[namespace];

  const query = namespacedQueries.find(q => q.name === name) as Query;

  const lastRevisionNumber = lastRevision(query.revisions);
  const rev = query.revisions[lastRevisionNumber-1];

  return {
    namespace: namespace,
    name: name,
    revision: rev.revision,
    text: rev.text,
  }
}

async function fetchNamespacesAndQueries() {
  const namespaces = await fetchNamespaces();
  const queriesForNamespace = await Promise.all(namespaces.map(n => fetchQueriesFromNamespace(n)))
  
  const queriesByNamespace: Record<string, Query[]> = {};
  for (const namespaceQueries of queriesForNamespace) {
    queriesByNamespace[namespaceQueries.namespace] = namespaceQueries.queries;
  }

  return queriesByNamespace
}

async function fetchMappingsByTenant() {
  const tenants = await fetchTenants();
  const mappings = await Promise.all(tenants.map(t => fetchMappingsFromTenant(t)));
  
  const mappinsByTenant: {[k: string]: any} = {};
  for (const tenantMappings of mappings) {
    mappinsByTenant[tenantMappings.tenant] = tenantMappings.mappings;
  }

  return mappinsByTenant;
}
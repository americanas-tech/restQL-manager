import { createContext, ReactNode, useContext, useReducer } from "react";
import { findQueryRevision, lastRevision, Query, QueryRevision } from "./QueryExplorer/queries";
import { 
  fetchNamespaces, 
  fetchQueriesFromNamespace, 
  fetchTenants, 
  fetchMappingsFromTenant, 
  runQuery, 
  saveQuery, 
  setResource, 
  fetchArchivedQueriesFromNamespace,
  archiveQuery, 
  archiveRevision,
} from "./api";
import { Param } from "./QueryExplorer/parameters";

export type MappingsByTenant = {
  [tenant: string]: {
    [resource: string]: {url: string, source: string}
  }
};

export type ConfirmationModalState = {
  status: 'stale' | 'saving',
  message: string,
  error?: string,
  opened: boolean,
  handler: () => void,
}

export type ManagerState = {
  status: "initial" | "loading" | "completed" | "error",
  mappings: MappingsByTenant,
  queries: Record<string, Query[]>,
  archivedQueries: Record<string, Query[]>,
  selectedArchiveStatus: boolean,
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
  },
  confirmationModal: ConfirmationModalState,
}

const initialState: ManagerState = {
  status: "initial",
  mappings: {},
  queries: {},
  archivedQueries: {},
  selectedArchiveStatus: false,
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
  },
  confirmationModal: {
    status: 'stale',
    message: "", 
    error: "",
    opened: false, 
    handler: () => {},
  }
}

type ManagerAction = 
  {type: 'initialization_started'}
  | {type: 'initialization_completed', queries: Record<string, Query[]>, archivedQueries: Record<string, Query[]>, mappingsByTenant: MappingsByTenant}
  | {type: 'refresh_queries', queries: Record<string, Query[]>, archivedQueries: Record<string, Query[]>}
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
  | {type: 'set_confirmation_modal', state: Partial<ConfirmationModalState>}
  
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
        archivedQueries: action.archivedQueries,
      };
    case 'refresh_queries':
      return {
        ...state, 
        queries: action.queries,
        archivedQueries: action.archivedQueries,
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
    case 'set_confirmation_modal':
      return {...state, confirmationModal: {...state.confirmationModal, ...action.state}}
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
  const namespaces = await fetchNamespaces();
  const [queriesByNamespace, archivedQueriesByNamespace] = await Promise.all([
    fetchQueries(namespaces), 
    fetchArchivedQueries(namespaces)
  ]);

  dispatch({
    type: "initialization_completed", 
    mappingsByTenant: mappingsByTenant, 
    queries: queriesByNamespace,
    archivedQueries: archivedQueriesByNamespace,
  });
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
    
    await refreshQueries(dispatch);
    
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

export async function archiveSelectedQuery(dispatch: Dispatch, state: ManagerState) {
  dispatch({type: 'set_confirmation_modal', state: {
    status: 'saving'
  }})

  const query = state.selectedQuery as QueryRevision;

  try {
    await archiveQuery(query.namespace, query.name);
    const refreshed = await refreshQueries(dispatch);
    const refreshedSelectedQuery = findQueryRevision(query.namespace, query.name, query.revision.toString(), refreshed.archivedQueries);
    if (refreshedSelectedQuery) {
      dispatch({type: "select_query", queryRevision: refreshedSelectedQuery});
    }

    dispatch({type: 'set_confirmation_modal', state: {
      status: 'stale',
      opened: false,
    }})
  } catch (error) {
    dispatch({type: 'set_confirmation_modal', state: {
      status: 'stale',
      error: error.message,
    }})
  }
}

export async function archiveSelectedRevision(dispatch: Dispatch, state: ManagerState) {
  dispatch({type: 'set_confirmation_modal', state: {
    status: 'saving'
  }})

  const query = state.selectedQuery as QueryRevision;

  try {
    await archiveRevision(query.namespace, query.name, query.revision);
    const refreshed = await refreshQueries(dispatch);
    const refreshedSelectedQuery = findQueryRevision(query.namespace, query.name, query.revision.toString(), refreshed.archivedQueries);
    if (refreshedSelectedQuery) {
      dispatch({type: "select_query", queryRevision: refreshedSelectedQuery});
    }
    
    dispatch({type: 'set_confirmation_modal', state: {
      status: 'stale',
      opened: false,
    }})
  } catch (error) {
    dispatch({type: 'set_confirmation_modal', state: {
      status: 'stale',
      error: error.message,
    }})
  }
}

async function fetchQueries(namespaces: string[]) {
  const queriesForNamespace = await Promise.all(namespaces.map(n => fetchQueriesFromNamespace(n)))
  
  const queriesByNamespace: Record<string, Query[]> = {};
  for (const namespaceQueries of queriesForNamespace) {
    if (namespaceQueries.queries.length === 0) {
      continue
    }
    
    queriesByNamespace[namespaceQueries.namespace] = namespaceQueries.queries;
  }

  return queriesByNamespace
}

async function fetchArchivedQueries(namespaces: string[]) {
  const queriesForNamespace = await Promise.all(namespaces.map(n => fetchArchivedQueriesFromNamespace(n)))
  
  const queriesByNamespace: Record<string, Query[]> = {};
  for (const namespaceQueries of queriesForNamespace) {
    if (namespaceQueries.queries.length === 0) {
      continue
    }

    const queriesWithArchivedRevisions = namespaceQueries.queries.filter(q => q.revisions.length > 0);
    if (queriesWithArchivedRevisions.length === 0) {
      continue
    }
    
    queriesByNamespace[namespaceQueries.namespace] = queriesWithArchivedRevisions;
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

async function refreshQueries(dispatch: Dispatch) {
  const namespaces = await fetchNamespaces();
  const [queriesByNamespace, archivedQueriesByNamespace] = await Promise.all([
    fetchQueries(namespaces), 
    fetchArchivedQueries(namespaces)
  ]);
  
  dispatch({type:'refresh_queries', queries: queriesByNamespace, archivedQueries: archivedQueriesByNamespace});

  return {queries: queriesByNamespace, archivedQueries: archivedQueriesByNamespace}
}
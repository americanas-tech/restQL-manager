import { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import { useParams } from "react-router-dom";
import './index.scss';

import QueryControls from './query-controls';
import QuerySelectors, {QueryInputMode} from './query-selectors';
import Editor from './editor';
import ParametersEditor from './params-editor';
import JsonViewer from 'react-json-view';
import SaveQueryModal from "./save-query";
import SideMenuModal from './side-menu';
import ConfirmationModal from "./confirmation-modal";
import { parametersReducer, Param, NewParam } from "./parameters";
import { 
  useManagerState, 
  useManagerDispatch, 
  runQueryOnRestql,
  saveQueryOnRestql,
  getTenants,
  ManagerState,
  archiveSelectedQuery,
  archiveSelectedRevision,
} from "../manager.context";
import { QueryRevision, findQueryRevision, findLastQueryRevision } from './queries';

const debugParamKey = '_debug';

const useElementDimensions = (defaultHeight: number, defaultWidth: number): [number, number, any] => {
  const [height, setHeight] = useState(defaultHeight || 0);
  const [width, setWidth] = useState(defaultWidth || 0);

  const measuredContainer = useCallback(node => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return [width, height, measuredContainer]
}

function QueryExplorer() {
  const managerState = useManagerState();
  const managerDispatch = useManagerDispatch();

  const routeParams = useParams<{namespace: string, queryName: string, revision: string}>();
  useEffect(() => {
    const qr = getSelectedOrLastQueryRevision(routeParams.namespace, routeParams.queryName, routeParams.revision, managerState)
    if (!qr) {
      return
    }
    
    managerDispatch({type: "select_query", queryRevision: qr});
  }, [routeParams.namespace, routeParams.queryName, routeParams.revision, managerState.status]);

  const [availableHeight, setAvailableHeight] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);

  const [containerWidth, containerHeight, containerRef] = useElementDimensions(0, 0);
  const [,selectorsHeight, selectorsRef] = useElementDimensions(0, 0);
  const [resultsWidth,, resultsRef] = useElementDimensions(0, 0);

  useEffect(() => {
    const height = containerHeight - selectorsHeight;
    setAvailableHeight(height);
  }, [containerHeight, selectorsHeight]);

  useEffect(() => {
    const width = containerWidth - resultsWidth;
    setAvailableWidth(width);
  }, [containerWidth, resultsWidth]);

  const [mode, setMode] = useState<QueryInputMode>("editor");
  const [params, paramsDispatch] = useReducer(parametersReducer, []);

  useEffect(() => {
    if (params.find(p => p.key === debugParamKey)) {
      managerDispatch({type: 'set_debug', debug: true})
    } else {
      managerDispatch({type: 'set_debug', debug: false})
    }
  }, [params])

  const onDebugChange = (debug: boolean) => {
    managerDispatch({type: 'set_debug', debug: debug})

    if (debug) {
      paramsDispatch({type: 'inserted', parameter: NewParam(debugParamKey, true)})
    } else {
      const debugParameter = params.find(p => p.key === debugParamKey)
      if (debugParameter) {
        paramsDispatch({type: 'deleted', parameter: debugParameter})
      }
    }
  }

  const queryControlChangeHandler = (qr: QueryRevision, params: Param[]) => {
    paramsDispatch({type:'replaced', parameters: params});
    if (qr) {
      managerDispatch({type: "select_query", queryRevision: qr});
    }
  }

  const queryResult = managerState.queryResult;
  const jsonViewer = useMemo(() => (
    <JsonViewer 
      name={null} 
      src={queryResult.json} 
      iconStyle={"triangle"} 
      displayDataTypes={false} 
      enableClipboard={true}
    />
  ), [queryResult.json]);

  const [saveQueryModalOpen, setSaveQueryModalOpen] = useState(false);
  const closeSaveQueryModal = () => setSaveQueryModalOpen(false);
  const openSaveQueryModal = () => setSaveQueryModalOpen(true);
  const onSaveQuery = async (namespace: string, name: string) => { 
    await saveQueryOnRestql(managerDispatch, managerState, namespace, name)
    setSaveQueryModalOpen(false);
  }


  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const openSideMenu = () => {
    setSideMenuOpen(true)
  };
  const closeSideMenu = () => setSideMenuOpen(false);

  if (managerState.status !== 'completed') {
    return <div>Loading...</div>;
  }

  const modeToComponent: Record<QueryInputMode, JSX.Element> = {
    "editor": <Editor className="query-explorer__editor" 
                height={availableHeight} 
                width={availableWidth}
                content={managerState.currentQueryText}
                onChange={(content: string) => managerDispatch({type: 'updated_query_text', text: content})} />,
    "params": <ParametersEditor
                height={availableHeight}
                width={availableWidth}
                onChange={paramsDispatch}
                params={params} />,
  };

  return (
    <>
        <div className="query-explorer__controls--wrapper">
          <QueryControls 
            params={params} 
            disableActions={{
              run: managerState.queryResult.status === 'running',
              save: !managerState.currentQueryText || managerState.queryResult.status === 'running',
              archive: !managerState.selectedQuery || managerState.selectedQuery?.archived
            }}
            onMenuOpen={openSideMenu}
            onChange={queryControlChangeHandler} 
            onRun={() => runQueryOnRestql(managerDispatch, managerState, params)}
            onSave={openSaveQueryModal}
            onArchiveQuery={() => managerDispatch({
              type: 'set_confirmation_modal',
              state: {
                status: 'stale',
                message: "Are you sure you want to archive this query?",
                opened: true,
                handler: () => archiveSelectedQuery(managerDispatch, managerState),
              }
            })}
            onArchiveRevision={() => managerDispatch({
              type: "set_confirmation_modal",
              state: {
                status: "stale",
                message: "Are you sure you want to archive this revision?",
                opened: true,
                handler: () => archiveSelectedRevision(managerDispatch, managerState),
              }
            })}
          />
        </div>
        <div ref={containerRef} className="query-explorer__input-output--wrapper">
          <div className="query-inputs">
            <div ref={selectorsRef} className="query-inputs__selectors">
              <QuerySelectors 
                tenants={getTenants(managerState.mappings)}
                debug={managerState.debug}
                onDebugChange={onDebugChange}
                onModeChange={setMode} 
                onTenantChange={(tenant) => managerDispatch({type: 'select_tenant', tenant: tenant})}
              />
            </div>

            {
              modeToComponent[mode]
            }
          </div>
          <div ref={resultsRef} className="query-explorer__result">
            <div style={{position: "relative", width: "100%", height: "100%"}}>
              <div className={queryResult.status === 'stale' ? '' : 'query-explorer__result--running'}>
                {jsonViewer}
              </div>
            </div>
          </div>
        </div>
        <SaveQueryModal 
          isOpen={saveQueryModalOpen} 
          status={managerState.saveQueryModal.status}
          selectedQuery={managerState.selectedQuery}
          errorMessage={managerState.saveQueryModal.error}
          onSave={onSaveQuery}
          onClose={closeSaveQueryModal} 
        />
        <SideMenuModal 
          isOpen={sideMenuOpen}
          queriesByNamespace={managerState.queries}
          archivedQueriesByNamespace={managerState.archivedQueries}
          mappings={managerState.mappings}
          onClose={closeSideMenu}
        />
        <ConfirmationModal 
          onConfirm={managerState.confirmationModal.handler}
          message={managerState.confirmationModal.message}
          error={managerState.confirmationModal.error}
          disabled={managerState.confirmationModal.status === 'saving'}
          isOpen={managerState.confirmationModal.opened}
          onClose={() => managerDispatch({
            type: 'set_confirmation_modal', 
            state: {error: "", opened: false},
          })}
        />
    </>
  )
}

function getSelectedOrLastQueryRevision(namespace: string, queryName: string, revision: string | null, state: ManagerState):  QueryRevision | null {
    if (revision) {
      const qr = findQueryRevision(namespace, queryName, revision, state.queries);
      if (qr) {
        return qr
      }
      
      const archivedQr = findQueryRevision(namespace, queryName, revision, state.archivedQueries);
      if (archivedQr) {
        return archivedQr
      }
    }
    
    const qr = findLastQueryRevision(namespace, queryName, state.queries);
    if (qr) {
      return qr
    }

    const archivedQr = findLastQueryRevision(namespace, queryName, state.archivedQueries);
    if (archivedQr) {
      return archivedQr
    }

    return null
}

export default QueryExplorer
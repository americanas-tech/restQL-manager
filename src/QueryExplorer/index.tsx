import { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import './index.scss';

import QueryControls from './query-controls';
import QuerySelectors, {QueryInputMode} from './query-selectors';
import Editor from './editor';
import ParametersEditor from './params-editor';
import JsonViewer from 'react-json-view';
import SaveQueryModal from "./save-query";
import { parametersReducer, Param } from "./parameters";
import { 
  QueryExplorerProvider, 
  useQueryExplorerState, 
  useQueryExplorerDispatch, 
  initializeExplorer,
  runExplorerQuery,
  saveExplorerQuery,
} from "./explorer.context";
import { QueryRevision } from './queries';


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
  const queryExplorerState = useQueryExplorerState();
  const queryExplorerDispatch = useQueryExplorerDispatch();
  useEffect(() => {
    initializeExplorer(queryExplorerDispatch);
  }, []);

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

  const queryControlChangeHandler = (qr: QueryRevision, params: Param[]) => {
    paramsDispatch({type:'replaced', parameters: params});
    queryExplorerDispatch({type: "select_query", queryRevision: qr});
  }

  const queryResult = queryExplorerState.queryResult;
  const jsonViewer = useMemo(() => (
    <JsonViewer 
      name={null} 
      src={queryResult.json} 
      iconStyle={"triangle"} 
      displayDataTypes={false} 
      enableClipboard={true}
    />
  ), [queryResult.json]);

  const [modalOpen, setModalOpen] = useState(false);
  const onCloseModal = () => {
    setModalOpen(false);
  }
  const onSaveQuery = async (namespace: string, name: string) => { 
    await saveExplorerQuery(queryExplorerDispatch, queryExplorerState, namespace, name)
    setModalOpen(false);
  }

  if (queryExplorerState.status !== 'completed') {
    return <div>Loading...</div>;
  }

  const modeToComponent: Record<QueryInputMode, JSX.Element> = {
    "editor": <Editor className="query-explorer__editor" 
                height={availableHeight} 
                width={availableWidth}
                content={queryExplorerState.currentQueryText}
                onChange={(content: string) => queryExplorerDispatch({type: 'updated_query_text', text: content})} />,
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
              run: queryExplorerState.queryResult.status === 'running',
              save: !queryExplorerState.currentQueryText || queryExplorerState.queryResult.status === 'running',
            }}
            onChange={queryControlChangeHandler} 
            onRun={() => runExplorerQuery(queryExplorerDispatch, queryExplorerState, params)}
            onSave={() => setModalOpen(true)}
          />
        </div>
        <div ref={containerRef} className="query-explorer__input-output--wrapper">
          <div className="query-inputs">
            <div ref={selectorsRef} className="query-inputs__selectors">
              <QuerySelectors 
                tenants={queryExplorerState.tenants} 
                onModeChange={setMode} 
                onTenantChange={(tenant) => queryExplorerDispatch({type: 'select_tenant', tenant: tenant})}
                onDebugChange={(debug) => queryExplorerDispatch({type: 'set_debug', debug: debug})}
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
          isOpen={modalOpen} 
          status={queryExplorerState.saveQueryModal.status}
          selectedQuery={queryExplorerState.selectedQuery}
          errorMessage={queryExplorerState.saveQueryModal.error}
          onSave={onSaveQuery}
          onClose={onCloseModal} 
        />
    </>
  )
}

function QueryExplorerContainer() {
  return (
    <QueryExplorerProvider>
      <QueryExplorer />
    </QueryExplorerProvider>
  )
}

export default QueryExplorerContainer
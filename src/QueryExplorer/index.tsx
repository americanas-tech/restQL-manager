import { useState, useRef, useEffect, useReducer, useMemo, useCallback } from 'react';
import './index.scss';

import QueryControls from './query-controls';
import QuerySelectors, {QueryInputMode} from './query-selectors';
import Editor from './editor';
import ParametersEditor from './params-editor';
import JsonViewer from 'react-json-view';
import { parametersReducer, Param } from "./parameters";
import { 
  QueryExplorerProvider, 
  useQueryExplorerState, 
  useQueryExplorerDispatch, 
  initializeExplorer 
} from "./explorer.context";
import { QueryRevision } from './queries';

const json = `
{
  "cart": {
      "details": {
          "status": 200,
          "success": true,
          "metadata": {
              "ignore-errors": "ignore"
          }
      },
      "result": {
          "ameFlow": false,
          "b2b": false,
          "creditCardCashback": 0,
          "customer": {
              "guest": false,
              "id": "02-93890899-1",
              "isGuest": false,
              "oauth": false
          },
          "id": "c67f2fcc-3158-42de-a1fa-792dd9861edd",
          "lastModified": "Fri Feb 12 15:32:07 BRT 2021",
          "lines": [
              {
                  "condition": "NEW",
                  "crossborder": false,
                  "discount": {
                      "rate": 10,
                      "value": 15
                  },
                  "id": "122606094",
                  "insertDate": "Fri Feb 12 15:32:07 BRT 2021",
                  "maxQuantity": 12,
                  "maximumQuantityReason": "LOCK",
                  "offerId": "5fc654a4762ff367194645a6",
                  "peculiarity": "NEW",
                  "pricing": {
                      "from": 149.99,
                      "to": 134.99
                  },
                  "pricingId": "602144874b7c9b0015a4dd54",
                  "product": {
                      "class": "30000049",
                      "currencyOriginalPrice": 0,
                      "department": "10000058",
                      "diffs": [],
                      "dimension": {
                          "cubicWeight": 5.6511,
                          "dimensionWarning": false,
                          "height": 0.21,
                          "length": 0.23,
                          "weight": 2.17,
                          "width": 0.39
                      },
                      "groups": [
                          "298601",
                          "298610",
                          "298718",
                          "298817"
                      ],
                      "id": "122606086",
                      "image": "https://images-americanas.b2w.io/produtos/01/00/sku/122606/0/122606094G1.jpg",
                      "isKit": false,
                      "isLarge": false,
                      "isVirtual": false,
                      "line": "20000049",
                      "listPrice": 149.99,
                      "merchandiseHierarchy": {
                          "classe": "30000049",
                          "department": "10000058",
                          "line": "20000049",
                          "subclasse": "40000147"
                      },
                      "name": "Panela de Pressão 4,5L 20 cm Vancouver Grená",
                      "originalPrice": 149.99,
                      "preSale": false,
                      "price": 149.99,
                      "prime": false,
                      "productType": "PHYSICAL",
                      "quantity": 1,
                      "salesPrice": 149.99,
                      "sku": "122606094",
                      "subClass": "40000147",
                      "supplier": "Tramontina",
                      "tags": [
                          "blacknight-fevereiro2021",
                          "amais-in-fev",
                          "audiencia-casa",
                          "tag-45vancouver"
                      ],
                      "weight": 6.0749326
                  },
                  "productId": "122606086",
                  "productSku": "122606094",
                  "promotions": [
                      {
                          "category": "PURCHASE_CLUB",
                          "conditional": false,
                          "criteria": [
                              {
                                  "name": "CUSTOMER_TAG",
                                  "values": [
                                      "buyers-club"
                                  ]
                              }
                          ],
                          "discountValue": 15,
                          "name": "PURCHASE_CLUB"
                      }
                  ],
                  "quantity": 1,
                  "quantityLock": {
                      "b2b": 100,
                      "b2c": 12
                  },
                  "salesPrice": 134.99,
                  "type": "B2W",
                  "unitSalesPrice": 134.99
              }
          ],
          "maximumNumberOfLinesInCart": 10,
          "pickUpInStore": {
              "eligible": false
          },
          "salesChannel": "ACOM",
          "status": "NEW",
          "storeProperties": {
              "maxLines": 10,
              "minimumValue": 0,
              "missingValue": 0
          },
          "suggestedCoupons": {
              "next": []
          },
          "total": 134.99
      }
  },
  "services": {
      "details": [
          {
              "status": 200,
              "success": true,
              "metadata": {
                  "ignore-errors": "ignore"
              }
          }
      ],
      "result": [
          []
      ]
  }
}  
`;

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

  const jsonViewer = useMemo(() => (
    <JsonViewer 
      name={null} 
      src={JSON.parse(json)} 
      iconStyle={"triangle"} 
      displayDataTypes={false} 
      enableClipboard={true}
    />
  ), [json]);

  if (queryExplorerState.status !== 'completed') {
    return <div>Loading...</div>;
  }

  const modeToComponent: Record<QueryInputMode, JSX.Element> = {
    "editor": <Editor className="query-explorer__editor" 
                height={availableHeight} 
                width={availableWidth}
                content={queryExplorerState.queryText}
                onChange={(content: string) => queryExplorerDispatch({type: 'updated_query_text', text: content})} />,
    "params": <ParametersEditor
                height={availableHeight}
                width={availableWidth}
                onChange={paramsDispatch}
                params={params} />,
  }

  return (
    <>
        <div className="query-explorer__controls--wrapper">
          <QueryControls params={params} onChange={queryControlChangeHandler} />
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
            {jsonViewer}
          </div>
        </div>
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
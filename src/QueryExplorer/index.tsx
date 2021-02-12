import { useState, useRef, useEffect } from 'react';
import './index.scss';

import QueryControls from './query-controls';
import QuerySelectors from './query-selectors';
import Editor from './editor';

function QueryExplorer() {
  const [code, setCode] = useState("")
  const queries = [
    "/demo/httpbin-get/1",
    "/demo/httpbin-get/2",
    "/demo/httpbin-get/3",
    "/demo/demo-product/1",
    "/demo/demo-offer/1",
    "/demo/demo-sku/1",
  ]
  const tenants = [
    "ACOM-PF",
    "ACOM-NPF",
    "SUBA-NPF",
  ]


  const containerRef = useRef(null)
  const selectorsRef = useRef(null)
  const resultsRef = useRef(null)

  const [availableHeight, setAvailableHeight] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)

  useEffect(() => {
    if (Boolean(containerRef.current) && Boolean(selectorsRef.current) && Boolean(resultsRef.current)) {
      const height = (containerRef.current as any).offsetHeight - (selectorsRef.current as any).offsetHeight
      const width = (containerRef.current as any).offsetWidth - (resultsRef.current as any).offsetWidth


      setAvailableHeight(height)
      setAvailableWidth(width)
    }
  }, [containerRef, selectorsRef])

  return (
    <>
      <div className="query-explorer__controls--wrapper">
        <QueryControls queries={queries} />
      </div>
      <div ref={containerRef} className="query-explorer__input-output--wrapper">
        <div className="query-inputs">
          <div ref={selectorsRef} className="query-inputs__selectors">
            <QuerySelectors tenants={tenants} />
          </div>
          <Editor 
            className="query-explorer__editor" 
            code={"from cart"} 
            height={availableHeight} 
            width={availableWidth}
            onChange={() => {}} 
          />
        </div>
        <textarea ref={resultsRef} className="query-explorer__result" disabled={true} value={"ausdasdasdasdasdas"} name="queryResults"></textarea>
      </div>
    </>
  )
}

export default QueryExplorer
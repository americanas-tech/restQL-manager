import { useState } from 'react';
import './index.scss';

import QueryControls from './query-controls';
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

  return (
    <div>
      <div className="query-explorer__controls--wrapper">
        <QueryControls queries={queries} />
      </div>
      <div className="query-explorer__input-output--wrapper">
        <Editor className="query-explorer__editor" code={"from cart"} onChange={setCode} />
        <textarea className="query-explorer__result" name="queryResults">{"ausdasdasdasdasdas"}</textarea>
      </div>
    </div>
  )
}

export default QueryExplorer
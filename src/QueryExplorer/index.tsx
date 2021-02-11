import { useState } from 'react';
import './index.scss';

import QueryControls from './query-controls';
import Editor from './editor';


function QueryExplorer() {
  const [code, setCode] = useState("")

  return (
    <div>
      <div className="query-explorer__controls--wrapper">
        <QueryControls />
      </div>
      <div className="query-explorer__input-output--wrapper">
        <Editor className="query-explorer__editor" code={"from cart"} onChange={setCode} />
        <textarea className="query-explorer__result" name="queryResults">{"ausdasdasdasdasdas"}</textarea>
      </div>
    </div>
  )
}

export default QueryExplorer
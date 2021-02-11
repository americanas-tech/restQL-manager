import './index.scss';
import Editor from "../editor";

const EDITOR_MODE = "editor";
const PARAMS_MODE = "params";

function QueryInputs() {

  const tenants = [
    "ACOM-PF",
    "ACOM-NPF",
    "SUBA-NPF",
  ]

  return (
    <div className="query-inputs">
      <div className="query-inputs__selectors">
        <select name="editor-params-selector" className="query-inputs__mode-selector">
          <option value={EDITOR_MODE}>Query</option>
          <option value={PARAMS_MODE}>Parameters</option>
        </select>

        <div className="query-inputs__tenant-selector">
          <label>Tenant:</label>
          <select name="editor-params-selector">
            {tenants.map(t => (<option value={t}>{t}</option>))}
          </select>
        </div>

        <div className="query-inputs__debug">
          <label htmlFor="debug">Debug</label>
          <input type="checkbox" id="debug" name="debug" />
        </div>
      </div>
      <Editor className="query-explorer__editor" code={"from cart"} onChange={() => {}} />
    </div>
  )
}

export default QueryInputs

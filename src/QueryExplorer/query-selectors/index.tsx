import './index.scss';

type QuerySelectorsProps = {
  tenants: string[],
}

const EDITOR_MODE = "editor";
const PARAMS_MODE = "params";

function QuerySelector(props: QuerySelectorsProps) {
  return (
    <>
      <select name="editor-params-selector" className="query-inputs__mode-selector">
        <option value={EDITOR_MODE}>Query</option>
        <option value={PARAMS_MODE}>Parameters</option>
      </select>

      <div className="query-inputs__tenant-selector">
        <label>Tenant:</label>
        <select name="editor-params-selector">
          {props.tenants.map(t => (<option value={t}>{t}</option>))}
        </select>
      </div>

      <div className="query-inputs__debug">
        <label htmlFor="debug">Debug</label>
        <input type="checkbox" id="debug" name="debug" />
      </div>
    </>
  )
}

export default QuerySelector
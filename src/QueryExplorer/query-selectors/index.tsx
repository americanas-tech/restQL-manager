import { FormEvent } from "react";

import './index.scss';

export type QueryInputMode = "editor" | "params";

const EDITOR_MODE: QueryInputMode = "editor";
const PARAMS_MODE: QueryInputMode = "params";

type QuerySelectorsProps = {
  tenants: string[],
  onModeChange: (mode: QueryInputMode) => void,
  onTenantChange: (tenant: string) => void,
  onDebugChange: (debug: boolean) => void
}

function QuerySelector(props: QuerySelectorsProps) {
  const modeSelectorHandler = (e: FormEvent<HTMLSelectElement>) => {
    props.onModeChange(e.currentTarget.value as QueryInputMode)
  }

  const tenantSelectorHandler = (e: FormEvent<HTMLSelectElement>) => {
    props.onTenantChange(e.currentTarget.value)
  }

  const debugSelectorHandler = (e: FormEvent<HTMLInputElement>) => {
    props.onDebugChange(e.currentTarget.checked);
  }

  return (
    <>
      <select onChange={modeSelectorHandler} name="editor-params-selector" className="query-inputs__mode-selector">
        <option value={EDITOR_MODE}>Query</option>
        <option value={PARAMS_MODE}>Parameters</option>
      </select>

      <div className="query-inputs__tenant-selector">
        <label>Tenant:</label>
        <select onChange={tenantSelectorHandler} name="editor-params-selector">
          {props.tenants.map(t => (<option value={t}>{t}</option>))}
        </select>
      </div>

      <div className="query-inputs__debug">
        <label htmlFor="debug">Debug</label>
        <input onChange={debugSelectorHandler} type="checkbox" id="debug" name="debug" />
      </div>
    </>
  )
}

export default QuerySelector
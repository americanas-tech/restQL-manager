import './index.scss';

import { Param, ChangedParameter, NewParam } from "../parameters";
import {ParameterRow} from './parameters-row.component';

export type ParameterEditorProps = {
  height: number,
  width: number,
  params: Param[],
  onChange: (change: ChangedParameter) => void
}

function ParameterEditor(props: ParameterEditorProps) {
  const deleteParamHandler = (param: Param) => {
    props.onChange({type: "deleted", parameter: param});
  }

  const insertHandler = (param: Param) => (key: string, value: any) => {
    const newParam = {...param, key, value};
    props.onChange({type: "inserted", parameter: newParam});
  }

  const changeHandler = (param: Param) => (key: string, value: any, enabled: boolean) => {
    const updatedParam = {...param, key, value, enabled};
    props.onChange({type: "edited", parameter: updatedParam});
  }

  const insertParamLinePlaceholder = NewParam("", "");
  const lines: Param[] = [...props.params, insertParamLinePlaceholder];
  const insertLineIndex = lines.length - 1;
  
  const parameterRows = lines.map((p, i) => (
    <ParameterRow 
      key={p.id}
      paramKey={p.key}
      value={p.value}
      enabled={p.enabled}
      mode={i === insertLineIndex ? "insert" : "edit"}
      onDelete={() => deleteParamHandler(p)}
      onInsert={insertHandler(p)}
      onChange={changeHandler(p)}
    />
  ));

  return (
    <div style={{height: props.height, width: props.width}} className="params-editor--wrapper">
      <h2>Query Params</h2>
      <table className="params-editor">
        <thead>
          <tr>
            <th></th>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          {parameterRows}
        </tbody>
      </table>
    </div>
  )
}

export default ParameterEditor
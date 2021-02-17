import {useState} from 'react';
import './index.scss';

import { Param } from "./index";
import {ParameterRow} from './parameters-row';

export type ParameterEditorProps = {
  height: number,
  width: number,
  params: Param[]
}

const insertParamPlaceholder: Param = {key:"", value: null, enabled: true}

const isParameterOnPosition = (keyToRemove: string, positionToRemove: number) => (param: Param, position: number) => {
  return param.key === keyToRemove && position === positionToRemove;
}

function ParameterEditor(props: ParameterEditorProps) {
  const [parameters, setParameters] = useState(props.params)

  const deleteParamHandler = (key: string, position: number) => {
    const paramFilter = isParameterOnPosition(key, position);
    const updatedParams = parameters.filter((p, i) => !paramFilter(p, i));

    setParameters(updatedParams);
  }
  
  const editorLines = [...parameters, insertParamPlaceholder];

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
          {editorLines.map((p, i) => (
            <ParameterRow 
              key={`${p.key}-${i}`} 
              position={i}
              paramKey={p.key} 
              value={p.value}
              mode={i === editorLines.length-1 ? 'insert' : 'edit'}
              onDelete={deleteParamHandler}
              onInsert={(key, value) => setParameters([...parameters, {key, value, enabled: true}])}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ParameterEditor
import {useState} from 'react';
import './index.scss';

import { Param } from "./index";
import {ParameterRow, NewParemeterRow} from './parameters-row';


export type ParameterEditorProps = {
  height: number,
  width: number,
  params: {
    key: string,
    value: any
  }[]
}

const isParameterOnPosition = (key: string, position: number) => (param: Param, index: number) => {
  return param.key === key && index === position;
}

function ParameterEditor(props: ParameterEditorProps) {
  const [parameters, setParameters] = useState(props.params)

  const deleteParamHandler = (key: string, position: number) => {
    const paramFilter = isParameterOnPosition(key, position);
    const updatedParams = parameters.filter((p, i) => !paramFilter(p, i));

    setParameters(updatedParams);
  }
  
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
          {parameters.map((p, i) => (
            <ParameterRow 
              key={i} 
              position={i}
              paramKey={p.key} 
              value={p.value} 
              onDelete={deleteParamHandler}
            />
          ))}
          <NewParemeterRow onNewParameter={(key, value) => setParameters([...parameters, {key, value}])} />
        </tbody>
      </table>
    </div>
  )
}

export default ParameterEditor
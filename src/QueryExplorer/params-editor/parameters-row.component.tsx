
import {FormEvent} from 'react';
import { ReactComponent as DeleteIcon } from './delete.svg';

export type ParameterRowMode = "edit" | "insert";

type ParameterRowProps = {
  paramKey: string,
  value: any,
  enabled: boolean,
  mode: ParameterRowMode,
  onDelete: () => void,
  onInsert: (key: string, value: any) => void,
  onChange: (key: string, value: any, enabled: boolean) => void,
}

export function ParameterRow(props: ParameterRowProps) {
  const { mode, onDelete, paramKey: key, value, enabled } = props;

  const propagateChange = (key: string, value: any, enabled: boolean) => {
    switch (mode) {
      case "insert":
        props.onInsert(key, value);
        break;
      case "edit":
        props.onChange(key, value, enabled);
        break;
    }
  }

  const keyHandler = (e: FormEvent<HTMLInputElement>) => {
    const updatedKey = e.currentTarget.value;
    propagateChange(updatedKey, value, enabled);
  }

  const valueHandler = (e: FormEvent<HTMLInputElement>) => {
    const updatedValue = e.currentTarget.value;
    propagateChange(key, updatedValue, enabled);
  }

  const enableHandler = (e: FormEvent<HTMLInputElement>) => {
    const updatedEnabled = e.currentTarget.checked;
    propagateChange(key, value, updatedEnabled);
  }
  
  return (
    <tr className={enabled ? '' : 'params-editor__input--disabled'}>
      <td>
        {mode === "edit" && (
          <input 
            className="params-editor__input params-editor__input--enable" 
            type="checkbox" 
            name="enable" 
            checked={enabled} 
            onChange={enableHandler} 
          />
        )}
      </td>
      <td>
        <input 
          className="params-editor__input" 
          type="text" 
          placeholder={mode === "insert" ? "Key" : ""}
          value={key} 
          onChange={keyHandler} 
        />
      </td>
      <td>
        <input 
          className="params-editor__input params-editor__input--value" 
          type="text" 
          placeholder={mode === "insert" ? "Value" : ""}
          value={value} 
          onChange={valueHandler} 
        />
        
        {mode === "edit" && (
          <DeleteIcon onClick={() => onDelete()} className="params-editor__input--delete" />
        )}
      </td>
    </tr>
  )
}


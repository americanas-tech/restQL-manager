
import {FormEvent, useState} from 'react';
import { ReactComponent as DeleteIcon } from './delete.svg';

export type ParameterRowMode = "edit" | "insert";

type ParameterRowProps = {
  paramKey: string,
  value: any,
  position: number,
  mode: ParameterRowMode,
  onDelete: (key: string, position: number) => void,
  onInsert: (key: string, value: any) => void
}

export function ParameterRow(props: ParameterRowProps) {
  const { position, mode, onDelete } = props;

  const [enabled, setEnabled] = useState(true)
  const [key, setKey] = useState(props.paramKey);
  const [value, setValue] = useState<any>(props.value);

  const keyHandler = (e: FormEvent<HTMLInputElement>) => {
    const updatedKey = e.currentTarget.value;
    setKey(updatedKey)
    if (mode === "insert") {
      props.onInsert(updatedKey, value);
    }
  }

  const valueHandler = (e: FormEvent<HTMLInputElement>) => {
    const updatedValue = e.currentTarget.value;
    setValue(updatedValue)
    if (mode === "insert") {
      props.onInsert(key, updatedValue);
    }
  }


  const enableHandler = (e: FormEvent<HTMLInputElement>) => {
    setEnabled(e.currentTarget.checked);
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
          <DeleteIcon onClick={() => onDelete(key, position)} className="params-editor__input--delete" />
        )}
      </td>
    </tr>
  )
}


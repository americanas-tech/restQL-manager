
import {FormEvent, useState} from 'react';
import { ReactComponent as DeleteIcon } from './delete.svg';

type ParameterRowProps = {
  paramKey: string,
  value: any,
  position: number,
  onDelete: (key: string, position: number) => void
}

export function ParameterRow(props: ParameterRowProps) {
  const { paramKey, value, position, onDelete } = props;

  const [enabled, setEnabled] = useState(true)

  const enableHandler = (e: FormEvent<HTMLInputElement>) => {
    setEnabled(e.currentTarget.checked);
  }
  
  return (
    <tr className={enabled ? '' : 'params-editor__input--disabled'}>
      <td>
        <input 
          className="params-editor__input params-editor__input--enable" 
          type="checkbox" 
          name="enable" 
          checked={enabled} 
          onChange={enableHandler} 
        />
      </td>
      <td>
        <input className="params-editor__input" type="text" value={paramKey} />
      </td>
      <td>
        <input className="params-editor__input params-editor__input--value" type="text" value={value} />
        <DeleteIcon onClick={() => onDelete(paramKey, position)} className="params-editor__input--delete" />
      </td>
    </tr>
  )
}

type NewParameterRowProps = {
  onNewParameter: (key: string, value: any) => void
}

export function NewParemeterRow(props: NewParameterRowProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState<any>();

  const clear = () => {
    setKey("");
    setValue("");
  }

  const keyHandler = (e: FormEvent<HTMLInputElement>) => {
    props.onNewParameter(e.currentTarget.value, value);
    clear();
  }

  const valueHandler = (e: FormEvent<HTMLInputElement>) => {
    props.onNewParameter(key, e.currentTarget.value);
    clear();
  }

  return (
    <tr>
      <td></td>
      <td>
        <input 
          className="params-editor__input params-editor__input--new" 
          type="text" 
          placeholder="Key"
          value={key}
          onChange={keyHandler}
        />
      </td>
      <td>
        <input 
          className="params-editor__input params-editor__input--new" 
          type="text" 
          placeholder="Value"
          value={value}
          onChange={valueHandler}
        />
      </td>
    </tr>
  )
}

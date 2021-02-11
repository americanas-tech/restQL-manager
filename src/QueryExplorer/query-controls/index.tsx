
import { useState } from "react";

import './index.scss';
import { ReactComponent as MenuIcon } from './menu.svg';
import Select, {components, InputActionMeta, InputProps} from 'react-select';

const Input = (props: InputProps) => <components.Input {...props} isHidden={false} />;

// Source: https://github.com/JedWatson/react-select/issues/1558#issuecomment-738880505
function EditableSelect(props: any) {
  const [option, setOption] = useState<{label: string, value: string} | null>();
  const [inputValue, setInputValue] = useState("");

  const onInputChange = (inputValue: string, { action }: InputActionMeta) => {
    if (action === "input-change") {
      setInputValue(inputValue);
    }
  };

  const onChange = (option: {label: string, value: string} | null) => {
    setOption(option);
    setInputValue(option ? combineOptionAndParams(option.label, inputValue) : "");
  };

  return (
    <Select
      {...props}
      value={option}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onChange={onChange}
      controlShouldRenderValue={false}
      components={{Input}}
      noOptionsMessage={disableNoOptionsMessage}
      filterOption={filterOption}
    />
  );
}

function combineOptionAndParams(option: string, input: string): string {
  if (!Boolean(input)) {
    return option;
  }

  const [_, params] = input.split('?');

  return `${option}?${params}`;
}

const queryTargetRegex = /\/([^?/]*)/gm; 

const filterOption = (candidate: {label: string, value: string, data: any}, input: string) => {
  const matches = input.match(queryTargetRegex) || [];
  if (matches.length >= 2) {
    const namespacedQuery = `${matches[0]}${matches[1]}`
    return candidate.label.includes(namespacedQuery);
  }

  return candidate.label.includes(input);
};

const disableNoOptionsMessage = () => null;

type QueryControlsProps = {
  queries: string[]
}

function QueryControls(props: QueryControlsProps) {
  const options = props.queries.map(q => ({value: q, label: q}))

  return (
    <header className="query-controls">
      <div>
        <MenuIcon className="query-controls__menu" />
      </div>
      <div className="query-controls__selector--wrapper">
        <p>{"/run-query"}</p>
        <EditableSelect 
          className="query-controls__selector" 
          classNamePrefix="query-controls__selector" 
          options={options} 
          escapeClearsValue={true}
          backspaceRemovesValue={true}
          isClearable={true}
          placeholder="Queries..."
        />
      </div>
      <div className="query-controls__actions--wrapper">
        <button>Run</button>
        <button>Save</button>
      </div>
    </header>
  )
}

export default QueryControls
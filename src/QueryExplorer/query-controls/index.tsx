
import { useState, useEffect } from "react";

import './index.scss';
import { ReactComponent as MenuIcon } from './menu.svg';
import Select, {components, InputActionMeta, InputProps} from 'react-select';
import { useManagerState } from "../../manager.context";
import { Query, QueryRevision, stringifyQueryRevision } from "../queries";
import { Param, parseParams, stringifyParams } from "../parameters";

type option = {
  label: string,
  value: QueryRevision
}

const Input = (props: InputProps) => <components.Input {...props} isHidden={false} />;

type EditableSelect = {
  selectedQuery: QueryRevision | null,
  options: option[],
  params: Param[],
  onChange: (query: QueryRevision, params: Param[]) => void,
}

// Source: https://github.com/JedWatson/react-select/issues/1558#issuecomment-738880505
function EditableSelect(props: EditableSelect) {
  const defaultOption = props.selectedQuery ? { label: stringifyQueryRevision(props.selectedQuery), value: props.selectedQuery} : null;
  const [option, setOption] = useState<option | null>(defaultOption);
  
  const enabledParams = props.params.filter(p => p.enabled);
  const queryParams = stringifyParams(enabledParams);

  const defaultOptionLabel = defaultOption?.label || "";
  const defaultInputValue = Boolean(queryParams) ? `${defaultOptionLabel}?${queryParams}` : defaultOptionLabel;
  const [inputValue, setInputValue] = useState(defaultInputValue);

  useEffect(() => {
    if (!option) {
      return
    }

    const newInputValue = Boolean(queryParams) ? `${option.label}?${queryParams}` : option.label;
    setInputValue(newInputValue);
  }, [queryParams]);

  useEffect(() => {
    if (props.selectedQuery) {
      const label = stringifyQueryRevision(props.selectedQuery);
      setOption({ label: label, value: props.selectedQuery});

      const newInputValue = Boolean(queryParams) ? `${label}?${queryParams}` : label;
      setInputValue(newInputValue);
    }
  }, [props.selectedQuery])

  const onInputChange = (inputValue: string, { action }: InputActionMeta) => {
    if (action !== "input-change") {
      return;
    }
    setInputValue(inputValue);

    if (!option) {
      return
    }

    const originalParams = props.params;
    const inputParams = parseParams(inputValue);
    
    const updatedParams = mergeParams(originalParams, inputParams);

    props.onChange(option.value, updatedParams);
  };

  const onChange = (option: option | null) => {
    if (!option) {
      return
    }

    setOption(option);

    const newInputValue = Boolean(queryParams) ? `${option.label}?${queryParams}` : option.label;
    setInputValue(newInputValue);

    props.onChange(option.value, props.params);
  };

  const selectedNamespace = props.selectedQuery?.namespace || "";
  const selectedQueryName = props.selectedQuery?.name || "";

  return (
    <Select
      {...props}
      className="query-controls__selector" 
      classNamePrefix="query-controls__selector"
      value={option}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onChange={onChange}
      controlShouldRenderValue={false}
      components={{Input}}
      noOptionsMessage={disableNoOptionsMessage}
      filterOption={filterOption(selectedNamespace, selectedQueryName)}
      escapeClearsValue={true}
      backspaceRemovesValue={true}
      isClearable={true}
      placeholder="Queries..."
    />
  );
}

function mergeParams(original: Param[], input: Param[]): Param[] {
  let updatedParams = [];
  let updatedIndex = 0;

  for (let originalIndex = 0; originalIndex < original.length; originalIndex++) {
    const p = original[originalIndex];
    if (!p.enabled) {
      updatedParams.push(p);
      continue
    }

    updatedParams.push(input[updatedIndex]);
    updatedIndex++;
  }

  const newParams = input.slice(updatedIndex, input.length);
  updatedParams = updatedParams.concat(newParams);

  return updatedParams;
}

const queryTargetRegex = /\/([^?/]*)/gm; 

const filterOption = (selectedNamespace: string, selectedQuery: string) => (candidate: {label: string, value: string, data: any}, input: string): boolean => {
  if (!Boolean(input) && !Boolean(selectedNamespace) && !Boolean(selectedQuery)) {
    return false;
  }

  if (!Boolean(input) && Boolean(selectedNamespace) && Boolean(selectedQuery)) {
    const namespacedQuery = `${selectedNamespace}/${selectedQuery}`
    return candidate.label.includes(namespacedQuery);
  }
  
  const matches = input.match(queryTargetRegex) || [];
  if (matches.length >= 2) {
    const namespacedQuery = `${matches[0]}${matches[1]}`
    return candidate.label.includes(namespacedQuery);
  }

  return candidate.label.includes(input);
};

const disableNoOptionsMessage = () => null;

type QueryControlsProps = {
  params: Param[],
  disableActions: {run: boolean, save: boolean},
  onChange: (query: QueryRevision, params: Param[]) => void,
  onRun: () => void,
  onSave: () => void,
  onMenuOpen: () => void
}

function QueryControls(props: QueryControlsProps) {
  const {queries, selectedQuery} = useManagerState()
  const options = getOptions(queries);

  return (
    <header className="query-controls">
      <div>
        <MenuIcon style={{cursor: 'pointer'}} onClick={props.onMenuOpen} className="query-controls__menu" />
      </div>
      <div className="query-controls__selector--wrapper">
        <p>{"/run-query"}</p>
        <EditableSelect 
          options={options}
          selectedQuery={selectedQuery}
          params={props.params}
          onChange={props.onChange}
        />
      </div>
      <div className="query-controls__actions--wrapper">
        <button disabled={props.disableActions.run} onClick={props.onRun}>Run</button>
        <button disabled={props.disableActions.save} onClick={props.onSave}>Save</button>
      </div>
    </header>
  )
}

function getOptions(queries: Record<string, Query[]>): option[] {
  const options = Object.values(queries).flatMap(namespacedQueries => {
    return namespacedQueries.flatMap(q => {
      return q.revisions.map(r => {
        return buildOptionFromQuery(q, r);
      })
    })
  });

  return options;
}

function buildOptionFromQuery(q: Query, rev: {revision: number, text: string}): option {
  const qr = {name: q.name, namespace: q.namespace, revision: rev.revision, text: rev.text};
  
  return {
    value: qr,
    label: stringifyQueryRevision(qr)
  }
}

export default QueryControls
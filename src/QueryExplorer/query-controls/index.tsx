
import { useState, useEffect } from "react";

import './index.scss';
import { ReactComponent as MenuIcon } from './menu.svg';
import Select, {components, InputActionMeta, InputProps} from 'react-select';
import { useQueryExplorerState } from "../explorer.context";
import { Query, QueryRevision, stringifyQueryRevision } from "../queries";
import { Param, parseParams, stringifyParams } from "../parameters";

type option = {
  label: string,
  value: QueryRevision
}

const Input = (props: InputProps) => <components.Input {...props} isHidden={false} />;

type EditableSelect = {
  selectedQuery: Query | null,
  options: option[],
  defaultOption: option | null,
  params: Param[],
  onChange: (query: QueryRevision, params: Param[]) => void,
}

// Source: https://github.com/JedWatson/react-select/issues/1558#issuecomment-738880505
function EditableSelect(props: EditableSelect) {
  const [option, setOption] = useState<option | null>(props.defaultOption);
  const enabledParams = props.params.filter(p => p.enabled);

  const defaultOptionLabel = props.defaultOption?.label || "";
  const queryParams = stringifyParams(enabledParams);
  const defaultInputValue = Boolean(queryParams) ? `${defaultOptionLabel}?${queryParams}` : defaultOptionLabel;
  const [inputValue, setInputValue] = useState(defaultInputValue);

  useEffect(() => {
    if (!option) {
      return
    }

    const newInputValue = Boolean(queryParams) ? `${option.label}?${queryParams}` : option.label;
    setInputValue(newInputValue);
  }, [queryParams]);

  const onInputChange = (inputValue: string, { action }: InputActionMeta) => {
    if (action !== "input-change") {
      return;
    }
    setInputValue(inputValue);

    if (option) {
      const originalParams = props.params;
      const inputParams = parseParams(inputValue);
      
      const updatedParams = mergeParams(originalParams, inputParams);

      props.onChange(option.value, updatedParams);
    }
  };

  const onChange = (option: option | null) => {
    if (!option) {
      return
    }

    setOption(option);

    const newInputValue = Boolean(queryParams) ? `${option.label}?${queryParams}` : option.label;
    setInputValue(newInputValue);
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
  onChange: (query: QueryRevision, params: Param[]) => void,
}

function QueryControls(props: QueryControlsProps) {
  const {queries, selectedQuery} = useQueryExplorerState()
  const options = getOptions(queries);
  const defaultOption = findSelectedQueryOption(options, selectedQuery);

  return (
    <header className="query-controls">
      <div>
        <MenuIcon className="query-controls__menu" />
      </div>
      <div className="query-controls__selector--wrapper">
        <p>{"/run-query"}</p>
        <EditableSelect 
          options={options}
          selectedQuery={selectedQuery}
          defaultOption={defaultOption}
          params={props.params}
          onChange={props.onChange}
        />
      </div>
      <div className="query-controls__actions--wrapper">
        <button>Run</button>
        <button>Save</button>
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

function findSelectedQueryOption(options: option[], query: Query | null): option | null {
  if (!query) {
    return null;
  }

  const queryOptions = options.filter(o => o.value.namespace === query?.namespace && o.value.name === query?.name);

  const selectedOption = queryOptions.reduce((currentOption, selectedOption) => {
    if (currentOption.value.revision > selectedOption.value.revision) {
      return currentOption;
    } else {
      return selectedOption;
    }
  }, {label: "", value: {name: "", namespace: "", text: "", revision: 0}});

  return selectedOption as option;
}

export default QueryControls
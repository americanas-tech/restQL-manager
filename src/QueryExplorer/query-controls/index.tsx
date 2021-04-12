
import { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";

import './index.scss';
import { ReactComponent as MenuIcon } from './menu.svg';
import { ReactComponent as DownIcon } from './down.svg';
import Select, {components, InputActionMeta, InputProps} from 'react-select';
import { useManagerState } from "../../manager.context";
import { Query, QueryRevision } from "../queries";
import { Param, parseParams, stringifyParams } from "../parameters";

type option = {
  label: string,
  value: QueryRevision
}

const Input = (props: InputProps) => <components.Input {...props} isHidden={false} />;

const height = 43;

const MenuList = (props: any) => {
  const { options, children, maxHeight, getValue } = props;
  const [value] = getValue();
  const initialOffset = options.indexOf(value) * height;

  return (
    <List
      width={"100%"}
      height={maxHeight}
      itemCount={children.length}
      itemSize={height}
      initialScrollOffset={initialOffset}
    >
      {({ index, style }) => <div style={style}>{children[index]}</div>}
    </List>
  )
}

type EditableSelectProps = {
  selectedQuery: QueryRevision | null,
  options: option[],
  params: Param[],
  onChange: (query: QueryRevision, params: Param[]) => void,
}

// Source: https://github.com/JedWatson/react-select/issues/1558#issuecomment-738880505
function EditableSelect(props: EditableSelectProps) {
  const defaultOption = props.selectedQuery ? { label: stringifyQueryRevision(props.selectedQuery), value: props.selectedQuery} : null;
  const [option, setOption] = useState<option | null>(defaultOption);
  
  const enabledParams = props.params.filter(p => p.enabled);
  const queryParams = stringifyParams(enabledParams);

  const defaultOptionLabel = defaultOption?.label || "";
  const defaultInputValue = Boolean(queryParams) ? `${defaultOptionLabel}?${queryParams}` : defaultOptionLabel;
  const [inputValue, setInputValue] = useState(defaultInputValue);

  const [reflectParams, setReflectParams] = useState(true);

  useEffect(() => {
    if (!reflectParams) {
      return
    }

    if (option) {
      const newInputValue = Boolean(queryParams) ? `${option.label}?${queryParams}` : option.label;
      setInputValue(newInputValue);
    } else {
      const newInputValue = Boolean(queryParams) ? `?${queryParams}` : ''
      setInputValue(newInputValue);
    }
  }, [queryParams]);

  useEffect(() => {
    if (!reflectParams) {
      return
    }

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

    let choosenOption;

    const [namespace, queryName, revision] = parseQueryRevision(inputValue);
    if (namespace && queryName && revision) {
       const newOption = props.options.find(o => o.value.namespace === namespace && o.value.name === queryName && o.value.revision === revision)
       if (newOption) {
         choosenOption = newOption;
       }
    }

    const originalParams = props.params;
    const inputParams = parseParams(inputValue);
    
    const updatedParams = mergeParams(originalParams, inputParams);

    const qr = choosenOption?.value || option?.value as QueryRevision;
    props.onChange(qr, updatedParams);
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
      onFocus={() => setReflectParams(false)}
      onBlur={() => setReflectParams(true)}
      controlShouldRenderValue={false}
      components={{Input, MenuList}}
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

    const inputedParam = input[updatedIndex];

    // If the param was deleted on editing the input it may not find the index on the input params arrays
    if (inputedParam) {
      updatedParams.push(inputedParam);
      updatedIndex++;
    }
  }

  const newParams = input.slice(updatedIndex, input.length);
  updatedParams = updatedParams.concat(newParams);

  return updatedParams;
}



const filterOption = (selectedNamespace: string, selectedQuery: string) => (candidate: {label: string, value: string, data: any}, input: string): boolean => {
  if (!Boolean(input) && !Boolean(selectedNamespace) && !Boolean(selectedQuery)) {
    return false;
  }

  if (!Boolean(input) && Boolean(selectedNamespace) && Boolean(selectedQuery)) {
    const namespacedQuery = `${selectedNamespace}/${selectedQuery}`
    return candidate.label.includes(namespacedQuery);
  }

  const [namespace, queryName] = parseQueryRevision(input);
  if (namespace && queryName) {
    const namespacedQuery = `/${namespace}/${queryName}`
    return candidate.label.includes(namespacedQuery);
  }

  return candidate.label.includes(input);
};

function stringifyQueryRevision(queryRevision: QueryRevision): string {
  return `/${queryRevision.namespace}/${queryRevision.name}/${queryRevision.revision}`;
}

const queryTargetRegex = /\/([^?/]*)/gm; 

function parseQueryRevision(input: string): [string, string, number] {
  let matches = input.match(queryTargetRegex) || [];
  matches = matches.map(s => s.replace('/', ''));
  return [matches[0] || "", matches[1] || "", parseInt(matches[2] || "") || 0];
}

const disableNoOptionsMessage = () => null;

type QueryControlsProps = {
  params: Param[],
  disableActions: {run: boolean, save: boolean, archive: boolean},
  onChange: (query: QueryRevision, params: Param[]) => void,
  onRun: () => void,
  onSave: () => void,
  onMenuOpen: () => void,
  onArchiveQuery: () => void,
  onArchiveRevision: () => void,
}

function QueryControls(props: QueryControlsProps) {
  const {queries, archivedQueries, selectedQuery} = useManagerState();
  let options = getOptions(queries);

  if (selectedQuery?.archived) {
    const archivedOptions = getOptions(archivedQueries);
    options = [...options, ...archivedOptions].sort();
  }

  const [showArchiveActions, setShowArchiveActions] = useState(false);

  const handleAction = (handler: () => void) => () => {
    setShowArchiveActions(false);
    handler()
  }

  return (
    <header className="query-controls--wrapper">
      {selectedQuery?.archived && <p className="query-controls__archived-alert">This query is archived!</p>}
      <nav className="query-controls">
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
          <button className="query-controls__actions__run" disabled={props.disableActions.run} onClick={props.onRun}>Run</button>
          <div className="query-controls__actions__mutation">
            <div className="query-controls__actions__mutation__primary-actions">
              <button 
                className={"query-controls__actions__save " + (showArchiveActions ? "query-controls__actions__save--archive-open" : "")} 
                disabled={props.disableActions.save} 
                onClick={props.onSave}>
                  Save
              </button>
              <button 
                className={"query-controls__actions__mutation__menu " + (showArchiveActions ? "query-controls__actions__save--archive-open" : "")}
                disabled={props.disableActions.save} 
                onClick={() => setShowArchiveActions(!showArchiveActions)}
              >
                <DownIcon className="query-controls__actions__mutation__menu__icon" />
              </button>
            </div>
            {showArchiveActions && 
              (
                <ul 
                  className={"query-controls__actions__mutation__archive " + (props.disableActions.archive ? "query-controls__actions__mutation__archive--disabled" : "")}>
                  <li onClick={handleAction(props.onArchiveRevision)}>Archive revision</li>
                  <li onClick={handleAction(props.onArchiveQuery)}>Archive query</li> 
                </ul>
              )}
          </div>
        </div>
      </nav>
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

function buildOptionFromQuery(q: Query, rev: {revision: number, archived: boolean, text: string}): option {
  const qr = {name: q.name, namespace: q.namespace, revision: rev.revision, archived: rev.archived, text: rev.text};
  
  return {
    value: qr,
    label: stringifyQueryRevision(qr)
  }
}

export default QueryControls
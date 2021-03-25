import {  useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lastRevision, Query } from "../queries";
import './query-list.scss';

type QueryListProps = {
  queriesByNamespace: Record<string, Query[]>,
  onQuerySelection: () => void,
}

function QueryList(props: QueryListProps) {
  const {queriesByNamespace} = props;
  const allNamespaces = Object.keys(queriesByNamespace).sort();
  const [namespaces, setNamespaces] = useState(allNamespaces);
  
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [queryFilter, setQueryFilter] = useState("");

  const [search, setSearch] = useState("");
  const updateSearch = (search : string) => {
    const [namespace, query] = search.split('/', 2);
    
    setNamespaces(allNamespaces.filter(n => n.includes(namespace)));
    if (query || search.includes('/')) {
      setSelectedNamespace(namespace);
      setQueryFilter(query);
    } else {
      setSelectedNamespace("");
    }

    setSearch(search);
  }

  return (
    <section className="side-menu__queries">
      <input 
        type="text" 
        name="query-search" 
        placeholder="Search with namespace/query" 
        className="side-menu__queries__input" 
        value={search}
        onChange={(e) => updateSearch(e.currentTarget.value)}
      />
      <ul className="side-menu__query-list">
        {namespaces.map(n => 
          <NamespacedQueries 
            key={n} 
            onQuerySelection={props.onQuerySelection} 
            namespace={n} 
            selectedNamespace={selectedNamespace} 
            queryFilter={queryFilter}  
            queries={queriesByNamespace[n]} 
            />
          )}
      </ul>
    </section>
  );
}

type NamespacedQueriesProps = {
  selectedNamespace: string,
  queryFilter: string,
  namespace: string, 
  queries: Query[],
  onQuerySelection: () => void,
}

function NamespacedQueries(props: NamespacedQueriesProps) {
  const {namespace, selectedNamespace, queries, queryFilter} = props;

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (selectedNamespace === namespace) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNamespace]);

  const filteredQueries = queries.filter(q => q.name.includes(queryFilter));

  return (
    <li key={namespace} className="side-menu__query-list__namespace">
      <span onClick={() => setOpen(!open)}>{namespace}</span>
      <ul className={"side-menu__query-list__namespaced-queries" + (open ? " side-menu__query-list__namespaced-queries--open" : "")}>
        {filteredQueries.map(q => renderLink(q, props.onQuerySelection))}
      </ul>
    </li>
  );
}

function renderLink(query: Query, onQuerySelection: () => void) {
  const target = query.revisions.length === 0 ? "#" : `/query/${query.namespace}/${query.name}/${lastRevision(query.revisions)}`;
  const style = query.revisions.length === 0 ? "side-menu__query-list__query side-menu__query-list__query--disabled" : "side-menu__query-list__query";

  if (query.revisions.length === 0) {
    return (
      <li key={query.name} className={style}>
      <a 
        href={target}
        onClick={() => alert('This query has no eligible revision, please change the archived filter to see its revisions')}>
          {query.name}
      </a>
    </li>
    )
  }

  return (
    <li key={query.name} className={style}>
      <Link 
        to={target}
        onClick={onQuerySelection}>
          {query.name}
      </Link>
    </li>
  )
}

export default QueryList;
import {  useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { lastRevision, Query } from "../queries";
import './query-list.scss';

type QueryListProps = {
  queriesByNamespace: Record<string, Query[]>,
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
        {namespaces.map(n => <NamespacedQueries namespace={n} selectedNamespace={selectedNamespace} queryFilter={queryFilter}  queries={queriesByNamespace[n]} />)}
      </ul>
    </section>
  );
}

type NamespacedQueriesProps = {
  selectedNamespace: string,
  queryFilter: string,
  namespace: string, 
  queries: Query[]
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
        {filteredQueries.map(q => (
          <li key={q.name} className="side-menu__query-list__query">
            <Link to={`/query/${namespace}/${q.name}/${lastRevision(q.revisions)}`}>{q.name}</Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default QueryList;
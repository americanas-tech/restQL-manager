import {  useState } from "react";
import { Query } from "../queries";
import './index.scss';

type QueryListProps = {
  queriesByNamespace: Record<string, Query[]>,
}

function QueryList(props: QueryListProps) {
  const {queriesByNamespace} = props;
  const namespaces = Object.keys(queriesByNamespace);

  return (
    <section className="side-menu__queries">
      <input type="text" name="query-search" placeholder="Search" className="side-menu__queries__input" />
      <ul className="side-menu__query-list">
        {namespaces.map(n => <NamespacedQueries namespace={n} queries={queriesByNamespace[n]} />)}
      </ul>
    </section>
  );
}

type NamespacedQueriesProps = {
  namespace: string, 
  queries: Query[]
}

function NamespacedQueries(props: NamespacedQueriesProps) {
  const {namespace, queries} = props;

  const [open, setOpen] = useState(false);

  return (
    <li key={namespace} className="side-menu__query-list__namespace" onClick={() => setOpen(!open)}>
      <span>{namespace}</span>
      <ul className={"side-menu__query-list__namespaced-queries" + (open ? " side-menu__query-list__namespaced-queries--open" : "")}>
        {queries.map(q => (
          <li key={q.name} className="side-menu__query-list__query">
            <span>{q.name}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default QueryList;
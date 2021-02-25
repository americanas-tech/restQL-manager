
export type Query = {
  namespace: string
  name: string
  revisions: {
    text: string,
    revision: number
  }[]
}

export type QueryRevision = {
  namespace: string,
  name: string,
  text: string,
  revision: number
}

export function stringifyQueryRevision(queryRevision: QueryRevision): string {
  return `/${queryRevision.namespace}/${queryRevision.name}/${queryRevision.revision}`;
}

export function findQueryRevision(namespace: string, queryName: string, revision: string | null, queries: Record<string, Query[]>): QueryRevision | null {
  const namespacedQueries  = queries[namespace];
  if (!namespacedQueries) {
    return null;
  }

  const query = namespacedQueries.find(q => q.name === queryName);
  if (!query) {
    return null;
  }

  const revisionNumber = parseInt(revision || "");
  if (!revisionNumber) {
    const lastRev = query.revisions.length-1;
    const rev = query.revisions[lastRev];

    return {
      namespace: namespace,
      name: queryName,
      text: rev.text,
      revision: rev.revision,
    }
  }

  const chosenRevision = query.revisions.find(r => r.revision === revisionNumber);
  if (!chosenRevision) {
    const lastRev = query.revisions.length-1;
    const rev = query.revisions[lastRev];

    return {
      namespace: namespace,
      name: queryName,
      text: rev.text,
      revision: rev.revision,
    }
  }

  return {
    namespace: namespace,
    name: queryName,
    text: chosenRevision.text,
    revision: chosenRevision.revision,
  }
}

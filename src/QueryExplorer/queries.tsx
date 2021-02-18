
export type Query = {
  namespace: string
  name: string
  revisions: {
    text: string,
    revision: number
  }[]
}

export function stringifyQueryRevision(query: Query, revision: number): string {
  return `/${query.namespace}/${query.name}/${revision}`;
}
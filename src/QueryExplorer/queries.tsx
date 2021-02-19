
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

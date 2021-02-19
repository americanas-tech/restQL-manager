
export type Param = {
  id: string,
  key: string,
  value: any,
  enabled: boolean
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function NewParam(key: string, value: any): Param {
  return {id: uuidv4(), key: key, value: value, enabled: true}
}

export type ChangedParameter = 
  {type: "inserted" | "edited" | "deleted" , parameter: Param}
  | {type: "replaced", parameters: Param[]}


export const parametersReducer = (state: Param[], action: ChangedParameter): Param[] => {
  switch (action.type) {
    case "inserted":
      return [...state, action.parameter];
    case "deleted":
      return state.filter((p) => p.id !== action.parameter.id);
    case "edited":
      return state.map(p => p.id === action.parameter.id ? action.parameter : p);
    case 'replaced':
      return action.parameters;
    default:
      return state;
  }
}

export function stringifyParams(params: Param[]): string {
  return params
    .filter(p => Boolean(p.key) && Boolean(p.value))
    .map(p => `${p.key}=${p.value}`)
    .join('&');
}

export function parseParams(s: string): Param[] {
  if (!s) {
    return [];
  }

  const [_, params] = s.split('?');

  if (!params) {
    return [];
  }

  return params.split('&')
    .map(kv => kv.split(/=(.+)?/, 2))
    .map(([key, value]) => NewParam(key, value));
}
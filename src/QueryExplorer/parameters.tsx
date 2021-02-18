
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

export type ChangedParameter = {type: "inserted" | "edited" | "deleted", parameter: Param}


export const parametersReducer = (state: Param[], action: ChangedParameter): Param[] => {
  switch (action.type) {
    case "inserted":
      return [...state, action.parameter];
    case "deleted":
      return state.filter((p) => p.id !== action.parameter.id);
    case "edited":
      return state.map(p => p.id === action.parameter.id ? action.parameter : p);
    default:
      return state;
  }
}

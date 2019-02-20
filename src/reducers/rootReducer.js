import { combineReducers } from "redux";

import queryReducer from "./queryReducer";
import environmentReducer from "./environmentReducer";
import sidebarReducer from "./sidebarReducer";

const rootReducer = combineReducers({
  environmentReducer,
  queryReducer,
  sidebarReducer
});

export default rootReducer;

import { createImmediatelyInvokedFunctionExpression } from "typescript";
import { ReactComponent as RestqlLogo } from "./logo.svg";

import './index.scss';

function Loading() {
  return (
    <main className="loading">
      <RestqlLogo className="loading__logo" />
    </main>
  )
}

export default Loading
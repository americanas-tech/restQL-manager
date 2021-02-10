import {useState} from 'react';

import Editor from './editor';
import "./App.scss";

type AppProps = {}

function App(props: AppProps) {
  const [code, setCode] = useState("")

  return (
    <div className="main_page">
      <Editor className="main_page__editor" code={"from cart"} onChange={setCode} />
      <textarea className="main_page__result" name="queryResults">{"ausdasdasdasdasdas"}</textarea>
    </div>
  );
}

export default App;

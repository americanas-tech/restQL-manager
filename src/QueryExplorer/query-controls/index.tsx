
import './index.scss';
import { ReactComponent as MenuIcon } from './menu.svg';
import Select from 'react-select';

function QueryControls() {
  const queries = [
    {value: "/demo/httpbin-get/1", label: "/demo/httpbin-get/1"},
    {value: "/demo/demo-product/1", label: "/demo/demo-product/1"},
    {value: "/demo/demo-offer/1", label: "/demo/demo-offer/1"},
    {value: "/demo/demo-sku/1", label: "/demo/demo-sku/1"},
  ]

  return (
    <header className="query-controls">
      <div>
        <MenuIcon className="query-controls__menu" />
      </div>
      <div className="query-controls__selector--wrapper">
        <p>{"/run-query"}</p>
        <Select 
          className="query-controls__selector" 
          classNamePrefix="query-controls__selector" 
          options={queries} 
          escapeClearsValue={true}
          backspaceRemovesValue={true}
          isClearable={true}
          placeholder={"Queries..."}
        />
      </div>
      <div className="query-controls__actions--wrapper">
        <button>Run</button>
        <button>Save</button>
      </div>
    </header>
  )
}

export default QueryControls
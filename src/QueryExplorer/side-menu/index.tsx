import { useState } from "react";
import { ReactComponent as LogoIcon } from './logo.svg';
import ReactModal from 'react-modal';
import { Query, QueryRevision } from "../queries";
import QueryList from './query-list.component';
import './index.scss';
import ResourceList from "./resource-list.component";
import { MappingsByTenant } from "../../manager.context";

export type SideMenuModal = {
  isOpen: boolean,
  selectedQuery: QueryRevision | null,
  queriesByNamespace: Record<string, Query[]>,
  mappings: MappingsByTenant,
  onClose: () => void,
}

type menuMode = 'queries' | 'resources';

function SideMenuModal(props: SideMenuModal) {
  const {isOpen, selectedQuery, onClose} = props;

  const [mode, setMode] = useState<menuMode>('queries');

  const modeToComponent: Record<menuMode, JSX.Element> = {
    'queries': <QueryList queriesByNamespace={props.queriesByNamespace} />,
    'resources': <ResourceList mappings={props.mappings} />,
  }

  return (
    <ReactModal 
        isOpen={isOpen}
        onRequestClose={onClose}
        className="side-menu"
        overlayClassName="side-menu__overlay"
    >
      <LogoIcon className="side-menu__logo" />
      <div className="side-menu__panel">
        <nav className="side-menu__nav">
          <div className={mode === 'queries' ? "side-menu__nav-item side-menu__nav-item--active" : "side-menu__nav-item"}
               onClick={() => setMode('queries')}>
            <h3>Queries</h3>
          </div>
          <div className={mode === 'resources' ? "side-menu__nav-item side-menu__nav-item--active" : "side-menu__nav-item"}
               onClick={() => setMode('resources')}>
            <h3>Resources</h3>
          </div>
        </nav>

        {modeToComponent[mode]}
      </div>
    </ReactModal>
  );
}

export default SideMenuModal;
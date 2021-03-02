import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import './index.scss';
import { getTenants, useManagerDispatch, useManagerState, setResourceOnRestql } from "../manager.context";
import { ReactComponent as PencilIcon } from './pencil.svg';
import ManageResource from './manage-resource';

type mappings = {[resource: string]: {url: string, source: string}};

function ResourceEditor() {
  const managerDispatch = useManagerDispatch();
  const managerState = useManagerState();
  const history = useHistory();

  const tenants = getTenants(managerState.mappings);

  const [mappings, setMappings] = useState<mappings>({});
  const [selectedTenant, setSelectedTenant] = useState("");
  const selectTenant = (tenant: string) => {
    setMappings(managerState.mappings[tenant]);
    setSelectedTenant(tenant);
  }

  useEffect(() => {
    const initialTenant = tenants[0];

    if (initialTenant) {
      selectTenant(initialTenant);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerState.mappings]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mappingToEdit, setMappingToEdit] = useState({name: '', url: ''});

  return (
    <main className="resource-editor">
      <section className="resource-editor__tenants">
        <button className="resource-editor__back" onClick={() => history.goBack()}>Back</button>
        <h2>Tenants</h2>
        <ul className="resource-editor__tenant-list">
          {tenants.map(t => (
            <li onClick={() => selectTenant(t)} className="resource-editor__tenant" key={t}>{t}</li>
          ))}
        </ul>
      </section>
      <section className="resource-editor__mappings">
        <div className="resource-editor__mappings__header">
          <h3>{selectedTenant}</h3>
          <button onClick={() => setModalOpen(true)} className="resource-editor__mappings__new_resource">New Resource</button>
        </div>
        <ul className="resource-editor__mapping-list">
          {Object.keys(mappings).map(resourceName => {
            if (!resourceName) {
              return null
            }

            return (
              <ResourceMapping 
                name={resourceName} 
                url={mappings[resourceName].url} 
                onEdit={(name, url) => {
                  setMappingToEdit({name, url});
                  setModalOpen(true);
                }} 
              />
            );
          })}
        </ul>
      </section>
      <ManageResource
        status={managerState.manageResourceModal.status}
        errorMessage={managerState.manageResourceModal.error}
        
        isOpen={modalOpen}
        tenant={selectedTenant}
        resourceName={mappingToEdit.name}
        resourceUrl={mappingToEdit.url}
        onClose={() => setModalOpen(false)}

        onSave={(tenant, name, url, authCode) => setResourceOnRestql(managerDispatch, tenant, name, url, authCode)}
      />
    </main>
  )
}

type ResourceMappingsProps = {
  name: string,
  url: string,
  onEdit: (name: string, url: string) => void,
}

function ResourceMapping(props: ResourceMappingsProps) {
  const {name, url, onEdit} = props;

  return (
    <li className="resource-editor__mapping" key={name}>
      <div className="resource-editor__mapping__details">
        <p className="resource-editor__mapping__name">{name}</p>
        <p className="resource-editor__mapping__url">{url}</p>
      </div>
      <button onClick={() => onEdit(name, url)} className="resource-editor__mapping__edit">
        <PencilIcon className="resource-editor__mapping__edit__icon" />
      </button>
    </li>
  )
}

export default ResourceEditor

import { FormEvent, useState, useEffect } from "react";
import ReactModal from 'react-modal';
import './index.scss';

export type ManageResourceModalProps = {
  status: 'stale' | 'saving',
  isOpen: boolean,
  tenant: string,
  resourceName: string,
  resourceUrl: string,
  errorMessage: string,
  onSave: (tenant: string, resourceName: string, resourceUrl: string, authorizationCode: string) => void,
  onClose: () => void,
}

const inputChangeHandler = (setter: (value: any) => void) => (e: FormEvent<HTMLInputElement>) => {
  setter(e.currentTarget.value);
}

function ManageResourceModal(props: ManageResourceModalProps) {
  const {status, isOpen, resourceName, resourceUrl, tenant, errorMessage, onSave, onClose} = props;

  const [name, setName] = useState(resourceName);
  const [url, setUrl] = useState(resourceUrl);
  const [code, setCode] = useState("");
  useEffect(() => {
    setName(resourceName);
    setUrl(resourceUrl);
  }, [resourceName, resourceUrl]);

  const closeHandler = () => {
    setCode("");
    onClose();
  }

  const isSaving = status === 'saving';

  return (
    <ReactModal 
        isOpen={isOpen}
        onRequestClose={closeHandler}
        shouldCloseOnOverlayClick={!isSaving}
        className="manage-resource__modal"
        overlayClassName="manage-resource__overlay"
    >
      <h2>Save Resource</h2>
      <div className="manage-resource__modal__tenant">
        <label>Tenant</label>
        <p>{tenant}</p>
      </div>
      <fieldset className="manage-resource__modal__input">
        <label htmlFor="name">Resource Name</label>
        <input 
          disabled={isSaving} 
          type="text" 
          name="name" 
          value={name} 
          onChange={inputChangeHandler(setName)} 
        />
      </fieldset>
      <fieldset className="manage-resource__modal__input">
        <label htmlFor="url">Resource URL</label>
        <input 
          disabled={isSaving} 
          type="text" 
          name="url" 
          value={url} 
          onChange={inputChangeHandler(setUrl)} 
        />
      </fieldset>
      <fieldset className="manage-resource__modal__input">
        <label htmlFor="code">Authorization Code</label>
        <input 
          disabled={isSaving} 
          type="text"
          name="code" 
          value={code} 
          onChange={inputChangeHandler(setCode)} 
        />
      </fieldset>
      <div className="manage-resource__modal__actions">
        {errorMessage && <p className="manage-resource__modal__error">{errorMessage}</p>}
        <button 
          disabled={isSaving} 
          className="manage-resource__modal__actions--secondary" 
          onClick={closeHandler}>
            Close
        </button>
        
        <button 
          disabled={isSaving || !Boolean(name) || !Boolean(url) || !Boolean(code)} 
          className="manage-resource__modal__actions--primary" 
          onClick={() => onSave(tenant, name, url, code)}>
            Save
        </button>
      </div>
    </ReactModal>
  );
}

export default ManageResourceModal;
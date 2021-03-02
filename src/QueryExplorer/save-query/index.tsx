import { FormEvent, useState, useEffect } from "react";
import ReactModal from 'react-modal';
import { QueryRevision } from "../queries";
import './index.scss';

export type SaveQueryModalProps = {
  status: 'stale' | 'saving',
  isOpen: boolean,
  selectedQuery: QueryRevision | null,
  errorMessage: string,
  onSave: (namespace: string, queryName: string) => void,
  onClose: () => void,
}

const inputChangeHandler = (setter: (value: any) => void) => (e: FormEvent<HTMLInputElement>) => {
  setter(e.currentTarget.value);
}

function SaveQueryModal(props: SaveQueryModalProps) {
  const {status, isOpen, selectedQuery, errorMessage, onSave, onClose} = props;

  const [namespace, setNamespace] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    if (selectedQuery) {
      setNamespace(selectedQuery.namespace);
      setName(selectedQuery.name);
    }
  }, [selectedQuery]);

  const isSaving = status === 'saving';

  return (
    <ReactModal 
        isOpen={isOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={!isSaving}
        className="save-query__modal"
        overlayClassName="save-query__overlay"
    >
      <h2>Save Query</h2>
      <fieldset className="save-query__modal__input">
        <label htmlFor="namespace">Namespace</label>
        <input disabled={isSaving} type="text" name="namespace" value={namespace} onChange={inputChangeHandler(setNamespace)} />
      </fieldset>
      <fieldset className="save-query__modal__input">
        <label htmlFor="name">Query Name</label>
        <input disabled={isSaving} type="text" name="name" value={name} onChange={inputChangeHandler(setName)} />
      </fieldset>
      <div className="save-query__modal__actions">
        {errorMessage && <p className="save-query__modal__error">{errorMessage}</p>}
        <button 
          disabled={isSaving} 
          className="save-query__modal__actions--secondary" 
          onClick={onClose}>
            Close
        </button>
        
        <button 
          disabled={isSaving || !Boolean(namespace) || !Boolean(name)} 
          className="save-query__modal__actions--primary" 
          onClick={() => onSave(namespace, name)}>
            Save
        </button>
      </div>
    </ReactModal>
  );
}

export default SaveQueryModal;
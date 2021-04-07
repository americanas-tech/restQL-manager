import { FormEvent, useState, useEffect } from "react";
import ReactModal from 'react-modal';
import { QueryRevision } from "../queries";
import './index.scss';

export type ConfirmationModalProps = {
  disabled: boolean,
  message: string,
  error?: string,
  isOpen: boolean,
  onConfirm: () => void,
  onClose: () => void,
}

function ConfirmationModal(props: ConfirmationModalProps) {
  const {disabled, message, error, isOpen, onConfirm, onClose} = props;

  return (
    <ReactModal 
        isOpen={isOpen}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick={!disabled}
        className="confirmation__modal"
        overlayClassName="confirmation__overlay"
    >
      {message && <p className="confirmation__modal__message">{message}</p>}
      {error && <p className="confirmation__modal__error">{error}</p>}
      <div className="confirmation__modal__actions">
        <button 
          disabled={disabled} 
          className="confirmation__modal__actions--secondary" 
          onClick={onClose}>
            Close
        </button>
        
        <button 
          disabled={disabled} 
          className="confirmation__modal__actions--primary" 
          onClick={onConfirm}>
            Confirm
        </button>
      </div>
    </ReactModal>
  );
}

export default ConfirmationModal;
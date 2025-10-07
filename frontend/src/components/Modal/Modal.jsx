import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-btn cancel-btn">Отмена</button>
                    <button onClick={onConfirm} className="modal-btn confirm-btn">Подтвердить</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;

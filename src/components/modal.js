import React from 'react';

import { toTitleCase } from '../util';
import './modal.css'

const Modal = ({ isShowing, hide, wallets, selectedWallet, setSelectedWallet, presentAuth }) => {

    return (
        <>
            <div className={`modal ${isShowing ? 'visible' : ''}`}>
                <div className='modal-header'>
                    <button type="button" className="modal-close-button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                        <i className="fa-solid fa-l fa-xmark"></i>
                    </button>
                </div>

                <div className='options-container'>

                    {wallets && wallets.map((wallet, index) =>
                        <div key={index} className={`wallet-option ${wallet === selectedWallet ? 'selected' : ''}`} onClick={() => setSelectedWallet(wallet)}>
                            {toTitleCase(wallet)}
                        </div>
                    )}

                </div>

                <div className='modal-footer'>
                    <button className='authorize' onClick={() => { hide(); presentAuth(); }} disabled={!selectedWallet}>Authorize</button>
                </div>

            </div>

        </>
    )
}

export default Modal;
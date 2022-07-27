import React from 'react';

import { toTitleCase } from '../util';
import './modal.css'

const walletImages = {
    eternl: './eternl.png',
    nami: './nami.png',
    flint: './flint.png'
}

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
                            <img className='wallet-option-img' src={walletImages[wallet]}></img>
                            <span className='wallet-option-name'>{toTitleCase(wallet)}</span>
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
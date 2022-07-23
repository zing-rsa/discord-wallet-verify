import ReactDOM from 'react-dom';
import React from 'react';
import './modal.css'

const Modal = ({ isShowing, hide, wallets, selectedWallet, setSelectedWallet, presentAuth }) => {

    return (
        <>
            {isShowing ? ReactDOM.createPortal(
                <React.Fragment>

                    <div className='modal'>
                        <button type="button" className="modal-close-button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                            <span aria-hidden="true">&times;</span>
                        </button>

                        {wallets && wallets.map((wallet, index) =>
                            <div key={index} className={`wallet-option ${wallet == selectedWallet ? 'selected' : '' }`} onClick={() => setSelectedWallet(wallet)}>
                                {wallet}
                            </div>
                        )}

                        <button onClick={() => presentAuth()} disabled={!selectedWallet}>Authorize</button>

                    </div>
                </React.Fragment>, document.body
            ) : null
            }
        </>
    )
}

export default Modal;
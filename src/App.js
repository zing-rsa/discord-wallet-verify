import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom';

import axios from 'axios';

import Loader from './components/loader';
import Modal from './components/modal'
import useModal from './hooks/useModal'
import { BACKEND_URI } from './config'
import './App.css';


function App() {

  const [searchParams, setSearchParams] = useSearchParams();
  const [malformed, setMalformed] = useState(false);

  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState(false);
  const [posting, setPosting] = useState(false);

  const [signError, setSignError] = useState(false);
  const [signWaiting, setSignWaiting] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [wallets, setWallets] = useState(null);
  const [cardano, setCardano] = useState(null);

  const { isShowing, toggle } = useModal();

  const findWallets = useCallback(() => {
    const existingWallets = cardano ? Object.keys(cardano).filter(
      (walletName) =>
        walletName === "nami" ||
        walletName === "eternl" ||
        walletName === "flint"
    ) : [];

    setWallets(existingWallets);
  }, [cardano]);

  const post = useCallback(async (sig, reward_addr) => {
    try {
      setPosting(true);
      setPostError(false);

      let result = await axios({
        method: "POST",
        url: BACKEND_URI + 'api/users/walletregister',
        headers: {
          authorization: searchParams.get('auth') || null
        },
        data: {
          addr: reward_addr,
          key: sig.key,
          sig: sig.signature
        }
      })

      if (result.status === 200)
        setPostSuccess(true);

    } catch (e) {
      console.error(e);
      setPostError(true);
    }
    setPosting(false);
  }, [searchParams]);

  const presentAuth = useCallback(async () => {
    setSignWaiting(true);

    try {

      const api = await cardano[selectedWallet].enable();

      const reward_addr = (await api.getRewardAddresses())[0];

      const sig = await api.signData(reward_addr, searchParams.get('data'));

      post(sig, reward_addr);

    } catch (e) {
      console.error('Error during sig', e);
      setSignError(true);
    } finally {
      setSignWaiting(false);
    }

  }, [cardano, post, searchParams, selectedWallet]);

  const connect = useCallback(() => {
    setSelectedWallet(null);
    toggle();
  }, [toggle]);

  const reset = useCallback(() => {
    setSignError(false);
    setPostError(false);
  }, []);

  const checkParams = useCallback(() => {
    const params = [
      searchParams.get('data'),
      searchParams.get('userid'),
      searchParams.get('username'),
      searchParams.get('auth'),
      searchParams.get('avatar'),
      searchParams.get('bavatar'),
      searchParams.get('buser')
    ];

    if (params.includes(null)) {
      setMalformed(true);
    }

  }, [searchParams]);

  useEffect(() => {
    setTimeout(setCardano((typeof window !== "undefined") && window.cardano), 50);
    checkParams();
  }, [checkParams]);

  useEffect(() => {
    findWallets();
  }, [cardano, findWallets]);

  return (
    <div className='container'>

      {
        !malformed ?
          <>
            <div className='images'>
              <img src={`https://cdn.discordapp.com/avatars/${searchParams.get('buser')}/${searchParams.get('bavatar')}.webp?size=100`} alt='Bot avatar'/>
              <i className="fa-solid fa-xl fa-xmark"></i>
              <img src={`https://cdn.discordapp.com/avatars/${searchParams.get('userid')}/${searchParams.get('avatar')}.webp?size=100`} alt='User avatar' />
            </div>

            <div className='header' >
              <span>Welcome {searchParams.get('username')}!</span>
              <span>Connect your wallet to verify</span>
            </div>

            <div className='interaction'>
              {
                postSuccess &&
                <div className="success-container">
                  <i className="fa-solid fa-4x fa-check"></i>
                  <span className='success-header'>Success!</span>
                  <span className='success-body'>You can close this window.</span>
                </div>
              }

              {
                (posting || signWaiting) && !postSuccess &&
                <div className='loader-container'>
                  <Loader />
                </div>
              }

              {
                ((postError || signError) && !posting && !signWaiting) && !postSuccess &&
                <div className='error-container'>
                  <div className='error-icon-container'>
                    <i className="fa-solid fa-3x fa-circle-exclamation error"></i>
                  </div>
                  <div className='error-text'>
                    <span className='error-text-header'>Unable to obtain signature</span>
                    <span className='error-text-body'>Please try again or ask the bot for a new link.</span>
                  </div>
                  <div className='retry'>
                    <button className='retry-button' onClick={reset}>Retry</button>
                  </div>
                </div>
              }

              {(!postError && !signError && !posting && !signWaiting) && !postSuccess &&
                <div>
                  <button className='connect' onClick={connect}>Connect wallet</button>

                  <Modal
                    isShowing={isShowing}
                    hide={toggle}
                    wallets={wallets}
                    selectedWallet={selectedWallet}
                    setSelectedWallet={setSelectedWallet}
                    presentAuth={presentAuth}
                  />
                </div>
              }

            </div>

            <div className='explainer'>
              <span>
                This application will ask you to sign a piece of data to prove ownership of your wallet. This is not a blockchain transaction, and will not cost any fee. This operation does not grant access to your funds or assets. Read more <a href='https://cips.cardano.org/cips/cip8/' target='_blank' rel='noreferrer' >here</a>.
              </span>
            </div>

          </>
          :
          <div className='malformed'>The link you have used is malformed, please ask the bot for a new link to verify.</div>
      }

    </div>
  );
}

export default App;

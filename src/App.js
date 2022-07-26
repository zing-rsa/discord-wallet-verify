import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom';

import axios from 'axios';

import Modal from './components/modal'
import useModal from './hooks/useModal'
import { BACKEND_URI } from './config'
import './App.css';

function App() {

  console.log('render');
  const [searchParams, setSearchParams] = useSearchParams();

  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState(false);
  const [posting, setPosting] = useState(false);
  const [signError, setSignError] = useState(false);

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
    try {

      const api = await cardano[selectedWallet].enable();

      const reward_addr = (await api.getRewardAddresses())[0];

      const sig = await api.signData(reward_addr, searchParams.get('data'));

      post(sig, reward_addr);

    } catch (e) {
      console.error('Error during sig', e);
      setSignError(true);
    }
  }, [cardano, post, searchParams, selectedWallet]);

  const connect = useCallback(() => {
    setSelectedWallet(null);
    toggle();
  }, [toggle]);

  const reset = useCallback(() => {
    toggle();
    setSignError(false);
  }, [toggle]);

  useEffect(() => {
    setTimeout(setCardano((typeof window !== "undefined") && window.cardano), 50);
  }, []);

  useEffect(() => {
    findWallets();
  }, [cardano, findWallets]);

  return (
    <div>

      <div>Welcome {searchParams.get('username')}!</div>

      <img src={`https://cdn.discordapp.com/avatars/${searchParams.get('userid')}/${searchParams.get('avatar')}.webp?size=100`} />

      {signError &&
        <div>
          <div>
            Error retrieving signature
          </div>
          <button onClick={reset}>retry</button>
        </div>
      }
      {!signError &&
        <div>
          <button onClick={connect}>Connect wallet</button>

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
  );
}

export default App;

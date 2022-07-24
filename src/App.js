import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';

import axios from 'axios';

import Modal from './components/modal'
import useModal from './hooks/useModal'
import './App.css';

function App() {

  console.log('render')

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedWallet, setSelectedWallet] = useState(null);

  const [signError, setSignError] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const [wallets, setWallets] = useState(null);
  const [cardano, setCardano] = useState(null);

  const { isShowing, toggle } = useModal();

  useEffect(() => {
    setCardano((typeof window !== "undefined") && window.cardano);
  }, [])

  useEffect(() => {
    findWallets();
  }, [cardano]);

  const findWallets = () => {

    const existingWallets = cardano ? Object.keys(cardano).filter(
      (walletName) =>
        walletName === "nami" ||
        walletName === "ccvault" ||
        walletName === "eternl" ||
        walletName === "flint"
    ) : [];

    setWallets(existingWallets);
  }

  const presentAuth = async () => {

    console.log(selectedWallet);

    try {

      const api = await cardano[selectedWallet].enable();

      const reward_addr = (await api.getRewardAddresses())[0];

      const sig = await api.signData(rew_addr_hex, searchParams.get('userid'));
      
      post(sig, reward_addr);

    } catch (e) {
      console.error('Error during sig', e);
      setSignError(true);
    }

  }

  const post = (sig, reward_addr) => {

    try {
      setPosting(true);
      setPostError(false);

      let result = await axios({
        method: "POST",
        url: 'http://localhost:3080/api/users/walletregister',
        headers: {
          authorization: searchParams.get('token') || null
        },
        data: {
          addr: reward_addr,
          key: sig.key,
          sig: sig.signature
        }
      })

      if (result.statue == 200)
        setPostSuccess(true);

    } catch (e) {
      console.error(e);
      setPostError(true);
    }

    setPosting(false);

  }

  const connect = () => {
    setSelectedWallet(null);
    toggle();
  }

  const reset = () => {
    toggle();
    setSignError(false);
  }

  return (
    <div>

      <div>Welcome {searchParams.get('name')}!</div>

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

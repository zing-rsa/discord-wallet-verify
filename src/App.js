import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react'

import Modal from './components/modal'
import useModal from './hooks/useModal'

import './App.css';

function App() {

  console.log('render')

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [signError, setSignError] = useState(false);

  const [wallets, setWallets] = useState(null);
  const [cardano, setCardano] = useState(null);

  const { isShowing, toggle } = useModal();

  useEffect(() => {
    setCardano((typeof window !== "undefined") && window.cardano);
  }, [])

  useEffect(() => {
    findWallets();
  }, [cardano]);

  const post = () => {

  }

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
  
      const addr = (await api.getUnusedAddresses())[0];

      console.log(addr);
  
      const sig = await api.signData(addr, searchParams.get('userid'));
  
      if (sig)
        console.log('Success! sig: ', sig)
    } catch (e) {
      console.error('Error during sig', e);
      setSignError(true);
    }

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

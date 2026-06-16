import { useState } from 'react';
import { connectWallet } from '../wallet';

const WALLETS = ['freighter', 'xbull', 'albedo'];

export default function WalletConnect({ onConnect, publicKey }) {
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(null);

  async function handleConnect(walletType) {
    setError(null);
    setConnecting(walletType);
    try {
      const pk = await connectWallet(walletType);
      onConnect(pk, walletType);
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(null);
    }
  }

  if (publicKey) {
    return (
      <div className="wallet-connected">
        <span className="dot green" /> Connected: <code>{publicKey.slice(0, 6)}…{publicKey.slice(-4)}</code>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {WALLETS.map((w) => (
        <button key={w} onClick={() => handleConnect(w)} disabled={!!connecting} className="btn">
          {connecting === w ? 'Connecting…' : w.charAt(0).toUpperCase() + w.slice(1)}
        </button>
      ))}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

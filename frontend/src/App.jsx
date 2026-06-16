import { useState, useCallback } from 'react';
import WalletConnect from './components/WalletConnect';
import BadgeCard from './components/BadgeCard';
import StatusComparison from './components/StatusComparison';
import TxStatus from './components/TxStatus';
import { useBadge } from './hooks/useBadge';
import { useOffChainStats } from './hooks/useOffChainStats';
import { mintBadge, updateBadge } from './contract';
import { signTransaction } from './wallet';
import { WalletError, ContractError, NetworkError, parseError } from './errors';
import { NETWORK_PASSPHRASE } from './config';

export default function App() {
  const [walletInfo, setWalletInfo] = useState({ publicKey: null, walletType: null });
  const [tx, setTx] = useState({ status: 'idle', txHash: null, message: null });
  const { badge, loading: badgeLoading, refetch } = useBadge(walletInfo.publicKey);
  const { stats } = useOffChainStats();

  const signFn = useCallback(
    (xdr) => signTransaction(xdr, walletInfo.walletType, NETWORK_PASSPHRASE),
    [walletInfo.walletType]
  );

  async function handleMint(role, ipfsCid) {
    setTx({ status: 'pending', txHash: null, message: null });
    try {
      const result = await mintBadge(walletInfo.publicKey, role, ipfsCid, signFn);
      setTx({ status: 'success', txHash: result.txHash, message: null });
      refetch();
    } catch (e) {
      const err = parseError(e);
      setTx({ status: 'error', txHash: null, message: err.message });
    }
  }

  async function handleUpdate() {
    setTx({ status: 'pending', txHash: null, message: null });
    try {
      const result = await updateBadge(
        walletInfo.publicKey,
        stats.messagesCount,
        stats.votesCount,
        badge?.ipfs_cid || '',
        signFn
      );
      setTx({ status: 'success', txHash: result.txHash, message: null });
      refetch();
    } catch (e) {
      const err = parseError(e);
      setTx({ status: 'error', txHash: null, message: err.message });
    }
  }

  return (
    <div className="app">
      <header>
        <h1>AuraBadge ✨</h1>
        <p className="subtitle">Your Live Status Profile NFT</p>
      </header>

      <WalletConnect
        publicKey={walletInfo.publicKey}
        onConnect={(pk, wt) => setWalletInfo({ publicKey: pk, walletType: wt })}
      />

      {walletInfo.publicKey && (
        <>
          <BadgeCard badge={badge} loading={badgeLoading} onMint={handleMint} />
          <StatusComparison liveStats={stats} badge={badge} onUpdate={handleUpdate} />
          <TxStatus tx={tx} />
        </>
      )}
    </div>
  );
}

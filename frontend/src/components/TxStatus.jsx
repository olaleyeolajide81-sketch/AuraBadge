export default function TxStatus({ tx }) {
  if (!tx || tx.status === 'idle') return null;

  if (tx.status === 'pending') {
    return (
      <div className="tx-status pending">
        <span className="spinner" /> Transaction pending…
      </div>
    );
  }

  if (tx.status === 'success') {
    return (
      <div className="tx-status success">
        ✅{' '}
        <a href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`} target="_blank" rel="noreferrer">
          {tx.txHash?.slice(0, 12)}…
        </a>
      </div>
    );
  }

  return <div className="tx-status error">❌ {tx.message}</div>;
}

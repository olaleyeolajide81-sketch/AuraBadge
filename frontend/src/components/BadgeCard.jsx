import { useState } from 'react';

const LEVEL_EMOJI = { 1: '🌱', 2: '🔥', 3: '⚡', 4: '🌟', 5: '👑' };

export default function BadgeCard({ badge, loading, onMint }) {
  const [role, setRole] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (loading) return <div className="card">Loading badge…</div>;

  if (!badge) {
    return (
      <div className="card">
        <p>No badge minted yet.</p>
        {!showForm ? (
          <button className="btn primary" onClick={() => setShowForm(true)}>Mint Badge</button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onMint(role, ipfsCid); }} className="mint-form">
            <input placeholder="Role (e.g. member)" value={role} onChange={(e) => setRole(e.target.value)} required />
            <input placeholder="IPFS CID" value={ipfsCid} onChange={(e) => setIpfsCid(e.target.value)} required />
            <button className="btn primary" type="submit">Confirm Mint</button>
            <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="card badge-card">
      <div className="level-icon">{LEVEL_EMOJI[badge.level] || '🌱'}</div>
      <h2>Level {badge.level}</h2>
      <p><strong>Role:</strong> {badge.role}</p>
      <p><strong>Messages:</strong> {badge.messages_count}</p>
      <p><strong>Votes:</strong> {badge.votes_count}</p>
      <p><strong>IPFS:</strong> <code title={badge.ipfs_cid}>{badge.ipfs_cid?.slice(0, 12)}…</code></p>
      <p><strong>Updated:</strong> {new Date(badge.last_updated * 1000).toLocaleString()}</p>
    </div>
  );
}

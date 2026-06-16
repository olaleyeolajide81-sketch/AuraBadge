export default function StatusComparison({ liveStats, badge, onUpdate }) {
  const msgDiff = liveStats.messagesCount > (badge?.messages_count ?? 0);
  const voteDiff = liveStats.votesCount > (badge?.votes_count ?? 0);
  const hasUpdate = msgDiff || voteDiff;

  return (
    <div className="card comparison">
      <div className="col">
        <h3>Live Stats</h3>
        <p className={msgDiff ? 'highlight' : ''}>Messages: {liveStats.messagesCount}</p>
        <p className={voteDiff ? 'highlight' : ''}>Votes: {liveStats.votesCount}</p>
      </div>
      <div className="divider" />
      <div className="col">
        <h3>On-Chain State</h3>
        <p>Messages: {badge?.messages_count ?? '—'}</p>
        <p>Votes: {badge?.votes_count ?? '—'}</p>
      </div>
      {hasUpdate && badge && (
        <button className="btn primary update-btn" onClick={onUpdate}>Update Badge</button>
      )}
    </div>
  );
}

export class WalletError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WalletError';
  }
}

export class ContractError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractError';
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function parseError(err) {
  if (err instanceof WalletError || err instanceof ContractError || err instanceof NetworkError) {
    return err;
  }
  const msg = err?.message || String(err);
  if (msg.includes('wallet') || msg.includes('freighter') || msg.includes('rejected') || msg.includes('not connected')) {
    return new WalletError(msg);
  }
  if (msg.includes('NotFound') || msg.includes('AlreadyMinted') || msg.includes('Unauthorized') || msg.includes('contract')) {
    return new ContractError(msg);
  }
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch') || msg.includes('RPC')) {
    return new NetworkError(msg);
  }
  return new NetworkError(msg);
}

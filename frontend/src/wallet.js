import {
  isConnected,
  getPublicKey as freighterGetPublicKey,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
import { WalletError } from './errors';
import { NETWORK_PASSPHRASE } from './config';

export async function connectWallet(walletType) {
  if (walletType === 'freighter') {
    const connected = await isConnected();
    if (!connected) throw new WalletError('Freighter extension not found or not connected');
    return freighterGetPublicKey();
  }
  if (walletType === 'xbull') {
    // xBull/Albedo SDK integration - install @xbull/sdk or albedo-link
    throw new WalletError('xBull integration not yet configured. Install @xbull/sdk.');
  }
  if (walletType === 'albedo') {
    // xBull/Albedo SDK integration - install @xbull/sdk or albedo-link
    throw new WalletError('Albedo integration not yet configured. Install albedo-link.');
  }
  throw new WalletError(`Unknown wallet type: ${walletType}`);
}

export async function getPublicKey(walletType) {
  if (walletType === 'freighter') {
    try {
      return await freighterGetPublicKey();
    } catch (e) {
      throw new WalletError(e.message);
    }
  }
  throw new WalletError(`Unsupported wallet: ${walletType}`);
}

export async function signTransaction(xdr, walletType, networkPassphrase = NETWORK_PASSPHRASE) {
  if (walletType === 'freighter') {
    try {
      return await freighterSignTransaction(xdr, { networkPassphrase });
    } catch (e) {
      throw new WalletError(`Signing rejected: ${e.message}`);
    }
  }
  throw new WalletError(`Signing not supported for wallet: ${walletType}`);
}

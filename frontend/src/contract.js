import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import { CONTRACT_ID, SOROBAN_RPC_URL, NETWORK_PASSPHRASE } from './config';
import { ContractError, NetworkError } from './errors';

const server = new SorobanRpc.Server(SOROBAN_RPC_URL);
const contract = new Contract(CONTRACT_ID);

async function buildAndSubmit(publicKey, operation, signFn) {
  try {
    const account = await server.getAccount(publicKey);
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    const signed = await signFn(prepared.toXDR());
    const txEnvelope = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(txEnvelope);

    if (result.status === 'ERROR') {
      throw new ContractError(result.errorResult?.toString() || 'Transaction failed');
    }

    // Poll for confirmation
    let response = result;
    for (let i = 0; i < 20 && response.status === 'PENDING'; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      response = await server.getTransaction(result.hash);
    }

    if (response.status === 'SUCCESS') {
      return { status: 'success', txHash: result.hash, data: null };
    }
    throw new ContractError(`Transaction ${response.status}: ${response.resultXdr || ''}`);
  } catch (e) {
    if (e instanceof ContractError) throw e;
    throw new NetworkError(e.message);
  }
}

export async function mintBadge(publicKey, role, ipfsCid, signFn) {
  const op = contract.call(
    'mint',
    new Address(publicKey).toScVal(),
    nativeToScVal(role, { type: 'symbol' }),
    nativeToScVal(ipfsCid, { type: 'string' })
  );
  return buildAndSubmit(publicKey, op, signFn);
}

export async function updateBadge(publicKey, messagesCount, votesCount, ipfsCid, signFn) {
  const op = contract.call(
    'update',
    new Address(publicKey).toScVal(),
    nativeToScVal(messagesCount, { type: 'u64' }),
    nativeToScVal(votesCount, { type: 'u64' }),
    nativeToScVal(ipfsCid, { type: 'string' })
  );
  return buildAndSubmit(publicKey, op, signFn);
}

export async function getBadge(publicKey) {
  try {
    const op = contract.call('get_badge', new Address(publicKey).toScVal());
    const account = await server.getAccount(publicKey);
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
      .addOperation(op)
      .setTimeout(30)
      .build();
    const result = await server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(result)) {
      if (result.error?.includes('NotFound') || result.error?.includes('1')) {
        return { status: 'success', txHash: null, data: null };
      }
      throw new ContractError(result.error);
    }
    const val = result.result?.retval;
    if (!val) return { status: 'success', txHash: null, data: null };
    const native = scValToNative(val);
    return {
      status: 'success',
      txHash: null,
      data: {
        owner: native.owner?.toString(),
        level: Number(native.level),
        role: native.role?.toString(),
        messages_count: Number(native.messages_count),
        votes_count: Number(native.votes_count),
        ipfs_cid: native.ipfs_cid?.toString(),
        last_updated: Number(native.last_updated),
      },
    };
  } catch (e) {
    if (e instanceof ContractError) throw e;
    throw new NetworkError(e.message);
  }
}

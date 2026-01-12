import { 
  BaseMessageSignerWalletAdapter, 
  WalletName, 
  WalletReadyState,
  WalletNotConnectedError,
  WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export const BackpackWalletName = 'Backpack' as WalletName<'Backpack'>;

export class BackpackWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = BackpackWalletName;
  url = 'https://backpack.app';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMCIgZmlsbD0iI0UzMzYzMSIvPjxwYXRoIGQ9Ik03MCAzNUgzMEMyNy43OSAzNSAyNiAzNi43OSAyNiAzOVY2NUMyNiA2Ny4yMSAyNy43OSA2OSAzMCA2OUg3MEM3Mi4yMSA2OSA3NCA2Ny4yMSA3NCA2NVYzOUM3NCAzNi43OSA3Mi4yMSAzNSA3MCAzNVoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTQwIDI1SDYwVjM1SDQwVjI1WiIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjUwIiByPSI1IiBmaWxsPSIjRTMzNjMxIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI1MCIgcj0iNSIgZmlsbD0iI0UzMzYzMSIvPjwvc3ZnPg==';
  supportedTransactionVersions = new Set(['legacy', 0] as const);
  
  private _connecting = false;
  private _publicKey: PublicKey | null = null;
  private _wallet: any = null;

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._publicKey;
  }

  get readyState(): WalletReadyState {
    if (typeof window === 'undefined') return WalletReadyState.Unsupported;
    
    const isBackpackInstalled = !!(window as any).backpack?.solana;
    return isBackpackInstalled ? WalletReadyState.Installed : WalletReadyState.NotDetected;
  }

  async connect(): Promise<void> {
    if (this.connected || this.connecting) return;

    if (this.readyState !== WalletReadyState.Installed) {
      throw new WalletNotReadyError();
    }

    this._connecting = true;

    try {
      const wallet = (window as any).backpack?.solana;
      if (!wallet) throw new WalletNotReadyError();

      const { publicKey } = await wallet.connect();
      this._publicKey = new PublicKey(publicKey.toBytes());
      this._wallet = wallet;

      this.emit('connect', this._publicKey);
    } catch (error: any) {
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this._wallet) {
      try {
        await this._wallet.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }

    this._publicKey = null;
    this._wallet = null;
    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!this._wallet) throw new WalletNotConnectedError();
    return await this._wallet.signTransaction(transaction);
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    if (!this._wallet) throw new WalletNotConnectedError();
    return await this._wallet.signAllTransactions(transactions);
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._wallet) throw new WalletNotConnectedError();
    const { signature } = await this._wallet.signMessage(message);
    return signature;
  }
}

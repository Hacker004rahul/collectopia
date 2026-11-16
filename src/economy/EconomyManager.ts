import { ECONOMY } from '../config/balance';
import { applyGateOperation } from './gateMath';
import type {
  LedgerEntry,
  TransactionRequest,
  TransactionResult,
  TransactionType,
} from './types';

export type BalanceListener = (entry: LedgerEntry) => void;

const DEFAULT_LABELS: Record<TransactionType, string> = {
  coin: 'Gold coin',
  'gate-add': 'Add gate',
  'gate-subtract': 'Subtract gate',
  'gate-multiply': 'Multiply gate',
  'gate-divide': 'Divide gate',
  obstacle: 'Obstacle hit',
  'enemy-damage': 'Enemy hit',
  'enemy-reward': 'Enemy defeated',
};

export class EconomyManager {
  private balanceValue: number;
  private nextId = 1;
  private totalCoinsCollectedValue = 0;
  private readonly claimed = new Set<string>();
  private readonly entries: LedgerEntry[] = [];
  private readonly listeners = new Set<BalanceListener>();

  constructor(startingBalance: number = ECONOMY.startingBalance) {
    this.balanceValue = Math.max(
      ECONOMY.minimumBalance,
      Math.floor(Number.isFinite(startingBalance) ? startingBalance : 0),
    );
  }

  get balance(): number {
    return this.balanceValue;
  }

  get ledger(): readonly LedgerEntry[] {
    return this.entries;
  }

  /** Lifetime coin value collected across all runs (never reduced by gates). */
  get totalCoinsCollected(): number {
    return this.totalCoinsCollectedValue;
  }

  onBalanceChange(listener: BalanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  hasClaimed(sourceId: string): boolean {
    return this.claimed.has(sourceId);
  }

  apply(request: TransactionRequest): TransactionResult {
    if (!request.sourceId) {
      return { applied: false, reason: 'invalid-source' };
    }
    if (this.claimed.has(request.sourceId)) {
      return { applied: false, reason: 'duplicate' };
    }
    if (!Number.isFinite(request.amount)) {
      return { applied: false, reason: 'invalid-amount' };
    }

    const before = this.balanceValue;
    let after = before;

    switch (request.type) {
      case 'coin':
        after = before + request.amount;
        break;
      case 'gate-add':
        after = applyGateOperation(before, 'add', request.amount);
        break;
      case 'gate-subtract':
        after = applyGateOperation(before, 'subtract', request.amount);
        break;
      case 'gate-multiply':
        after = applyGateOperation(before, 'multiply', request.amount);
        break;
      case 'gate-divide':
        after = applyGateOperation(before, 'divide', request.amount);
        break;
      case 'obstacle':
        after = before - request.amount;
        break;
      case 'enemy-damage':
        after = before - request.amount;
        break;
      case 'enemy-reward':
        after = before + request.amount;
        break;
    }

    after = Math.max(ECONOMY.minimumBalance, Math.floor(after));
    const delta = after - before;

    this.claimed.add(request.sourceId);
    this.balanceValue = after;
    if (request.type === 'coin') {
      this.totalCoinsCollectedValue += Math.max(0, request.amount);
    }

    const entry: LedgerEntry = {
      id: this.nextId++,
      type: request.type,
      sourceId: request.sourceId,
      delta,
      balanceBefore: before,
      balanceAfter: after,
      label: request.label ?? DEFAULT_LABELS[request.type],
      timestamp: Date.now(),
    };

    this.entries.push(entry);
    for (const listener of this.listeners) {
      listener(entry);
    }

    return { applied: true, entry };
  }

  /**
   * Resets per-run economy state for a restart while preserving lifetime
   * collected coins used by the gate probability bias.
   */
  resetRun(startingBalance: number = ECONOMY.startingBalance): void {
    this.balanceValue = Math.max(
      ECONOMY.minimumBalance,
      Math.floor(Number.isFinite(startingBalance) ? startingBalance : 0),
    );
    this.nextId = 1;
    this.claimed.clear();
    this.entries.length = 0;
  }
}

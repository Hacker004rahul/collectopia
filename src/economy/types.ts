export type TransactionType =
  | 'coin'
  | 'gate-add'
  | 'gate-subtract'
  | 'gate-multiply'
  | 'gate-divide'
  | 'obstacle'
  | 'enemy-damage'
  | 'enemy-reward';

export interface TransactionRequest {
  type: TransactionType;
  sourceId: string;
  amount: number;
  label?: string;
}

export interface LedgerEntry {
  id: number;
  type: TransactionType;
  sourceId: string;
  delta: number;
  balanceBefore: number;
  balanceAfter: number;
  label: string;
  timestamp: number;
}

export interface TransactionResult {
  applied: boolean;
  entry?: LedgerEntry;
  reason?: 'duplicate' | 'invalid-source' | 'invalid-amount';
}

export type GateOperation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface GateSpec {
  operation: GateOperation;
  value: number;
  symbol: string;
  label: string;
  color: string;
}

const OPERATION_LABEL: Record<GateOperation, string> = {
  add: 'ADD',
  subtract: 'SUBTRACT',
  multiply: 'MULTIPLY',
  divide: 'DIVIDE',
};

const OPERATION_SYMBOL: Record<GateOperation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

const OPERATION_COLOR: Record<GateOperation, string> = {
  add: '#2fbf83',
  subtract: '#e0445e',
  multiply: '#00a86b',
  divide: '#3b82f6',
};

function spec(
  operation: GateOperation,
  value: number,
): GateSpec {
  return {
    operation,
    value,
    symbol: OPERATION_SYMBOL[operation],
    label: OPERATION_LABEL[operation],
    color: OPERATION_COLOR[operation],
  };
}

/** Canonical single variant per operation, kept for compatibility. */
export const GATE_SPECS: Record<GateOperation, GateSpec> = {
  add: spec('add', 100),
  subtract: spec('subtract', 50),
  multiply: spec('multiply', 2),
  divide: spec('divide', 2),
};

/** Every valid gate value required by the gameplay spec. */
export const GATE_VARIANTS: readonly GateSpec[] = [
  spec('add', 100),
  spec('subtract', 50),
  spec('subtract', 100),
  spec('multiply', 1),
  spec('multiply', 2),
  spec('divide', 2),
  spec('divide', 4),
] as const;

export function gateSpecKey(gate: GateSpec): string {
  return `${gate.operation}:${gate.value}`;
}

export function getGateVariant(
  operation: GateOperation,
  value: number,
): GateSpec | undefined {
  return GATE_VARIANTS.find(
    (gate) => gate.operation === operation && gate.value === value,
  );
}

/**
 * Weighted variant tables. Below the threshold every valid option has the
 * same chance. Above it, subtract/divide become more likely but every
 * operation remains available.
 */
const BALANCED_WEIGHTS: Record<string, number> = {
  'add:100': 1,
  'subtract:50': 1,
  'subtract:100': 1,
  'multiply:1': 1,
  'multiply:2': 1,
  'divide:2': 1,
  'divide:4': 1,
};

const HIGH_BALANCE_WEIGHTS: Record<string, number> = {
  'add:100': 10,
  'subtract:50': 24,
  'subtract:100': 18,
  'multiply:1': 6,
  'multiply:2': 10,
  'divide:2': 22,
  'divide:4': 10,
};

export interface GatePairSelection {
  first: GateSpec;
  second: GateSpec;
}

export function selectGatePair(
  totalCoinsCollected: number,
  random: () => number,
  threshold = 200_000,
): GatePairSelection {
  const weights =
    totalCoinsCollected >= threshold ? HIGH_BALANCE_WEIGHTS : BALANCED_WEIGHTS;
  const first = pickWeightedVariant(weights, random());
  const second = pickWeightedVariant(weights, random(), gateSpecKey(first));
  return { first, second };
}

function pickWeightedVariant(
  weights: Record<string, number>,
  roll: number,
  excludeKey?: string,
): GateSpec {
  const candidates = GATE_VARIANTS.filter(
    (gate) => gateSpecKey(gate) !== excludeKey,
  );
  let total = 0;
  for (const gate of candidates) {
    total += weights[gateSpecKey(gate)] ?? 0;
  }

  let cursor = Math.max(0, Math.min(1, roll)) * total;
  for (const gate of candidates) {
    const weight = weights[gateSpecKey(gate)] ?? 0;
    if (weight <= 0) continue;
    cursor -= weight;
    if (cursor <= 0) return gate;
  }
  return candidates[candidates.length - 1];
}

export function formatGate(spec: GateSpec): string {
  return `${spec.symbol}${spec.value}`;
}

export function applyGateOperation(
  balance: number,
  operation: GateOperation,
  value: number,
): number {
  const safeBalance = Number.isFinite(balance) ? Math.floor(balance) : 0;
  const safeValue = Number.isFinite(value) ? value : 0;

  let result = safeBalance;
  switch (operation) {
    case 'add':
      result = safeBalance + safeValue;
      break;
    case 'subtract':
      result = safeBalance - safeValue;
      break;
    case 'multiply':
      result = safeBalance * safeValue;
      break;
    case 'divide':
      result = safeValue > 0 ? safeBalance / safeValue : safeBalance;
      break;
  }

  return Math.max(0, Math.floor(result));
}

export function formatGateCalculation(
  before: number,
  spec: GateSpec,
  after: number,
): string {
  return `${before} ${spec.symbol} ${spec.value} = ${after}`;
}

import { describe, expect, it } from 'vitest';
import { EconomyManager } from '../src/economy/EconomyManager';

describe('EconomyManager', () => {
  it('starts at zero and claims each coin once', () => {
    const economy = new EconomyManager();

    expect(economy.balance).toBe(0);

    const first = economy.apply({
      type: 'coin',
      sourceId: 'coin:1',
      amount: 10,
    });

    expect(first.applied).toBe(true);
    expect(first.entry?.balanceBefore).toBe(0);
    expect(first.entry?.balanceAfter).toBe(10);
    expect(first.entry?.delta).toBe(10);
    expect(economy.balance).toBe(10);

    const duplicate = economy.apply({
      type: 'coin',
      sourceId: 'coin:1',
      amount: 10,
    });

    expect(duplicate.applied).toBe(false);
    expect(duplicate.reason).toBe('duplicate');
    expect(economy.balance).toBe(10);
    expect(economy.ledger).toHaveLength(1);
    expect(economy.hasClaimed('coin:1')).toBe(true);
  });

  it('applies gates once with floor division and a zero balance floor', () => {
    const economy = new EconomyManager(101);

    const divided = economy.apply({
      type: 'gate-divide',
      sourceId: 'gate:1:0',
      amount: 2,
    });
    expect(divided.entry?.balanceAfter).toBe(50);
    expect(divided.entry?.delta).toBe(-51);

    const multiplied = economy.apply({
      type: 'gate-multiply',
      sourceId: 'gate:2:1',
      amount: 3,
    });
    expect(multiplied.entry?.balanceAfter).toBe(150);

    const subtracted = economy.apply({
      type: 'gate-subtract',
      sourceId: 'gate:3:2',
      amount: 500,
    });
    expect(subtracted.entry?.balanceAfter).toBe(0);
    expect(subtracted.entry?.delta).toBe(-150);
    expect(economy.balance).toBe(0);
  });

  it('adds gate values and ignores repeated transaction ids', () => {
    const economy = new EconomyManager();

    const added = economy.apply({
      type: 'gate-add',
      sourceId: 'gate:4:1',
      amount: 100,
    });
    expect(added.entry?.balanceAfter).toBe(100);

    const repeated = economy.apply({
      type: 'gate-add',
      sourceId: 'gate:4:1',
      amount: 100,
    });
    expect(repeated.applied).toBe(false);
    expect(repeated.reason).toBe('duplicate');
    expect(economy.balance).toBe(100);
  });

  it('notifies listeners with each accepted ledger entry', () => {
    const economy = new EconomyManager();
    const observed: number[] = [];

    economy.onBalanceChange((entry) => {
      observed.push(entry.balanceAfter);
    });

    economy.apply({ type: 'coin', sourceId: 'coin:7', amount: 10 });
    economy.apply({ type: 'coin', sourceId: 'coin:8', amount: 10 });

    expect(observed).toEqual([10, 20]);
    expect(economy.ledger.map((entry) => entry.sourceId)).toEqual([
      'coin:7',
      'coin:8',
    ]);
  });

  it('tracks lifetime coins separately from the run balance', () => {
    const economy = new EconomyManager();

    economy.apply({ type: 'coin', sourceId: 'coin:10', amount: 10 });
    economy.apply({ type: 'coin', sourceId: 'coin:11', amount: 20 });
    economy.apply({ type: 'gate-add', sourceId: 'gate:1', amount: 100 });
    expect(economy.totalCoinsCollected).toBe(30);
    expect(economy.balance).toBe(130);

    economy.resetRun();

    expect(economy.balance).toBe(0);
    expect(economy.totalCoinsCollected).toBe(30);
    expect(economy.ledger).toHaveLength(0);
    expect(economy.hasClaimed('coin:10')).toBe(false);
  });

  it('counts multiplied coin values in the lifetime total and in the next run', () => {
    const economy = new EconomyManager();

    economy.apply({ type: 'coin', sourceId: 'coin:21', amount: 20 });
    economy.resetRun();
    expect(economy.totalCoinsCollected).toBe(20);

    economy.apply({ type: 'coin', sourceId: 'coin:21', amount: 20 });
    expect(economy.balance).toBe(20);
    expect(economy.totalCoinsCollected).toBe(40);
  });

  it('rejects malformed requests without changing the balance', () => {
    const economy = new EconomyManager(25);

    expect(
      economy.apply({ type: 'coin', sourceId: '', amount: 10 }).reason,
    ).toBe('invalid-source');
    expect(
      economy.apply({ type: 'coin', sourceId: 'coin:9', amount: Number.NaN }).reason,
    ).toBe('invalid-amount');
    expect(economy.balance).toBe(25);
    expect(economy.ledger).toHaveLength(0);
  });
});

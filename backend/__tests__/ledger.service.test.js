import { assertBalanced } from '../src/services/ledger.service.js';

describe('ledger.service assertBalanced', () => {
  it('passes when debits equal credits', () => {
    expect(() =>
      assertBalanced([
        { debit: 100, credit: 0 },
        { debit: 0, credit: 100 },
      ]),
    ).not.toThrow();
  });

  it('throws when debits and credits do not match', () => {
    expect(() =>
      assertBalanced([
        { debit: 100, credit: 0 },
        { debit: 0, credit: 50 },
      ]),
    ).toThrow(/Debits \(100\) must equal credits \(50\)/);
  });

  it('throws before any DB write would occur (pure validation)', () => {
    let dbWriteAttempted = false;
    const items = [{ debit: 10, credit: 0 }, { debit: 0, credit: 5 }];
    try {
      assertBalanced(items);
      dbWriteAttempted = true;
    } catch {
      // expected
    }
    expect(dbWriteAttempted).toBe(false);
  });
});

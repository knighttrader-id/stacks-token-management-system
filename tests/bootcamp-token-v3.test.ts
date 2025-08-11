import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

describe("Bootcamp Token V3 Contract Tests", () => {
  let deployer: string;
  let wallet1: string;
  let wallet2: string;
  let wallet3: string;

  beforeEach(() => {
    const accounts = simnet.getAccounts();
    deployer = accounts.get('deployer')!;
    wallet1 = accounts.get('wallet_1')!;
    wallet2 = accounts.get('wallet_2')!;
    wallet3 = accounts.get('wallet_3')!;
  });

  describe("Token Metadata", () => {
    it("should return correct token name", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-name',
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.stringAscii("Bootcamp Token V3")));
    });

    it("should return correct token symbol", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-symbol',
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.stringAscii("BTCV3")));
    });

    it("should return correct decimals", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-decimals',
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.uint(6)));
    });

    it("should return correct max supply", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-max-supply',
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.uint(1000000000000)));
    });

    it("should return token URI", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-token-uri',
        [],
        deployer
      );
      expect(result.result).toEqual(
        Cl.ok(Cl.some(Cl.stringUtf8("https://stacksbootcamp.dev/btcv3.json")))
      );
    });
  });

  describe("Initial State", () => {
    it("should have zero total supply initially", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-total-supply',
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.uint(0)));
    });

    it("should not be paused initially", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'is-paused',
        [],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.bool(false)));
    });

    it("should have deployer as authorized minter", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'is-authorized-minter',
        [Cl.principal(deployer)],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
    });

    it("should have zero balance for any user initially", () => {
      const result = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result.result).toEqual(Cl.ok(Cl.uint(0)));
    });
  });

  describe("Mint Function", () => {
    it("should allow contract owner to mint tokens", () => {
      const mintResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000), Cl.principal(wallet1)],
        deployer
      );
      expect(mintResult.result).toEqual(Cl.ok(Cl.bool(true)));

      const balanceResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balanceResult.result).toEqual(Cl.ok(Cl.uint(1000)));
    });

    it("should allow authorized minter to mint tokens", () => {
      // First authorize wallet2 as minter
      const authResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'add-authorized-minter',
        [Cl.principal(wallet2)],
        deployer
      );
      expect(authResult.result).toEqual(Cl.ok(Cl.bool(true)));

      // Now wallet2 should be able to mint
      const mintResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(500), Cl.principal(wallet3)],
        wallet2
      );
      expect(mintResult.result).toEqual(Cl.ok(Cl.bool(true)));

      const balanceResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet3)],
        deployer
      );
      expect(balanceResult.result).toEqual(Cl.ok(Cl.uint(500)));
    });

    it("should reject mint from unauthorized user", () => {
      const mintResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000), Cl.principal(wallet1)],
        wallet1
      );
      expect(mintResult.result).toEqual(Cl.error(Cl.uint(106))); // err-unauthorized
    });

    it("should reject mint of zero amount", () => {
      const mintResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(0), Cl.principal(wallet1)],
        deployer
      );
      expect(mintResult.result).toEqual(Cl.error(Cl.uint(105))); // err-invalid-amount
    });

    it("should reject mint exceeding max supply", () => {
      const mintResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000000000001), Cl.principal(wallet1)],
        deployer
      );
      expect(mintResult.result).toEqual(Cl.error(Cl.uint(104))); // err-exceeds-max-supply
    });
  });

  describe("Transfer Function", () => {
    beforeEach(() => {
      // Mint some tokens to wallet1 for testing
      simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000), Cl.principal(wallet1)],
        deployer
      );
    });

    it("should allow token holder to transfer their tokens", () => {
      const transferResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'transfer',
        [Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(transferResult.result).toEqual(Cl.ok(Cl.bool(true)));

      const balance1 = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance1.result).toEqual(Cl.ok(Cl.uint(500)));

      const balance2 = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet2)],
        deployer
      );
      expect(balance2.result).toEqual(Cl.ok(Cl.uint(500)));
    });

    it("should reject transfer from non-token-owner", () => {
      const transferResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'transfer',
        [Cl.uint(500), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet2
      );
      expect(transferResult.result).toEqual(Cl.error(Cl.uint(101))); // err-not-token-owner
    });

    it("should reject transfer of zero amount", () => {
      const transferResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'transfer',
        [Cl.uint(0), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(transferResult.result).toEqual(Cl.error(Cl.uint(105))); // err-invalid-amount
    });
  });

  describe("Burn Function", () => {
    beforeEach(() => {
      // Mint some tokens to wallet1 for testing
      simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000), Cl.principal(wallet1)],
        deployer
      );
    });

    it("should allow token holder to burn their tokens", () => {
      const burnResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'burn',
        [Cl.uint(300), Cl.principal(wallet1)],
        wallet1
      );
      expect(burnResult.result).toEqual(Cl.ok(Cl.bool(true)));

      const balanceResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balanceResult.result).toEqual(Cl.ok(Cl.uint(700)));
    });

    it("should reject burn from non-token-owner", () => {
      const burnResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'burn',
        [Cl.uint(300), Cl.principal(wallet1)],
        wallet2
      );
      expect(burnResult.result).toEqual(Cl.error(Cl.uint(101))); // err-not-token-owner
    });

    it("should reject burn with insufficient balance", () => {
      const burnResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'burn',
        [Cl.uint(1500), Cl.principal(wallet1)],
        wallet1
      );
      expect(burnResult.result).toEqual(Cl.error(Cl.uint(102))); // err-insufficient-balance
    });
  });

  describe("Pause Functionality", () => {
    beforeEach(() => {
      // Mint some tokens for testing
      simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000), Cl.principal(wallet1)],
        deployer
      );
    });

    it("should allow owner to pause contract", () => {
      const pauseResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'pause-contract',
        [],
        deployer
      );
      expect(pauseResult.result).toEqual(Cl.ok(Cl.bool(true)));

      const isPausedResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'is-paused',
        [],
        deployer
      );
      expect(isPausedResult.result).toEqual(Cl.ok(Cl.bool(true)));
    });

    it("should reject operations when paused", () => {
      // Pause the contract
      simnet.callPublicFn('bootcamp-token-v3', 'pause-contract', [], deployer);

      // Try to transfer (should fail)
      const transferResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'transfer',
        [Cl.uint(100), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(transferResult.result).toEqual(Cl.error(Cl.uint(103))); // err-contract-paused

      // Try to mint (should fail)
      const mintResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(100), Cl.principal(wallet2)],
        deployer
      );
      expect(mintResult.result).toEqual(Cl.error(Cl.uint(103))); // err-contract-paused
    });

    it("should allow operations after unpause", () => {
      // Pause and then unpause
      simnet.callPublicFn('bootcamp-token-v3', 'pause-contract', [], deployer);
      simnet.callPublicFn('bootcamp-token-v3', 'unpause-contract', [], deployer);

      // Transfer should work again
      const transferResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'transfer',
        [Cl.uint(100), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(transferResult.result).toEqual(Cl.ok(Cl.bool(true)));
    });
  });

  describe("Allowance System", () => {
    beforeEach(() => {
      // Mint tokens to wallet1
      simnet.callPublicFn(
        'bootcamp-token-v3',
        'mint',
        [Cl.uint(1000), Cl.principal(wallet1)],
        deployer
      );
    });

    it("should allow setting and getting allowances", () => {
      const approveResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'approve',
        [Cl.principal(wallet2), Cl.uint(500)],
        wallet1
      );
      expect(approveResult.result).toEqual(Cl.ok(Cl.bool(true)));

      const allowanceResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-allowance',
        [Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer
      );
      expect(allowanceResult.result).toEqual(Cl.ok(Cl.uint(500)));
    });

    it("should allow transfer-from with sufficient allowance", () => {
      // Approve wallet2 to spend 500 tokens from wallet1
      simnet.callPublicFn(
        'bootcamp-token-v3',
        'approve',
        [Cl.principal(wallet2), Cl.uint(500)],
        wallet1
      );

      // wallet2 transfers from wallet1 to wallet3
      const transferResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'transfer-from',
        [Cl.principal(wallet1), Cl.principal(wallet3), Cl.uint(300)],
        wallet2
      );
      expect(transferResult.result).toEqual(Cl.ok(Cl.bool(true)));

      // Check balances
      const balance1 = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance1.result).toEqual(Cl.ok(Cl.uint(700)));

      const balance3 = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-balance',
        [Cl.principal(wallet3)],
        deployer
      );
      expect(balance3.result).toEqual(Cl.ok(Cl.uint(300)));

      // Check remaining allowance
      const allowanceResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'get-allowance',
        [Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer
      );
      expect(allowanceResult.result).toEqual(Cl.ok(Cl.uint(200)));
    });
  });

  describe("Admin Functions", () => {
    it("should allow owner to add/remove authorized minters", () => {
      // Add wallet1 as authorized minter
      const addResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'add-authorized-minter',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(addResult.result).toEqual(Cl.ok(Cl.bool(true)));

      // Check if wallet1 is now authorized
      const isAuthorizedResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'is-authorized-minter',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isAuthorizedResult.result).toEqual(Cl.ok(Cl.bool(true)));

      // Remove wallet1 as authorized minter
      const removeResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'remove-authorized-minter',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(removeResult.result).toEqual(Cl.ok(Cl.bool(true)));

      // Check if wallet1 is no longer authorized
      const isNotAuthorizedResult = simnet.callReadOnlyFn(
        'bootcamp-token-v3',
        'is-authorized-minter',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isNotAuthorizedResult.result).toEqual(Cl.ok(Cl.bool(false)));
    });

    it("should reject non-owner admin operations", () => {
      const addResult = simnet.callPublicFn(
        'bootcamp-token-v3',
        'add-authorized-minter',
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(addResult.result).toEqual(Cl.error(Cl.uint(100))); // err-owner-only
    });
  });
});

# Bitcoin BTC-Module

<div align="center">

![Bitcoin](https://bitcoin.org/img/icons/logotop.svg?1700824099)

**Bitcoin wallet infrastructure powering [Swapso Wallet](https://swapso.io)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)

</div>

---

## Overview

**BTC-Module** is the Bitcoin wallet engine that powers [Swapso Wallet](https://swapso.io). It handles HD wallet creation, transaction signing, and mnemonic encryption for both managed ("newbie") and self-custody ("pro") modes.

This module provides developers with robust tools for:
- **HD Wallet Creation** - Generate secure Bitcoin wallets using BIP32/BIP39 mnemonic phrases
- **Transaction Management** - Build, sign, and broadcast Bitcoin transactions
- **Key Security** - Enterprise-grade encryption with AWS KMS support


- **HD Wallet** — BIP32/BIP39 compliant, deriving Native SegWit (P2WPKH / `bc1q...`) addresses on path `m/84'/0'/0'/0` (mainnet) or `m/84'/1'/0'/0` (testnet)
- **PSBT Transactions** — Builds, signs, and broadcasts Partially Signed Bitcoin Transactions with weight-based fee estimation and optimal UTXO selection
- **Mnemonic Encryption** — AES-256-GCM with AWS KMS envelope encryption (new wallets) or a static secret (legacy wallets)
- **Address Validation** — Recognizes P2PKH, P2SH, P2WPKH, and P2TR address formats
- **Message Signing** — Bitcoin message protocol with SegWit support (`segwitType: p2wpkh`)
- **Balance & History** — Queries the Blockstream API for balances, UTXOs, and transaction history

### What it does NOT do (yet)

- Generate non-P2WPKH addresses (Legacy, P2SH-SegWit, Taproot)
- Multi-signature wallets
- Lightning Network (handled by a separate service)
- Hardware wallet integration

---

## Project Structure

```
BTC-module/
├── btc-controller/              # Core wallet engine
│   ├── src/
│   │   ├── index.ts             # KeyringController — wallet lifecycle, signing, broadcasting
│   │   ├── config/
│   │   │   └── index.ts         # Network constants & HD derivation paths
│   │   ├── helper/
│   │   │   ├── index.ts         # Helper barrel exports
│   │   │   ├── signTransaction.ts         # PSBT construction & signing
│   │   │   ├── calculateFeeAndInput.ts    # Legacy fee/UTXO estimation
│   │   │   └── utils/
│   │   │       ├── generateAddress.ts     # Derive address at HD index
│   │   │       ├── getAddressFromPk.ts    # Address from WIF private key
│   │   │       ├── getNetwork.ts          # Resolve bitcoinjs network object
│   │   │       ├── calcBip32ExtendedKeys.ts  # Manual BIP32 path traversal
│   │   │       └── transactionSizeCalculator.ts  # Weight-based vByte estimation & UTXO selection
│   │   └── test/
│   │       ├── index.js         # Test suite (mocha/chai)
│   │       └── constants.js     # Testnet mnemonics & addresses
├── mnemonic/
│   ├── index.ts                 # AWS KMS envelope encryption (current)
│   └── index_old.ts             # Legacy AES-256-GCM with static secret
├── bitcoinValidation.ts         # Address format validation & type detection
├── transactionService.ts        # High-level transaction orchestrator
├── wallet-ui/                   # Demo Express.js server + web frontend
│   ├── server.js                # REST API wrapping KeyringController
│   ├── app.js                   # Browser-side wallet UI logic
│   ├── index.html               # Frontend HTML
│   └── package.json             # Dependencies (bitcoinjs-lib, bip32, bip39, etc.)
├── CONTRIBUTING.md
├── IDEAS.md                     # GSoC project ideas
└── LICENSE                      # MIT
```

---

## Quick Start

### Clone & Install

```bash
git clone https://github.com/Swapso-App/BTC-module.git
cd BTC-module/wallet-ui
npm install
```

### Run the demo server

```bash
node server.js
# => Swapso Wallet UI running at http://localhost:3000
```

### Use as a library

```typescript
import { KeyringController, getBalance } from './btc-controller/src';

// Create a wallet from a mnemonic
const controller = new KeyringController({
  mnemonic: 'your twelve word mnemonic phrase goes here for wallet recovery',
  network: 'TESTNET'  // or 'MAINNET'
});

// Derive a new address
const { address } = await controller.addAccount();
console.log(address); // tb1q...

// Check balance
const { balance } = await getBalance(address, 'TESTNET');

// Sign and broadcast a transaction
const { signedTransaction } = await controller.signTransaction({
  from: address,
  to: 'tb1q...recipient',
  amount: 50000,      // satoshis
  satPerByte: 5        // fee rate
});
const { transactionDetails } = await controller.sendTransaction(signedTransaction);
```

---

## API Reference

### KeyringController

The core class. Manages HD key derivation, address generation, transaction signing, and message signing.

#### `new KeyringController({ mnemonic, network })`

| Param | Type | Description |
|-------|------|-------------|
| `mnemonic` | `string` | 12-word BIP39 mnemonic |
| `network` | `'MAINNET' \| 'TESTNET'` | Bitcoin network |

The mnemonic is **not** stored in the internal state after wallet generation. The BIP32 root key is derived and the seed is zeroed.

#### `addAccount(): Promise<{ address: string }>`

Derives the next P2WPKH address from the HD wallet.

#### `getAccounts(): Promise<string[]>`

Returns all derived addresses.

#### `exportPrivateKey(address): Promise<{ privateKey: string }>`

Exports the private key (hex) for a given address. The raw key buffer is zeroed after conversion.

#### `importWallet(privateKeyWIF): Promise<string>`

Imports an external wallet from a WIF-encoded private key. Returns the derived address.

#### `signTransaction({ from, to, amount, satPerByte? }): Promise<{ signedTransaction: string }>`

Builds a PSBT, selects optimal UTXOs, signs all inputs, and returns the serialized transaction hex. Private key material is zeroed after signing.

#### `signMessage(message, address, privateKey?): Promise<{ signedMessage: string }>`

Signs a message using the Bitcoin message protocol with `segwitType: p2wpkh` and random `extraEntropy`.

#### `sendTransaction(txHex): Promise<{ transactionDetails: string }>`

Broadcasts a signed transaction via the Swapso API.

#### `getFees(rawTransaction): Promise<{ transactionSize, fees }>`

Returns fee estimates (slow/standard/fast) from mempool data.

### TransactionService

Higher-level wrapper that checks balance before signing and broadcasting.

```typescript
import { TransactionService } from './transactionService';

const txService = new TransactionService(controller, 'TESTNET');
const result = await txService.executeTransaction({
  from: 'tb1q...', to: 'tb1q...', amount: 50000, satPerByte: 5, networkType: 'TESTNET'
});
// { success: true, txId: '...', message: 'Transaction successful' }
```

### Mnemonic Encryption

```typescript
import { encryptMnemonic, decryptMnemonic } from './mnemonic';

// Encrypt — generates a new mnemonic + encrypts with KMS envelope encryption
const encrypted = await encryptMnemonic();
// { encryptedMnemonic, iv, authTag, encryptedDataKey } (all base64)

// Decrypt
const mnemonic = await decryptMnemonic(encrypted);
```

Plaintext data keys are zeroed immediately after use.

### Address Validation

```typescript
import { validateBitcoinAddress, getAddressType } from './bitcoinValidation';

validateBitcoinAddress('bc1q...');  // true
getAddressType('bc1q...');          // 'P2WPKH (Native Segwit)'
getAddressType('1A1z...');          // 'P2PKH (Legacy)'
```

---

## Wallet-UI REST API

The `wallet-ui/server.js` provides a REST API for the demo frontend. Rate-limited to 30 req/min per IP.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/wallet/create` | Create new wallet (returns mnemonic + address) |
| `POST` | `/api/wallet/restore` | Restore wallet from mnemonic |
| `POST` | `/api/wallet/import-key` | Import wallet from WIF private key |
| `GET` | `/api/wallet/:id/accounts` | List all addresses |
| `GET` | `/api/wallet/:id/balance/:address` | Get balance (confirmed/unconfirmed) |
| `GET` | `/api/wallet/:id/history/:address` | Get transaction history |
| `GET` | `/api/fees?network=TESTNET` | Get current fee estimates |
| `POST` | `/api/wallet/:id/send` | Sign & broadcast transaction |
| `GET` | `/api/wallet/:id/export/:address` | Export private key (disabled by default) |

Private key export requires `ALLOW_PRIVATE_KEY_EXPORT=true` environment variable.

---

## Security Model

### Self-Custody Hardening

This module is designed for self-custody wallets where users control their own keys:

- **Mnemonic never stored in memory** — The mnemonic is used once to derive the BIP32 root key, then discarded. The seed buffer is zeroed immediately after derivation.
- **Private key zeroing** — All private key buffers are zeroed (`Buffer.fill(0)`) after signing operations, message signing, and key export.
- **KMS envelope encryption** — New mnemonics are encrypted with per-wallet AES-256 data keys generated by AWS KMS. The plaintext data key is zeroed after each encrypt/decrypt operation.
- **PSBT signing** — Transactions are built using Partially Signed Bitcoin Transactions (BIP174) with a custom signer that never exposes the raw private key to the PSBT builder.
- **Dust protection** — Transactions enforce the 546-sat dust threshold and validate amounts server-side.
- **Rate limiting** — The wallet-ui server rate-limits to 30 requests/minute per IP.
- **Input validation** — All endpoints validate network type, mnemonic format, WIF key format, and transaction amounts.

### Encryption Details

| Component | Algorithm | Key Size |
|-----------|-----------|----------|
| Mnemonic encryption | AES-256-GCM | 256-bit |
| Key wrapping | AWS KMS envelope | Managed |
| IV generation | `crypto.randomBytes` | 96-bit (12 bytes) |
| Signing | ECDSA secp256k1 | 256-bit |
| HD derivation | HMAC-SHA512 (BIP32) | 512-bit |
| Message signing | Bitcoin message + ECDSA | 256-bit |

### What to be aware of

- The BIP32 **root key** remains in memory for the lifetime of the `KeyringController` instance. If you need defense against memory-dump attacks, consider using a hardware security module.
- The `wallet-ui` demo stores wallet state in an in-memory `Map` — it is not production-grade session management.
- Legacy wallets (pre-KMS) use a static `ENCRYPTION_SECRET` env var, which means all wallets share a single encryption key.

---

## Environment Variables

```bash
# AWS KMS (required for mnemonic encryption)
WALLET_KMS_AWS_REGION=us-east-1
WALLET_KMS_AWS_ACCESS_KEY_ID=your_access_key
WALLET_KMS_AWS_SECRET_ACCESS_KEY=your_secret_key
WALLET_KMS_KEY_ID=your_kms_key_id

# Legacy encryption (only for old wallets)
ENCRYPTION_SECRET=base64_encoded_32_byte_key

# Wallet-UI server
PORT=3000
ALLOW_PRIVATE_KEY_EXPORT=false   # Set to 'true' only for development
```

---

## Testing

```bash
cd btc-controller
npm install
npm test
```

Tests cover: address generation, account management, private key export, message signing with verification, fee estimation, transaction signing, wallet import, and balance queries. All tests use **testnet** mnemonics and addresses.

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) ^6.1.5 | Bitcoin protocol (PSBT, addresses, scripts) |
| [bip32](https://github.com/bitcoinjs/bip32) ^4.0.0 | HD key derivation |
| [bip39](https://github.com/bitcoinjs/bip39) ^3.1.0 | Mnemonic generation & validation |
| [ecpair](https://github.com/bitcoinjs/ecpair) ^2.1.0 | Key pair management |
| [@bitcoinerlab/secp256k1](https://github.com/bitcoinerlab/secp256k1) ^1.0.5 | Elliptic curve operations |
| [bitcoinjs-message](https://github.com/bitcoinjs/bitcoinjs-message) ^2.2.0 | Message signing/verification |
| [@aws-sdk/client-kms](https://github.com/aws/aws-sdk-js-v3) | KMS envelope encryption |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and [IDEAS.md](IDEAS.md) for GSoC project ideas.

```bash
git clone https://github.com/YOUR_USERNAME/BTC-module.git
git checkout -b feature/your-feature-name
# make changes
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

---

## Resources

- [BIP32 — HD Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP39 — Mnemonic Phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 — Multi-Account Hierarchy](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [BIP84 — Native SegWit Derivation](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki)
- [BIP174 — PSBT](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki)

---

## Team & Mentors

**Lead Mentor:** Suraj Singla — [@surajsingla333](https://github.com/surajsingla333)

**Mentors:**
- Aditya Ranjan — [@adityaranjan2005](https://github.com/adityaranjan2005) | aditya@swapso.io
- Aayush Pandey — [@Hsuyaa4518](https://github.com/Hsuyaa4518)
- Karan Gill — [@krn-gill](https://github.com/krn-gill)

---

## License

[MIT](LICENSE) — Copyright (c) 2026 SwapSo

---

**Issues:** [GitHub Issues](https://github.com/Swapso-App/BTC-module/issues) | **Email:** aditya@swapso.io

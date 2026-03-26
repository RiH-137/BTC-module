'use strict';

const assert = require('assert');
const bitcoin = require('bitcoinjs-lib');
const { buildMultiSigTransaction } = require('../src/helper/buildMultiSigTransaction');

const TESTNET = bitcoin.networks.testnet;
const RECIPIENT = 'tb1qcen5y7uvp3r9y0c4l4c55hlaks8gef54pr6v68';
const CHANGE = 'tb1qt3vyrqgy7emqcr8sjr39zcjdca7grfer7lvxhp';

function makeUtxo(txidChar, value) {
  return {
    txid: txidChar.repeat(64),
    vout: 0,
    value,
    scriptPubKey: bitcoin.address.toOutputScript(CHANGE, TESTNET).toString('hex'),
  };
}

describe('buildMultiSigTransaction', () => {
  it('builds outputs and change correctly with explicit feeInSats', () => {
    const result = buildMultiSigTransaction({
      network: TESTNET,
      requiredSignatures: 2,
      totalSigners: 3,
      feeInSats: 500,
      changeAddress: CHANGE,
      utxos: [
        makeUtxo('a', 4000),
        makeUtxo('b', 7000),
        makeUtxo('c', 8000),
      ],
      outputs: [{ address: RECIPIENT, value: 10000 }],
    });

    assert.strictEqual(result.inputCount, 2);
    assert.strictEqual(result.selectedUTXOs.length, 2);
    assert.strictEqual(result.totalInputValue, 15000);
    assert.strictEqual(result.totalOutputValue, 10000);
    assert.strictEqual(result.feeInSats, 500);
    assert.strictEqual(result.changeAmount, 4500);
    assert.strictEqual(result.psbt.txInputs.length, 2);
    assert.strictEqual(result.psbt.txOutputs.length, 2);
    assert.strictEqual(result.outputCount, 2);
  });

  it('estimates fee when feeRate is provided and feeInSats is omitted', () => {
    const result = buildMultiSigTransaction({
      network: TESTNET,
      requiredSignatures: 2,
      totalSigners: 3,
      feeRate: 2,
      changeAddress: CHANGE,
      utxos: [makeUtxo('d', 12000)],
      outputs: [{ address: RECIPIENT, value: 5000 }],
    });

    assert.strictEqual(result.inputCount, 1);
    assert.ok(result.feeInSats > 0);
    assert.ok(result.changeAmount > 0);
    assert.strictEqual(result.psbt.txOutputs.length, 2);
  });

  it('does not add a change output when no changeAddress is provided', () => {
    const result = buildMultiSigTransaction({
      network: TESTNET,
      requiredSignatures: 2,
      totalSigners: 3,
      feeInSats: 500,
      utxos: [makeUtxo('e', 7000)],
      outputs: [{ address: RECIPIENT, value: 3000 }],
    });

    assert.strictEqual(result.psbt.txOutputs.length, 1);
    assert.strictEqual(result.changeAmount, 0);
    assert.strictEqual(result.feeInSats, 4000);
  });

  it('throws when output value is invalid', () => {
    assert.throws(
      () =>
        buildMultiSigTransaction({
          network: TESTNET,
          requiredSignatures: 2,
          totalSigners: 3,
          feeInSats: 300,
          utxos: [makeUtxo('f', 2000)],
          outputs: [{ address: RECIPIENT, value: 0 }],
        }),
      /Invalid output value/
    );
  });

  it('throws when selected UTXOs cannot cover outputs and fee', () => {
    assert.throws(
      () =>
        buildMultiSigTransaction({
          network: TESTNET,
          requiredSignatures: 2,
          totalSigners: 3,
          feeInSats: 300,
          utxos: [makeUtxo('g', 1000), makeUtxo('h', 1200)],
          outputs: [{ address: RECIPIENT, value: 2500 }],
        }),
      /Insufficient funds/
    );
  });
});

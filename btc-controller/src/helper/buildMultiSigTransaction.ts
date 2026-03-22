import * as bitcoin from "bitcoinjs-lib";

export interface MultiSigInputUTXO {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: string;
  witnessScript?: string;
  redeemScript?: string;
}

export interface MultiSigOutput {
  address: string;
  value: number;
}

export interface BuildMultiSigTransactionOptions {
  network: bitcoin.networks.Network;
  utxos: MultiSigInputUTXO[];
  outputs: MultiSigOutput[];
  requiredSignatures: number;
  totalSigners: number;
  feeInSats?: number;
  changeAddress?: string;
}

export interface BuildMultiSigTransactionResult {
  psbt: bitcoin.Psbt;
  psbtBase64: string;
  inputCount: number;
  outputCount: number;
  totalInputValue: number;
  totalOutputValue: number;
  changeAmount: number;
}

export function buildMultiSigTransaction(
  options: BuildMultiSigTransactionOptions
): BuildMultiSigTransactionResult {
  const {
    network,
    utxos,
    outputs,
    requiredSignatures,
    totalSigners,
    feeInSats = 0,
    changeAddress,
  } = options;

  if (requiredSignatures < 1 || totalSigners < 1 || requiredSignatures > totalSigners) {
    throw new Error("Invalid multisig signer configuration");
  }

  if (!Array.isArray(utxos) || utxos.length === 0) {
    throw new Error("At least one UTXO is required to build a multisig transaction");
  }

  if (!Array.isArray(outputs) || outputs.length === 0) {
    throw new Error("At least one output is required to build a multisig transaction");
  }

  const psbt = new bitcoin.Psbt({ network });

  utxos.forEach((utxo) => {
    const input: any = {
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: Buffer.from(utxo.scriptPubKey, "hex"),
        value: utxo.value,
      },
    };

    if (utxo.witnessScript) {
      input.witnessScript = Buffer.from(utxo.witnessScript, "hex");
    }

    if (utxo.redeemScript) {
      input.redeemScript = Buffer.from(utxo.redeemScript, "hex");
    }

    psbt.addInput(input);
  });

  outputs.forEach((output) => {
    psbt.addOutput({ address: output.address, value: output.value });
  });

  const totalInputValue = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
  const totalOutputValue = outputs.reduce((sum, output) => sum + output.value, 0);
  const changeAmount = totalInputValue - totalOutputValue - feeInSats;

  if (changeAmount < 0) {
    throw new Error("Insufficient input value to cover outputs and fee");
  }

  // Skeleton behavior: add change output only when a valid change target is supplied.
  if (changeAddress && changeAmount > 0) {
    psbt.addOutput({ address: changeAddress, value: changeAmount });
  }

  return {
    psbt,
    psbtBase64: psbt.toBase64(),
    inputCount: utxos.length,
    outputCount: psbt.txOutputs.length,
    totalInputValue,
    totalOutputValue,
    changeAmount,
  };
}

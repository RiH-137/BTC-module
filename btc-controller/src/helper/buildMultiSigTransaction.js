"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMultiSigTransaction = buildMultiSigTransaction;
const bitcoin = __importStar(require("bitcoinjs-lib"));
function buildMultiSigTransaction(options) {
    const { network, utxos, outputs, requiredSignatures, totalSigners, feeInSats = 0, changeAddress, } = options;
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
        const input = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRNdWx0aVNpZ1RyYW5zYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYnVpbGRNdWx0aVNpZ1RyYW5zYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NBLDREQTBFQztBQTlHRCx1REFBeUM7QUFvQ3pDLFNBQWdCLHdCQUF3QixDQUN0QyxPQUF3QztJQUV4QyxNQUFNLEVBQ0osT0FBTyxFQUNQLEtBQUssRUFDTCxPQUFPLEVBQ1Asa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixTQUFTLEdBQUcsQ0FBQyxFQUNiLGFBQWEsR0FDZCxHQUFHLE9BQU8sQ0FBQztJQUVaLElBQUksa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLFlBQVksR0FBRyxDQUFDLElBQUksa0JBQWtCLEdBQUcsWUFBWSxFQUFFLENBQUM7UUFDcEYsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2hELE1BQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLGlFQUFpRSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFM0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3JCLE1BQU0sS0FBSyxHQUFRO1lBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNoQixXQUFXLEVBQUU7Z0JBQ1gsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUM7Z0JBQzdDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSzthQUNsQjtTQUNGLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN2QixLQUFLLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEIsS0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNuRSxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RSxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRixNQUFNLFlBQVksR0FBRyxlQUFlLEdBQUcsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO0lBRXBFLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsb0ZBQW9GO0lBQ3BGLElBQUksYUFBYSxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUk7UUFDSixVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUMzQixVQUFVLEVBQUUsS0FBSyxDQUFDLE1BQU07UUFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTtRQUNsQyxlQUFlO1FBQ2YsZ0JBQWdCO1FBQ2hCLFlBQVk7S0FDYixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGJpdGNvaW4gZnJvbSBcImJpdGNvaW5qcy1saWJcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTXVsdGlTaWdJbnB1dFVUWE8ge1xyXG4gIHR4aWQ6IHN0cmluZztcclxuICB2b3V0OiBudW1iZXI7XHJcbiAgdmFsdWU6IG51bWJlcjtcclxuICBzY3JpcHRQdWJLZXk6IHN0cmluZztcclxuICB3aXRuZXNzU2NyaXB0Pzogc3RyaW5nO1xyXG4gIHJlZGVlbVNjcmlwdD86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBNdWx0aVNpZ091dHB1dCB7XHJcbiAgYWRkcmVzczogc3RyaW5nO1xyXG4gIHZhbHVlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRNdWx0aVNpZ1RyYW5zYWN0aW9uT3B0aW9ucyB7XHJcbiAgbmV0d29yazogYml0Y29pbi5uZXR3b3Jrcy5OZXR3b3JrO1xyXG4gIHV0eG9zOiBNdWx0aVNpZ0lucHV0VVRYT1tdO1xyXG4gIG91dHB1dHM6IE11bHRpU2lnT3V0cHV0W107XHJcbiAgcmVxdWlyZWRTaWduYXR1cmVzOiBudW1iZXI7XHJcbiAgdG90YWxTaWduZXJzOiBudW1iZXI7XHJcbiAgZmVlSW5TYXRzPzogbnVtYmVyO1xyXG4gIGNoYW5nZUFkZHJlc3M/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRNdWx0aVNpZ1RyYW5zYWN0aW9uUmVzdWx0IHtcclxuICBwc2J0OiBiaXRjb2luLlBzYnQ7XHJcbiAgcHNidEJhc2U2NDogc3RyaW5nO1xyXG4gIGlucHV0Q291bnQ6IG51bWJlcjtcclxuICBvdXRwdXRDb3VudDogbnVtYmVyO1xyXG4gIHRvdGFsSW5wdXRWYWx1ZTogbnVtYmVyO1xyXG4gIHRvdGFsT3V0cHV0VmFsdWU6IG51bWJlcjtcclxuICBjaGFuZ2VBbW91bnQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTXVsdGlTaWdUcmFuc2FjdGlvbihcclxuICBvcHRpb25zOiBCdWlsZE11bHRpU2lnVHJhbnNhY3Rpb25PcHRpb25zXHJcbik6IEJ1aWxkTXVsdGlTaWdUcmFuc2FjdGlvblJlc3VsdCB7XHJcbiAgY29uc3Qge1xyXG4gICAgbmV0d29yayxcclxuICAgIHV0eG9zLFxyXG4gICAgb3V0cHV0cyxcclxuICAgIHJlcXVpcmVkU2lnbmF0dXJlcyxcclxuICAgIHRvdGFsU2lnbmVycyxcclxuICAgIGZlZUluU2F0cyA9IDAsXHJcbiAgICBjaGFuZ2VBZGRyZXNzLFxyXG4gIH0gPSBvcHRpb25zO1xyXG5cclxuICBpZiAocmVxdWlyZWRTaWduYXR1cmVzIDwgMSB8fCB0b3RhbFNpZ25lcnMgPCAxIHx8IHJlcXVpcmVkU2lnbmF0dXJlcyA+IHRvdGFsU2lnbmVycykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtdWx0aXNpZyBzaWduZXIgY29uZmlndXJhdGlvblwiKTtcclxuICB9XHJcblxyXG4gIGlmICghQXJyYXkuaXNBcnJheSh1dHhvcykgfHwgdXR4b3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgVVRYTyBpcyByZXF1aXJlZCB0byBidWlsZCBhIG11bHRpc2lnIHRyYW5zYWN0aW9uXCIpO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFBcnJheS5pc0FycmF5KG91dHB1dHMpIHx8IG91dHB1dHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBvbmUgb3V0cHV0IGlzIHJlcXVpcmVkIHRvIGJ1aWxkIGEgbXVsdGlzaWcgdHJhbnNhY3Rpb25cIik7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwc2J0ID0gbmV3IGJpdGNvaW4uUHNidCh7IG5ldHdvcmsgfSk7XHJcblxyXG4gIHV0eG9zLmZvckVhY2goKHV0eG8pID0+IHtcclxuICAgIGNvbnN0IGlucHV0OiBhbnkgPSB7XHJcbiAgICAgIGhhc2g6IHV0eG8udHhpZCxcclxuICAgICAgaW5kZXg6IHV0eG8udm91dCxcclxuICAgICAgd2l0bmVzc1V0eG86IHtcclxuICAgICAgICBzY3JpcHQ6IEJ1ZmZlci5mcm9tKHV0eG8uc2NyaXB0UHViS2V5LCBcImhleFwiKSxcclxuICAgICAgICB2YWx1ZTogdXR4by52YWx1ZSxcclxuICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHV0eG8ud2l0bmVzc1NjcmlwdCkge1xyXG4gICAgICBpbnB1dC53aXRuZXNzU2NyaXB0ID0gQnVmZmVyLmZyb20odXR4by53aXRuZXNzU2NyaXB0LCBcImhleFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodXR4by5yZWRlZW1TY3JpcHQpIHtcclxuICAgICAgaW5wdXQucmVkZWVtU2NyaXB0ID0gQnVmZmVyLmZyb20odXR4by5yZWRlZW1TY3JpcHQsIFwiaGV4XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHBzYnQuYWRkSW5wdXQoaW5wdXQpO1xyXG4gIH0pO1xyXG5cclxuICBvdXRwdXRzLmZvckVhY2goKG91dHB1dCkgPT4ge1xyXG4gICAgcHNidC5hZGRPdXRwdXQoeyBhZGRyZXNzOiBvdXRwdXQuYWRkcmVzcywgdmFsdWU6IG91dHB1dC52YWx1ZSB9KTtcclxuICB9KTtcclxuXHJcbiAgY29uc3QgdG90YWxJbnB1dFZhbHVlID0gdXR4b3MucmVkdWNlKChzdW0sIHV0eG8pID0+IHN1bSArIHV0eG8udmFsdWUsIDApO1xyXG4gIGNvbnN0IHRvdGFsT3V0cHV0VmFsdWUgPSBvdXRwdXRzLnJlZHVjZSgoc3VtLCBvdXRwdXQpID0+IHN1bSArIG91dHB1dC52YWx1ZSwgMCk7XHJcbiAgY29uc3QgY2hhbmdlQW1vdW50ID0gdG90YWxJbnB1dFZhbHVlIC0gdG90YWxPdXRwdXRWYWx1ZSAtIGZlZUluU2F0cztcclxuXHJcbiAgaWYgKGNoYW5nZUFtb3VudCA8IDApIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkluc3VmZmljaWVudCBpbnB1dCB2YWx1ZSB0byBjb3ZlciBvdXRwdXRzIGFuZCBmZWVcIik7XHJcbiAgfVxyXG5cclxuICAvLyBTa2VsZXRvbiBiZWhhdmlvcjogYWRkIGNoYW5nZSBvdXRwdXQgb25seSB3aGVuIGEgdmFsaWQgY2hhbmdlIHRhcmdldCBpcyBzdXBwbGllZC5cclxuICBpZiAoY2hhbmdlQWRkcmVzcyAmJiBjaGFuZ2VBbW91bnQgPiAwKSB7XHJcbiAgICBwc2J0LmFkZE91dHB1dCh7IGFkZHJlc3M6IGNoYW5nZUFkZHJlc3MsIHZhbHVlOiBjaGFuZ2VBbW91bnQgfSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcHNidCxcclxuICAgIHBzYnRCYXNlNjQ6IHBzYnQudG9CYXNlNjQoKSxcclxuICAgIGlucHV0Q291bnQ6IHV0eG9zLmxlbmd0aCxcclxuICAgIG91dHB1dENvdW50OiBwc2J0LnR4T3V0cHV0cy5sZW5ndGgsXHJcbiAgICB0b3RhbElucHV0VmFsdWUsXHJcbiAgICB0b3RhbE91dHB1dFZhbHVlLFxyXG4gICAgY2hhbmdlQW1vdW50LFxyXG4gIH07XHJcbn1cclxuIl19
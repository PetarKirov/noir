import { abiEncode, InputMap } from '@noir-lang/noirc_abi';
import { base64Decode } from './base64_decode.js';
import { executeCircuit, WitnessMap } from '@noir-lang/acvm_js';
import { CompiledCircuit } from '@noir-lang/types';

// Generates the witnesses needed to feed into the chosen proving system
export async function generateWitness(compiledProgram: CompiledCircuit, inputs: InputMap): Promise<WitnessMap> {
  // Throws on ABI encoding error
  const witnessMap = abiEncode(compiledProgram.abi, inputs);

  // Execute the circuit to generate the rest of the witnesses and serialize
  // them into a Uint8Array.
  try {
    const solvedWitness = await executeCircuit(base64Decode(compiledProgram.bytecode), witnessMap, () => {
      throw Error('unexpected oracle during execution');
    });
    return solvedWitness;
  } catch (err) {
    throw new Error(`Circuit execution failed: ${err}`);
  }
}

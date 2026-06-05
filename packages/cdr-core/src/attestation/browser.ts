/** Browser-safe Automata + fulfill exports (no Node fs/env quote loading). */
export { AENEID_AUTOMATA_DCAP, automataDcapAttestationFeeAbi } from "./aeneid-automata.js";
export { estimateAutomataAttestationValue } from "./dcap-onchain.js";
export {
  fulfillAttestationDomain,
  fulfillAttestationTypes,
  fulfillBindingId,
  hashFulfillAttestation,
  hashFulfillResultPayload,
  verifyFulfillAttestation,
  type FulfillAttestationMessage,
  type StoredFulfillAttestation,
} from "./fulfill-binding.js";
export type { RegistryFulfillAttestation } from "../registry/types.js";

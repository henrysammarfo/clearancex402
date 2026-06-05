// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ICDRReadCondition} from "./interfaces/ICDRReadCondition.sol";

/// @title LineStackMerkleAllowlistReadCondition
/// @notice Beta / allowlist gate for CDR reads.
/// @dev readConditionData = abi.encode(bytes32 merkleRoot)
///      accessAuxData   = abi.encode(bytes32[] proof) for leaf keccak256(abi.encode(address))
contract LineStackMerkleAllowlistReadCondition is ICDRReadCondition {
    function checkReadCondition(
        uint32,
        bytes calldata accessAuxData,
        bytes calldata readConditionData,
        address caller
    ) external pure returns (bool) {
        bytes32 root = abi.decode(readConditionData, (bytes32));
        bytes32[] memory proof = abi.decode(accessAuxData, (bytes32[]));
        bytes32 leaf = _leaf(caller);
        return _verify(proof, root, leaf);
    }

    function _leaf(address account) private pure returns (bytes32) {
        return keccak256(abi.encode(account));
    }

    function _verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) private pure returns (bool) {
        bytes32 computed = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 p = proof[i];
            computed = computed <= p
                ? keccak256(bytes.concat(computed, p))
                : keccak256(bytes.concat(p, computed));
        }
        return computed == root;
    }
}

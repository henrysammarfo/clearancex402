// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ICDRReadCondition} from "./interfaces/ICDRReadCondition.sol";

/// @notice CDR read gate: `readConditionData = abi.encode(address buyer)`.
contract LineStackBuyerReadCondition is ICDRReadCondition {
    function checkReadCondition(
        uint32,
        bytes calldata,
        bytes calldata readConditionData,
        address caller
    ) external pure returns (bool) {
        address buyer = abi.decode(readConditionData, (address));
        return caller == buyer;
    }
}

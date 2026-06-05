// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ICDRWriteCondition} from "./interfaces/ICDRWriteCondition.sol";

/// @notice CDR write gate: `writeConditionData = abi.encode(address publisher)`.
contract LineStackPublisherWriteCondition is ICDRWriteCondition {
    function checkWriteCondition(
        uint32,
        bytes calldata,
        bytes calldata writeConditionData,
        address caller
    ) external pure returns (bool) {
        address publisher = abi.decode(writeConditionData, (address));
        return caller == publisher;
    }
}

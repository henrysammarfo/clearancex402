// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.23;

interface ICDRWriteCondition {
    function checkWriteCondition(
        uint32 uuid,
        bytes calldata accessAuxData,
        bytes calldata writeConditionData,
        address caller
    ) external view returns (bool);
}

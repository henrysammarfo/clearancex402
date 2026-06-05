// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.23;

interface ICDRReadCondition {
    function checkReadCondition(
        uint32 uuid,
        bytes calldata accessAuxData,
        bytes calldata readConditionData,
        address caller
    ) external view returns (bool);
}

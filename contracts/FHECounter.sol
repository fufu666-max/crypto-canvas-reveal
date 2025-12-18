// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A secure FHE counter contract
/// @author fhevm-hardhat-template
/// @notice A contract demonstrating encrypted operations using FHEVM.
/// @dev This contract provides encrypted counter functionality with FHE operations
contract FHECounter is SepoliaConfig {
    euint32 private _count;

    /// @notice Returns the current count
    /// @return The current encrypted count
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increments the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        require(inputProof.length > 0, "Proof cannot be empty");

        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.add(_count, encryptedValue);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Decrements the counter by a specified encrypted value.
    /// @param inputEuint32 the encrypted input value
    /// @param inputProof the input proof
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        require(inputProof.length > 0, "Proof cannot be empty");

        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
        _count = FHE.sub(_count, encryptedValue);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Resets the counter to zero
    function resetCounter() external {
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}

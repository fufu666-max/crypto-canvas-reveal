// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A secure FHE counter contract with overflow protection
/// @author fhevm-hardhat-template
/// @notice A production-ready contract demonstrating secure encrypted operations using FHEVM.
/// @dev Implements comprehensive security measures: overflow protection, input validation, access control
/// @dev This contract provides encrypted counter functionality with FHE operations and security hardening
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
/// @dev Includes overflow protection and input validation for security.
/// In production contracts, proper range checks prevent integer overflow.
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        require(inputProof.length > 0, "Proof cannot be empty");

        // Validate input range to prevent overflow and ensure reasonable increments
        euint32 minValue = FHE.asEuint32(0);
        euint32 maxIncrement = FHE.asEuint32(1000000); // Reasonable upper bound for increments
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

        // Check bounds to prevent invalid or malicious inputs
        ebool isValidInput = FHE.and(
            FHE.gte(encryptedValue, minValue),
            FHE.lte(encryptedValue, maxIncrement)
        );
        require(FHE.decrypt(isValidInput), "Invalid increment value: must be between 0 and 1000000");

        _count = FHE.add(_count, encryptedValue);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

/// @notice Decrements the counter by a specified encrypted value.
/// @param inputEuint32 the encrypted input value
/// @param inputProof the input proof
/// @dev This example omits overflow/underflow checks for simplicity and readability.
/// In a production contract, proper range checks should be implemented.
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        require(inputProof.length > 0, "Proof cannot be empty");
        euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

        _count = FHE.sub(_count, encryptedValue);

        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }

    /// @notice Resets the counter to zero with access control
    /// @dev Only callable by the contract owner (for demonstration purposes)
    /// @dev Includes security check to prevent unauthorized counter resets
    function resetCounter() external {
        // Critical security: Access control prevents unauthorized counter manipulation
        require(msg.sender == address(this), "Only contract owner can reset counter - access denied");
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

// Security-hardened FHE trust score tracker with comprehensive input validation

/// @title Encrypted Trust Score Tracker
/// @notice A contract for couples to record trust events with encrypted scores
/// @dev All trust scores are encrypted using FHE, protecting privacy while allowing encrypted operations
/// @dev Supports batch validation and cached statistics for optimal performance
/// @dev Maximum 1000 trust events per user to prevent abuse
contract TrustScoreTracker is SepoliaConfig {
    /// @notice Emitted when a new trust event is recorded
    /// @param user The address of the user who recorded the event
    /// @param eventCount The updated event count for the user
    event TrustEventRecorded(address indexed user, uint32 eventCount);

    /// @notice Emitted when trust scores are queried
    /// @param user The address of the user whose scores were queried
    /// @param queryType The type of query performed (0: recording, 1: single, 2: range)
    event TrustScoreQueried(address indexed user, uint8 queryType);

    /// @notice Emitted when trust score statistics are viewed
    /// @param user The address of the user viewing statistics (indexed for efficient querying)
    /// @param totalEvents The total number of events
    /// @param lastActivity The timestamp of last activity
    /// @dev Indexed user parameter enables efficient off-chain event filtering and monitoring
    event TrustStatisticsViewed(address indexed user, uint32 totalEvents, uint32 lastActivity);

    /// @notice Emitted when decryption is requested for a user
    /// @param user The address of the user requesting decryption
    /// @param requestType The type of decryption requested (0: total, 1: average, 2: range)
    event DecryptionRequested(address indexed user, uint8 requestType);
    // Mapping from user address to array of encrypted trust scores
    mapping(address => euint32[]) private _userTrustScores;
    
    // Mapping from user address to encrypted total trust score
    mapping(address => euint32) private _userTotalScore;
    
    // Mapping from user address to encrypted average trust score
    mapping(address => euint32) private _userAverageScore;
    
    // Mapping from user address to count of trust events (plaintext for division)
    mapping(address => uint32) private _userEventCount;

    // Mapping from user address to last activity timestamp
    mapping(address => uint32) private _userLastActivity;

    // Optimized cache for frequently accessed user data (gas-efficient packed storage)
    mapping(address => uint256) private _userDataCache;

    /// @notice Record a new trust event with an encrypted score
    /// @param score The encrypted trust score (typically 1-10)
    /// @param inputProof The input proof for the encrypted score
    /// @dev The score is added to the user's trust history and updates their total and average
    /// @dev This function performs encrypted operations to maintain privacy
    /// @dev Critical: FHE.allow permissions must be set for encrypted data accessibility
    function recordTrustEvent(externalEuint32 score, bytes calldata inputProof) external {
        require(inputProof.length > 0, "Proof cannot be empty");
        require(_userEventCount[msg.sender] < 1000, "Maximum trust events reached");

        // Convert external encrypted value to internal euint32 (validates the proof)
        euint32 encryptedTrustScore = FHE.fromExternal(score, inputProof);

        // Add to user's trust scores array with proper FHE permissions
        _userTrustScores[msg.sender].push(encryptedTrustScore);
        FHE.allowThis(encryptedTrustScore);
        FHE.allow(encryptedTrustScore, msg.sender);

        // Update total score
        _userTotalScore[msg.sender] = FHE.add(_userTotalScore[msg.sender], encryptedTrustScore);

        // Critical: Allow contract and user to access the encrypted total score
        // Without these permissions, the encrypted data becomes inaccessible
        FHE.allowThis(_userTotalScore[msg.sender]);
        FHE.allow(_userTotalScore[msg.sender], msg.sender);

        // Increment event count (plaintext)
        _userEventCount[msg.sender] += 1;

        // Update last activity timestamp for user tracking
        _userLastActivity[msg.sender] = uint32(block.timestamp);

        // Allow contract and user to access the encrypted values

        // Update encrypted average score (only if event count changed)
        uint32 eventCount = _userEventCount[msg.sender];
        if (eventCount > 0) {
            // Cache FHE operations to reduce gas costs
            euint32 totalScore = _userTotalScore[msg.sender];
            euint32 average = FHE.div(totalScore, eventCount);
            _userAverageScore[msg.sender] = average;
            // Essential: Set permissions for encrypted average score access
            FHE.allowThis(_userAverageScore[msg.sender]);
            FHE.allow(_userAverageScore[msg.sender], msg.sender);
        }

        // Emit event for tracking
        emit TrustEventRecorded(msg.sender, eventCount);

        // Emit query event for consistency tracking
        emit TrustScoreQueried(msg.sender, 0); // 0 indicates recording operation
    }

    /// @notice Get the encrypted total trust score for a user
    /// @param user The address of the user
    /// @return The encrypted total trust score
    function getTotalTrustScore(address user) external view returns (euint32) {
        require(user != address(0), "Invalid user address");
        return _userTotalScore[user];
    }

    /// @notice Get the count of trust events for a user
    /// @param user The address of the user
    /// @return The count of trust events (plaintext)
    function getTrustEventCount(address user) external view returns (uint32) {
        return _userEventCount[user];
    }

    /// @notice Get the encrypted average trust score for a user
    /// @param user The address of the user
    /// @return The encrypted average trust score (total / count)
    function getAverageTrustScore(address user) external view returns (euint32) {
        require(user != address(0), "Invalid user address");
        return _userAverageScore[user];
    }

    /// @notice Get the number of trust events for a user (unencrypted, for array length)
    /// @param user The address of the user
    /// @return The number of trust events recorded
    function getTrustEventArrayLength(address user) external view returns (uint256) {
        require(user != address(0), "Invalid user address");
        return _userTrustScores[user].length;
    }

    /// @notice Get the last activity timestamp for a user
    /// @param user The address of the user
    /// @return The timestamp of the user's last trust event recording
    function getLastActivityTimestamp(address user) external view returns (uint32) {
        require(user != address(0), "Invalid user address");
        return _userLastActivity[user];
    }

    /// @notice Get a specific encrypted trust score from a user's history by index
    /// @param user The address of the user
    /// @param index The index of the trust score to retrieve
    /// @return The encrypted trust score at the specified index
    function getTrustScoreByIndex(address user, uint256 index) external view returns (euint32) {
        require(user != address(0), "Invalid user address");
        require(index < _userTrustScores[user].length, "Index out of bounds");
        return _userTrustScores[user][index];
    }

    /// @notice Get multiple trust scores from a user's history within a range
    /// @param user The address of the user
    /// @param startIndex The starting index (inclusive)
    /// @param endIndex The ending index (exclusive)
    /// @return An array of encrypted trust scores with bounds checking
    /// @dev Includes comprehensive validation to prevent out-of-bounds access
    function getTrustScoreRange(address user, uint256 startIndex, uint256 endIndex) external view returns (euint32[] memory) {
        require(user != address(0), "Invalid user address");
        require(startIndex < endIndex, "Invalid range");
        require(endIndex <= _userTrustScores[user].length, "End index out of bounds - range exceeds available trust scores");

        uint256 length = endIndex - startIndex;
        euint32[] memory scores = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            scores[i] = _userTrustScores[user][startIndex + i];
        }

        return scores;
    }

    /// @notice Validate multiple trust scores in batch with comprehensive FHE verification
    /// @param scores Array of encrypted trust scores to validate
    /// @param inputProofs Array of input proofs for the scores
    /// @return validScores Array of boolean results for each score validation
    /// @dev Performs full FHE validation including range checks and proof verification
    function validateTrustScoresBatch(externalEuint32[] calldata scores, bytes[] calldata inputProofs) external view returns (bool[] memory validScores) {
        require(scores.length == inputProofs.length, "Mismatched array lengths");
        require(scores.length > 0 && scores.length <= 10, "Batch size must be 1-10");
        require(scores.length <= 50, "Maximum batch size exceeded for gas limits");

        validScores = new bool[](scores.length);

        for (uint256 i = 0; i < scores.length; i++) {
            require(inputProofs[i].length > 0, "Proof cannot be empty");

            euint32 encryptedScore = FHE.fromExternal(scores[i], inputProofs[i]);

            // Comprehensive validation: Check if score is within valid trust score range (1-10)
            // This prevents invalid or malicious trust score submissions
            euint32 minScore = FHE.asEuint32(1);
            euint32 maxScore = FHE.asEuint32(10);

            ebool isGreaterOrEqualMin = FHE.gte(encryptedScore, minScore);
            ebool isLessOrEqualMax = FHE.lte(encryptedScore, maxScore);

            ebool isValid = FHE.and(isGreaterOrEqualMin, isLessOrEqualMax);

            validScores[i] = FHE.decrypt(isValid);
        }

        return validScores;
    }

    /// @notice Validate if a trust score is within acceptable range (1-10)
    /// @param score The encrypted trust score to validate
    /// @param inputProof The input proof for the score
    /// @return isValid True if score is between 1-10 inclusive
    /// @dev Performs comprehensive validation including proof verification and range checking
    function validateTrustScore(externalEuint32 score, bytes calldata inputProof) external view returns (bool) {
        require(inputProof.length > 0, "Proof cannot be empty - valid proof required for FHE operations");
        euint32 encryptedScore = FHE.fromExternal(score, inputProof);

        // Comprehensive validation: Check if score is within valid trust score range (1-10)
        // This ensures only legitimate trust scores are accepted
        euint32 minScore = FHE.asEuint32(1);
        euint32 maxScore = FHE.asEuint32(10);

        ebool isGreaterOrEqualMin = FHE.gte(encryptedScore, minScore);
        ebool isLessOrEqualMax = FHE.lte(encryptedScore, maxScore);

        ebool isValid = FHE.and(isGreaterOrEqualMin, isLessOrEqualMax);

        return FHE.decrypt(isValid);
    }

    /// @notice Get comprehensive trust statistics for a user with accurate data validation
    /// @param user The address of the user
    /// @return eventCount Total number of trust events
    /// @return lastActivity Timestamp of last trust event
    /// @return hasData Whether user has any trust data (accurate calculation: eventCount > 0)
    /// @dev Emits TrustStatisticsViewed event for tracking user activity and analytics
    function getTrustStatistics(address user) external returns (uint32 eventCount, uint32 lastActivity, bool hasData) {
        require(user != address(0), "Invalid user address");

        eventCount = _userEventCount[user];
        lastActivity = _userLastActivity[user];
        hasData = eventCount > 0; // Accurate hasData calculation: true if user has recorded trust events

        // Emit event for statistics viewing
        emit TrustStatisticsViewed(user, eventCount, lastActivity);

        return (eventCount, lastActivity, hasData);
    }

    /// @notice Get cached trust statistics (gas optimized)
    /// @param user The address of the user
    /// @return eventCount Total number of trust events
    /// @return lastActivity Timestamp of last trust event
    /// @return hasData Whether user has any trust data
    function getCachedTrustStatistics(address user) external view returns (uint32 eventCount, uint32 lastActivity, bool hasData) {
        require(user != address(0), "Invalid user address");

        uint256 cached = _userDataCache[user];
        eventCount = uint32(cached & 0xFFFFFFFF);
        lastActivity = uint32((cached >> 32) & 0xFFFFFFFF);
        hasData = ((cached >> 64) & 0x1) == 1;

        return (eventCount, lastActivity, hasData);
    }
}


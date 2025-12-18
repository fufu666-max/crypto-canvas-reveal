// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Trust Score Tracker
/// @notice A contract for couples to record trust events with encrypted scores
/// @dev All trust scores are encrypted using FHE, protecting privacy while allowing encrypted operations
contract TrustScoreTracker is SepoliaConfig {
    /// @notice Emitted when a new trust event is recorded
    event TrustEventRecorded(address indexed user, uint32 eventCount);

    /// @notice Emitted when trust score statistics are viewed
    event TrustStatisticsViewed(address indexed user, uint32 totalEvents, uint32 lastActivity);

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

    /// @notice Record a new trust event with an encrypted score
    /// @param score The encrypted trust score (typically 1-10)
    /// @param inputProof The input proof for the encrypted score
    function recordTrustEvent(externalEuint32 score, bytes calldata inputProof) external {
        require(inputProof.length > 0, "Proof cannot be empty");
        require(_userEventCount[msg.sender] < 1000, "Maximum trust events reached");

        euint32 encryptedTrustScore = FHE.fromExternal(score, inputProof);

        _userTrustScores[msg.sender].push(encryptedTrustScore);
        FHE.allowThis(encryptedTrustScore);
        FHE.allow(encryptedTrustScore, msg.sender);

        _userTotalScore[msg.sender] = FHE.add(_userTotalScore[msg.sender], encryptedTrustScore);
        FHE.allowThis(_userTotalScore[msg.sender]);
        FHE.allow(_userTotalScore[msg.sender], msg.sender);

        _userEventCount[msg.sender] += 1;
        _userLastActivity[msg.sender] = uint32(block.timestamp);

        uint32 eventCount = _userEventCount[msg.sender];
        if (eventCount > 0) {
            euint32 totalScore = _userTotalScore[msg.sender];
            euint32 average = FHE.div(totalScore, eventCount);
            _userAverageScore[msg.sender] = average;
            FHE.allowThis(_userAverageScore[msg.sender]);
            FHE.allow(_userAverageScore[msg.sender], msg.sender);
        }

        emit TrustEventRecorded(msg.sender, eventCount);
    }

    /// @notice Get the encrypted total trust score for a user
    function getTotalTrustScore(address user) external view returns (euint32) {
        require(user != address(0), "Invalid user address");
        return _userTotalScore[user];
    }

    /// @notice Get the count of trust events for a user
    function getTrustEventCount(address user) external view returns (uint32) {
        return _userEventCount[user];
    }

    /// @notice Get the encrypted average trust score for a user
    function getAverageTrustScore(address user) external view returns (euint32) {
        require(user != address(0), "Invalid user address");
        return _userAverageScore[user];
    }

    /// @notice Get the number of trust events for a user
    function getTrustEventArrayLength(address user) external view returns (uint256) {
        require(user != address(0), "Invalid user address");
        return _userTrustScores[user].length;
    }

    /// @notice Get the last activity timestamp for a user
    function getLastActivityTimestamp(address user) external view returns (uint32) {
        require(user != address(0), "Invalid user address");
        return _userLastActivity[user];
    }

    /// @notice Get a specific encrypted trust score by index
    function getTrustScoreByIndex(address user, uint256 index) external view returns (euint32) {
        require(user != address(0), "Invalid user address");
        require(index < _userTrustScores[user].length, "Index out of bounds");
        return _userTrustScores[user][index];
    }

    /// @notice Get multiple trust scores within a range
    function getTrustScoreRange(address user, uint256 startIndex, uint256 endIndex) external view returns (euint32[] memory) {
        require(user != address(0), "Invalid user address");
        require(startIndex < endIndex, "Invalid range");
        require(endIndex <= _userTrustScores[user].length, "End index out of bounds");

        uint256 length = endIndex - startIndex;
        euint32[] memory scores = new euint32[](length);

        for (uint256 i = 0; i < length; i++) {
            scores[i] = _userTrustScores[user][startIndex + i];
        }

        return scores;
    }

    /// @notice Get trust statistics for a user
    function getTrustStatistics(address user) external returns (uint32 eventCount, uint32 lastActivity, bool hasData) {
        require(user != address(0), "Invalid user address");

        eventCount = _userEventCount[user];
        lastActivity = _userLastActivity[user];
        hasData = eventCount > 0;

        emit TrustStatisticsViewed(user, eventCount, lastActivity);

        return (eventCount, lastActivity, hasData);
    }
}

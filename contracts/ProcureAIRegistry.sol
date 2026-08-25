// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProcureAIRegistry
 * @notice Ultra-lightweight, gas-optimized registry for recording verified AI procurement approvals on BOT Chain Mainnet.
 * @dev Designed for minimal deployment and execution gas. Stores only essential hashes, amounts, timestamps, and approvers.
 */
contract ProcureAIRegistry {
    /// @dev Custom errors for gas efficiency (cheaper than revert strings)
    error AlreadyApproved();
    error InvalidProcurementId();
    error InvalidSupplier();
    error InvalidAmount();

    /// @dev Storage structure for an approved procurement decision
    struct ApprovalRecord {
        bytes32 supplierHash; // 32 bytes (Slot 0)
        address approver;     // 20 bytes \ Slot 1 (28 bytes total)
        uint64 timestamp;     // 8 bytes  /
        uint128 amount;       // 16 bytes (Slot 2)
    }

    /// @notice Mapping from procurementId to approval record
    mapping(bytes32 => ApprovalRecord) public approvals;

    /**
     * @notice Emitted when a procurement recommendation is approved and recorded on-chain
     * @param procurementId Unique hash identifier of the procurement request
     * @param supplierHash Keccak256 hash identifier of the approved supplier
     * @param approver Address of the signing wallet that approved the decision
     * @param amount Approved procurement amount
     * @param timestamp Block timestamp at the time of approval
     */
    event ProcurementApproved(
        bytes32 indexed procurementId,
        bytes32 indexed supplierHash,
        address indexed approver,
        uint128 amount,
        uint64 timestamp
    );

    /**
     * @notice Records a finalized procurement approval on-chain in a single transaction.
     * @param procurementId Unique 32-byte identifier for the procurement request
     * @param supplierHash 32-byte hash identifying the selected supplier
     * @param amount Total approved procurement value
     */
    function approveProcurement(
        bytes32 procurementId,
        bytes32 supplierHash,
        uint128 amount
    ) external {
        if (procurementId == bytes32(0)) revert InvalidProcurementId();
        if (supplierHash == bytes32(0)) revert InvalidSupplier();
        if (amount == 0) revert InvalidAmount();
        
        // Single SLOAD check: if approver is non-zero, it was already approved
        if (approvals[procurementId].approver != address(0)) revert AlreadyApproved();

        uint64 currentTimestamp = uint64(block.timestamp);

        approvals[procurementId] = ApprovalRecord({
            supplierHash: supplierHash,
            approver: msg.sender,
            timestamp: currentTimestamp,
            amount: amount
        });

        emit ProcurementApproved(
            procurementId,
            supplierHash,
            msg.sender,
            amount,
            currentTimestamp
        );
    }

    /**
     * @notice Checks whether a procurement ID has already been approved.
     * @param procurementId Unique 32-byte identifier for the procurement request
     * @return approved True if the procurement has already been recorded, false otherwise
     */
    function isApproved(bytes32 procurementId) external view returns (bool approved) {
        return approvals[procurementId].approver != address(0);
    }

    /**
     * @notice Retrieves the full on-chain approval record for a given procurement ID.
     * @param procurementId Unique 32-byte identifier
     */
    function getApproval(bytes32 procurementId)
        external
        view
        returns (
            bytes32 supplierHash,
            address approver,
            uint64 timestamp,
            uint128 amount
        )
    {
        ApprovalRecord storage record = approvals[procurementId];
        return (
            record.supplierHash,
            record.approver,
            record.timestamp,
            record.amount
        );
    }
}

pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;


/// @title LibCommitment
/// @notice Contains stuff that's useful for commitments
contract LibCommitment {

    // An ID for each commitment type
    enum CommitmentTarget {
        MULTISIG,
        SET_STATE,
        CANCEL_DISPUTE
    }

}

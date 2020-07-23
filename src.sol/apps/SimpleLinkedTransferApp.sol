pragma solidity ^0.5.16;
pragma experimental "ABIEncoderV2";

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../shared/interfaces/CounterfactualApp.sol";
import "../funding/libs/LibOutcome.sol";

/// @title Simple Linked Transfer App
/// @notice This contract allows users to claim a payment locked in
///         the application if they provide the correct preImage
contract SimpleLinkedTransferApp is CounterfactualApp {
    using SafeMath for uint256;

    /**
     * Assume the app is funded with the money already owed to receiver,
     * as in the SimpleTwoPartySwapApp.
     *
     * This app can also not be used to send _multiple_ linked payments,
     * only one can be redeemed with the preImage.
     *
     */

    struct AppState {
        LibOutcome.CoinTransfer[2] coinTransfers;
        bytes32 linkedHash;
        bytes32 preImage;
        bool finalized;
    }

    struct Action {
        bytes32 preImage;
    }

    function applyAction(
        bytes calldata encodedState,
        bytes calldata encodedAction
    ) external view returns (bytes memory) {
        AppState memory state = abi.decode(encodedState, (AppState));
        Action memory action = abi.decode(encodedAction, (Action));

        require(!state.finalized, "Cannot take action on finalized state");

        // Handle cancellation
        if (action.preImage == bytes32(0)) {
            state.preImage = action.preImage;
            state.finalized = true;

            return abi.encode(state);
        }

        // Handle payment
        bytes32 generatedHash = sha256(abi.encode(action.preImage));
        require(
            state.linkedHash == generatedHash,
            "Hash generated from preimage does not match hash in state"
        );

        state.coinTransfers[1].amount = state.coinTransfers[0].amount;
        state.coinTransfers[0].amount = 0;
        state.preImage = action.preImage;
        state.finalized = true;

        return abi.encode(state);
    }

    function computeOutcome(bytes calldata encodedState)
        external
        view
        returns (bytes memory)
    {
        AppState memory state = abi.decode(encodedState, (AppState));
        // Revert payment if it's uninstalled before being finalized
        return abi.encode(state.coinTransfers);
    }

    function getTurnTaker(
        bytes calldata, /* encodedState */
        address[] calldata participants
    ) external view returns (address) {
        return participants[1]; // receiver should always be indexed at [1]
    }

    function isStateTerminal(bytes calldata encodedState)
        external
        view
        returns (bool)
    {
        AppState memory state = abi.decode(encodedState, (AppState));
        return state.finalized;
    }
}

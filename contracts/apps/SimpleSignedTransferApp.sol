// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;
pragma experimental "ABIEncoderV2";

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../shared/interfaces/CounterfactualApp.sol";
import "../shared/libs/LibChannelCrypto.sol";
import "../funding/libs/LibOutcome.sol";

/// @title Simple Signed Transfer App
/// @notice This contract allows users to claim a payment locked in
///         the application if the specified signed submits the correct
///         signature for the provided data
contract SimpleSignedTransferApp is CounterfactualApp {
    using SafeMath for uint256;

    struct AppState {
        LibOutcome.CoinTransfer[2] coinTransfers;
        address signerAddress;
        uint256 chainId;
        address verifyingContract;
        bytes32 domainSeparator;
        bytes32 paymentId;
        bool finalized;
    }

    struct Action {
        bytes32 data;
        bytes signature;
    }

    // EIP-712 DOMAIN SEPARATOR CONSTANTS
    // KNOWN ISSUE: https://hackmd.io/elr0znYORiOMSTtfPJVAaA?view
    // Solidity def:
    // bytes32 private constant DOMAIN_TYPE_HASH = keccak256(
    //     "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
    // );
    // bytes32 private constant RECEIPT_TYPE_HASH = keccak256(
    //     "Receipt(bytes32 paymentId,bytes32 data)"
    // );

    // bytes32 private constant DOMAIN_NAME_HASH = keccak256(
    //     "Connext Signed Transfer"
    // );
    // bytes32 private constant DOMAIN_VERSION_HASH = keccak256("0");
    bytes32
        private constant DOMAIN_SALT = 0xa070ffb1cd7409649bf77822cce74495468e06dbfaef09556838bf188679b9c2;

    // OVM def:
    bytes32
        private constant DOMAIN_TYPE_HASH = 0xd87cd6ef79d4e2b95e15ce8abf732db51ec771f1ca2edccf22a46c729ac56472;
    bytes32
        private constant RECEIPT_TYPE_HASH = 0x0e822f3ce57ecbdb6dcae76d51d85c8760819ec4c88925ab629d73d7bfbd38eb;
    bytes32
        private constant DOMAIN_NAME_HASH = 0xd6dfa1ebf5dfbb8ac25f6f7566ed5db7f58bef9979b3b9b3ac8ab6ffad6f7ad7;
    bytes32
        private constant DOMAIN_VERSION_HASH = 0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d;

    function recoverSigner(Action memory action, AppState memory state)
        public
        view
        returns (address)
    {
        return
            LibChannelCrypto.recoverAddr(
                keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        keccak256(
                            abi.encode(
                                DOMAIN_TYPE_HASH,
                                DOMAIN_NAME_HASH,
                                DOMAIN_VERSION_HASH,
                                state.chainId,
                                state.verifyingContract,
                                DOMAIN_SALT
                            )
                        ),
                        keccak256(
                            abi.encode(
                                RECEIPT_TYPE_HASH,
                                state.paymentId,
                                action.data
                            )
                        )
                    )
                ),
                action.signature
            );
    }

    function applyAction(
        bytes calldata encodedState,
        bytes calldata encodedAction
    ) external view returns (bytes memory) {
        AppState memory state = abi.decode(encodedState, (AppState));
        Action memory action = abi.decode(encodedAction, (Action));

        require(!state.finalized, "Cannot take action on finalized state");

        // FIXME: OVM having recovery issues
        require(
            state.signerAddress == recoverSigner(action, state),
            "Incorrect signer recovered from signature"
        );

        state.coinTransfers[1].amount = state.coinTransfers[0].amount;
        state.coinTransfers[0].amount = 0;
        state.finalized = true;

        return abi.encode(state);
    }

    function computeOutcome(bytes calldata encodedState)
        external
        view
        returns (bytes memory)
    {
        AppState memory state = abi.decode(encodedState, (AppState));

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

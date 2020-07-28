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
    bytes32 private constant DOMAIN_TYPE_HASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
    );
    bytes32 private constant RECEIPT_TYPE_HASH = keccak256(
        "Receipt(bytes32 paymentId,bytes32 data)"
    );

    bytes32 private constant DOMAIN_NAME_HASH = keccak256(
        "Connext Signed Transfer"
    );
    bytes32 private constant DOMAIN_VERSION_HASH = keccak256("0");
    bytes32
        private constant DOMAIN_SALT = 0xa070ffb1cd7409649bf77822cce74495468e06dbfaef09556838bf188679b9c2;

    function recoverSigner(Action memory action, AppState memory state)
        public
        view
        returns (address)
    {
        return
            recoverAddr(
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

    function recoverAddr(bytes32 digest, bytes memory signature)
        internal
        view
        returns (address o)
    {
        // Divide the signature in r, s and v variables
        bytes32 r;
        bytes32 s;
        uint8 v;

        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        assembly {
            // define pointer
            let p := mload(0x40)
            // store data assembly-favouring ways
            mstore(p, digest)
            mstore(add(p, 0x20), v)
            mstore(add(p, 0x40), r)
            mstore(add(p, 0x60), s)
            if iszero(staticcall(sub(gas, 2000), 0x01, p, 0x80, p, 0x20)) {
                revert(0, 0)
            }
            // data
            o := mload(p)
        }
    }

    function applyAction(
        bytes calldata encodedState,
        bytes calldata encodedAction
    ) external view returns (bytes memory) {
        AppState memory state = abi.decode(encodedState, (AppState));
        Action memory action = abi.decode(encodedAction, (Action));

        require(!state.finalized, "Cannot take action on finalized state");

        // Handle cancellation
        if (action.data == bytes32(0)) {
            state.finalized = true;

            return abi.encode(state);
        }

        // Handle payment
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

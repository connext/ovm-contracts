pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";

library LibChannelCrypto {
    function verifyChannelMessage(bytes32 hash, bytes memory signature)
        internal
        view
        returns (address)
    {
        bytes32 digest = toChannelSignedMessage(hash);
        return ECDSA.recover(digest, signature);
        // return recoverAddr(digest, signature);
    }

    function toChannelSignedMessage(bytes32 hash)
        internal
        view
        returns (bytes32)
    {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        return
            keccak256(abi.encodePacked("\x15Indra Signed Message:\n32", hash));
    }

    function recoverAddr(bytes32 digest, bytes memory signature)
        internal
        view
        returns (address)
    {
        // return ecrecover(msgHash, v, r, s);

        // Transform sig string into v, r, s format
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (signature.length != 65) {
            return address(0x0);
        }

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 255)
        }

        if (v < 27) {
            v += 27;
        }

        if (v != 27 && v != 28) {
            return address(0x0);
        }

        assembly {
            let pointer := mload(0x40)

            mstore(pointer, digest)
            mstore(add(pointer, 0x20), v)
            mstore(add(pointer, 0x40), r)
            mstore(add(pointer, 0x60), s)

            if iszero(staticcall(not(0), 0x01, pointer, 0x80, pointer, 0x20)) {
                revert(0, 0)
            }

            let size := returndatasize
            returndatacopy(pointer, 0, size)
            return(pointer, size)
        }
    }
}

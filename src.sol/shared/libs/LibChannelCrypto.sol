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
        // return ECDSA.recover(digest, signature);
        return recoverAddr(digest, signature);
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
}

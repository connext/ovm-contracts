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
}

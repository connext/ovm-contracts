pragma solidity ^0.5.16;
pragma experimental "ABIEncoderV2";

import "../../shared/interfaces/CounterfactualApp.sol";

contract IdentityApp is CounterfactualApp {
    function computeOutcome(bytes calldata encodedState)
        external
        view
        returns (bytes memory)
    {
        return encodedState;
    }
}

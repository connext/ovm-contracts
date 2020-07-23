pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./MultisigData.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MultisigTransfer - Inherit from this contract
/// for transfers out of the multisig.
/// It does some necessary internal bookkeeping.
contract MultisigTransfer is MultisigData {
    address constant CONVENTION_FOR_ETH_TOKEN_ADDRESS = address(0x0);

    /// @notice Use this function for transfers of assets out of
    /// the multisig. It does some necessary internal bookkeeping.
    /// @param recipient the recipient of the transfer
    /// @param assetId the asset to be transferred; token address for ERC20, 0 for Ether
    /// @param amount the amount to be transferred

    function multisigTransfer(
        address payable recipient,
        address assetId,
        uint256 amount
    ) public {
        // Note, explicitly do NOT use safemath here. See discussion in: TODO
        totalAmountWithdrawn[assetId] += amount;
        IERC20(assetId).transfer(recipient, amount);
    }
}

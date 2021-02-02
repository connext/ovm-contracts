import { tidy } from "../utils";
export const HashlockTransferName = "HashlockTransfer";
export const HashlockTransferStateEncoding = tidy(`tuple(
    bytes32 lockHash,
    uint256 expiry
  )`);
export const HashlockTransferResolverEncoding = tidy(`tuple(
    bytes32 preImage
  )`);
//# sourceMappingURL=hashlockTransfer.js.map
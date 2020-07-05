import { utils, Wallet } from "ethers";
import {
  CoinTransfer,
  PrivateKey,
  singleAssetTwoPartyCoinTransferEncoding,
} from "@connext/types";

const { keccak256, toUtf8Bytes, defaultAbiCoder, solidityKeccak256 } = utils;
// TODO: SimpleSignedTransfer app needs @connext packages ^7.0.0
// not sure best way to do this, so for now have duplicate fns

export const tidy = (str: string): string =>
  `${str.replace(/\n/g, "").replace(/ +/g, " ")}`;

export const DOMAIN_NAME = "Connext Signed Transfer";
export const DOMAIN_VERSION = "0";
export const DOMAIN_SALT =
  "0xa070ffb1cd7409649bf77822cce74495468e06dbfaef09556838bf188679b9c2";

export const hashString = (str: string) => keccak256(toUtf8Bytes(str));

export const hashTypedMessage = (
  domainSeparator: string,
  messageHash: string
): string =>
  solidityKeccak256(
    ["string", "bytes32", "bytes32"],
    ["\x19\x01", domainSeparator, messageHash]
  );

export const hashStruct = (
  typeHash: string,
  types: string[],
  values: any[]
) => {
  types.forEach((type, i) => {
    if (["string", "bytes"].includes(type)) {
      types[i] = "bytes32";
      if (type === "string") {
        values[i] = hashString(values[i]);
      } else {
        values[i] = keccak256(values[i]);
      }
    }
  });
  return keccak256(
    defaultAbiCoder.encode(["bytes32", ...types], [typeHash, ...values])
  );
};

export const DOMAIN_TYPE_HASH = hashString(
  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
);

export const hashDomainSeparator = (domain: EIP712Domain) =>
  hashStruct(
    DOMAIN_TYPE_HASH,
    ["string", "string", "uint256", "address", "bytes32"],
    [
      domain.name,
      domain.version,
      domain.chainId,
      domain.verifyingContract,
      domain.salt,
    ]
  );

export const RECEIPT_TYPE_HASH = hashString(
  "Receipt(bytes32 paymentId,bytes32 data)"
);

export const hashReceiptData = (receipt: Receipt) =>
  hashStruct(
    RECEIPT_TYPE_HASH,
    ["bytes32", "bytes32"],
    [receipt.paymentId, receipt.data]
  );

export const hashReceiptMessage = (
  domain: EIP712Domain,
  receipt: Receipt
): string =>
  hashTypedMessage(hashDomainSeparator(domain), hashReceiptData(receipt));

export const signReceiptMessage = async (
  domain: EIP712Domain,
  receipt: Receipt,
  privateKey: PrivateKey
) => new Wallet(privateKey).signMessage(hashReceiptMessage(domain, receipt));

export const getTestEIP712Domain = (chainId: number): EIP712Domain => ({
  name: DOMAIN_NAME,
  version: DOMAIN_VERSION,
  chainId,
  verifyingContract: "0x1d85568eEAbad713fBB5293B45ea066e552A90De",
  salt: DOMAIN_SALT,
});

export interface Receipt {
  paymentId: string;
  data: string;
}

export interface Attestation extends Receipt {
  signature: string;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  salt: string;
}

// ABI Encoding TS Typess
export type SimpleSignedTransferAppState = {
  coinTransfers: CoinTransfer[];
  signerAddress: string;
  chainId: number;
  verifyingContract: string;
  domainSeparator: string;
  paymentId: string;
  finalized: boolean;
};

// ABI Encodings
export const SimpleSignedTransferAppStateEncoding = tidy(`tuple(
  ${singleAssetTwoPartyCoinTransferEncoding} coinTransfers,
  address signerAddress,
  uint256 chainId,
  address verifyingContract,
  bytes32 domainSeparator,
  bytes32 paymentId,
  bool finalized
)`);

export type SimpleSignedTransferAppAction = {
  data: string;
  signature: string;
};

export const SimpleSignedTransferAppActionEncoding = tidy(`tuple(
  bytes32 data,
  bytes signature
)`);

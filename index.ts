// export all currently used addresses
import * as addressBook from "./address-book.json";
import * as addressHistory from "./address-history.json";

// export all build artifacts
import * as AppWithAction from "./artifacts/AppWithAction.json";
import * as ChallengeRegistry from "./artifacts/ChallengeRegistry.json";
import * as ConditionalTransactionDelegateTarget from "./artifacts/ConditionalTransactionDelegateTarget.json";
import * as CounterfactualApp from "./artifacts/CounterfactualApp.json";
import * as ERC20 from "./artifacts/ERC20.json";
import * as IdentityApp from "./artifacts/IdentityApp.json";
import * as MinimumViableMultisig from "./artifacts/MinimumViableMultisig.json";
import * as MultiAssetMultiPartyCoinTransferInterpreter from "./artifacts/MultiAssetMultiPartyCoinTransferInterpreter.json";
import * as ProxyFactory from "./artifacts/ProxyFactory.json";
import * as SimpleLinkedTransferApp from "./artifacts/SimpleLinkedTransferApp.json";
import * as SimpleTransferApp from "./artifacts/SimpleTransferApp.json";
import * as SimpleTwoPartySwapApp from "./artifacts/SimpleTwoPartySwapApp.json";
import * as SingleAssetTwoPartyCoinTransferInterpreter from "./artifacts/SingleAssetTwoPartyCoinTransferInterpreter.json";
import * as TwoPartyFixedOutcomeInterpreter from "./artifacts/TwoPartyFixedOutcomeInterpreter.json";

export * from "./commitments";
export {
  addressBook,
  addressHistory,
  AppWithAction,
  ChallengeRegistry,
  ConditionalTransactionDelegateTarget,
  CounterfactualApp,
  ERC20,
  IdentityApp,
  MinimumViableMultisig,
  MultiAssetMultiPartyCoinTransferInterpreter,
  ProxyFactory,
  SimpleLinkedTransferApp,
  SimpleTransferApp,
  SimpleTwoPartySwapApp,
  SingleAssetTwoPartyCoinTransferInterpreter,
  TwoPartyFixedOutcomeInterpreter,
};

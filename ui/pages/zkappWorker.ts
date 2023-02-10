import {
  Mina,
  isReady,
  PublicKey,
  fetchAccount,
  Field,
  PrivateKey,
  AccountUpdate,
  Signature,
} from "snarkyjs";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { Add } from "../../contracts/src/Add";

const state = {
  OracleExample: null as null | typeof Add,
  zkapp: null as null | Add,
  transaction: null as null | Transaction,
  nonce: null as null | number,
  deployerAccount: null as null | PrivateKey,
  zkAppPrivateKey: null as null | PrivateKey,
  zkAppAddress: null as null | PublicKey,
};

async function localDeploy(
  zkAppInstance: null | Add,
  zkAppPrivatekey: any,
  deployerAccount: any
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance!.deploy({ zkappKey: zkAppPrivatekey });
    zkAppInstance!.init(zkAppPrivatekey);
  });
  await txn.prove();
  txn.sign([zkAppPrivatekey]);
  await txn.send();
}
// ---------------------------------------------------------------------------------------

const functions = {
  loadSnarkyJS: async (args: {}) => {
    await isReady;
  },
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    state.deployerAccount = Local.testAccounts[0].privateKey;
  },
  loadContract: async (args: {}) => {
    const { Add } = await import("../../contracts/build/src/Add.js");
    state.OracleExample = Add;
  },
  compileContract: async (args: {}) => {
    await state.OracleExample!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    state.zkAppPrivateKey = PrivateKey.random();
    state.zkAppAddress = state.zkAppPrivateKey.toPublicKey();

    state.zkapp = new state.OracleExample!(state.zkAppAddress);
  },
  getNum: async (args: {}) => {
    const currentNum = await state.zkapp!.oraclePublicKey.get();
    console.log(currentNum);
    return JSON.stringify(currentNum.toJSON());
  },
  createUpdateTransaction: async (args: { data: any }) => {
    console.log(args.data);
    await localDeploy(
      state.zkapp,
      state.zkAppPrivateKey,
      state.deployerAccount
    );
    // const response = await fetch(
    //   "https://mina-credit-score-signer-pe3eh.ondigitalocean.app/user/1"
    // );
    // const data = {
    //   data: { id: "1", creditScore: "536" },
    //   signature: {
    //     r: "24430508286728316944271806172694349007217124010081295931129920868046839519034",
    //     s: "27296967652805514432189724876479850798084200198812904233167894889489337885024",
    //   },
    //   publicKey: "B62qoAE4rBRuTgC42vqvEyUqCGhaZsW58SKVW4Ht8aYqP9UTvxFWBgy",
    // };

    const id = Field(args.data.data.id);
    const creditScore = Field(args.data.data.creditScore);
    const signature = Signature.fromJSON(args.data.signature);
    console.log("signature", signature);
    const txn = await Mina.transaction(state.deployerAccount, () => {
      state.zkapp!.verify(id, creditScore, signature);
    });
    await txn.prove();
    await txn.send();

    const events = await state.zkapp!.fetchEvents();
    const verifiedEventValue = events[0].event.toFields(null)[0];
    console.log(verifiedEventValue);
    //     const zkappAccountKey = PrivateKey.fromBase58(
    //       `EKEGgniRoNPTjA6RJc1AKvagpqvBKkJy6zx2DyKJHP4Sm41n91Bd`
    //     );
    //     const zkAppAccountAddress = PublicKey.fromBase58(
    //       "B62qk6SyNNQpPs9682tA37eFnu7jfju9bRbqAgxbNEvwLc7uFNTh9RN"
    //     );

    //     const option = state.nonce ? { feePayerKey: zkappAccountKey, fee: 0.2e9,memo:"test", nonce: state.nonce+1 } : { feePayerKey: zkappAccountKey, fee: 0.2e9,memo:"test" };

    //     const transaction = await Mina.transaction(
    //       option,
    //       () => {
    //         state.zkapp!.statusUpdate(Field(args.data))
    //       }
    //     );

    //      await transaction.prove();
    //     transaction.sign([zkappAccountKey]);
    //     console.log("toPretty", transaction.toPretty())
    //     console.log("toJSON", transaction.toJSON())
    //     const sendtx = await transaction.send()
    //     await sendtx.wait();
    // console.log(transaction.toPretty()[0].nonce)
    //     state.nonce = parseInt(transaction.toPretty()[0].nonce);
    // // console.log(test.slice(test.indexOf("nonce")+8, test.indexOf("nonce") + 15))
    // // console.log(transaction)
    // // console.log(transaction.transaction.feePayer.body.nonce.value.toString())

    //     console.log(sendtx)
    //      if (sendtx.hash() !== undefined) {
    //         console.log(`
    // Success! Update transaction sent.

    // Your smart contract state will be updated
    // as soon as the transaction is included in a block:
    // https://berkeley.minaexplorer.com/transaction/${sendtx.hash()}
    // `);
    //     state.transaction = transaction;
    // }
  },
  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};
if (process.browser) {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

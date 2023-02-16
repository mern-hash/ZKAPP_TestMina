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

// async function localDeploy(
//   zkAppInstance: null | Add,
//   zkAppPrivatekey: any,
//   deployerAccount: any
// ) {
//   const txn = await Mina.transaction(deployerAccount, () => {
//     AccountUpdate.fundNewAccount(deployerAccount);
//     zkAppInstance!.deploy({ zkappKey: zkAppPrivatekey });
//     zkAppInstance!.init(zkAppPrivatekey);
//   });
//   await txn.prove();
//   txn.sign([zkAppPrivatekey]);
//   await txn.send();
// }
// ---------------------------------------------------------------------------------------

const functions = {
  loadSnarkyJS: async () => {
    await isReady;
  },
  setActiveInstanceToBerkeley: async () => {
    const Berkeley = Mina.BerkeleyQANet(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async () => {
    const { Add } = await import("../../contracts/build/src/Add");
    state.OracleExample = Add;
  },
  compileContract: async () => {
    await state.OracleExample!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.OracleExample!(publicKey);
  },
  getNum: async () => {
    const currentNum = await state.zkapp!.status.get();
    return JSON.stringify(currentNum.toJSON());
  },
  createUpdateTransaction: async (args: { data: any }) => {
    try {
      console.log(args.data);

      const id = Field(args.data.data.id);
      const creditScore = Field(args.data.data.creditScore);
      const signature: any = Signature.fromJSON(args.data.signature);
      const privateKey = PrivateKey.fromBase58(
        "EKEGgniRoNPTjA6RJc1AKvagpqvBKkJy6zx2DyKJHP4Sm41n91Bd"
      );
      let status = await state.zkapp!.status.get();
      console.log("Status", status.toJSON());
      const txn = await Mina.transaction(
        { feePayerKey: privateKey, fee: 0.2e9 },
        () => {
          state.zkapp!.verify(id, creditScore, signature);
        }
      );
      await txn.prove();
      const tex = await txn.send();
      // console.log(tex);
      // const events = await state.zkapp!.fetchEvents();
      // const verifiedEventValue = events[0].event.toFields(null)[0];
      // console.log(verifiedEventValue.toString());
      status = await state.zkapp!.status.get();
      console.log(status.toJSON());
      return {
        success: true as boolean,
        message: status.toJSON() as any,
      };
    } catch (error) {
      console.log("error", error);
      return { success: false as boolean, message: error as any };
    }
  },
  // proveUpdateTransaction: async () => {
  //   await state.transaction!.prove();
  // },
  // getTransactionJSON: async () => {
  //   return state.transaction!.toJSON();
  // },
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

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
    const id = Field(args.data.data.id);
    const creditScore = Field(args.data.data.creditScore);
    const signature: any = Signature.fromJSON(args.data.signature);
    const txn = await Mina.transaction(() => {
      state.zkapp!.verify(id, creditScore, signature);
    });

    state.transaction = txn;
  },
  proveUpdateTransaction: async () => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async () => {
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

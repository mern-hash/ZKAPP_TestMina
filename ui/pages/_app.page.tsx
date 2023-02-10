import "../styles/globals.css";
import { useEffect, useState } from "react";
import "./reactCOIServiceWorker";
import axios from "axios";

import ZkappWorkerClient from "./zkappWorkerClient";

import { PublicKey, Field, PrivateKey } from "snarkyjs";
import getSignerData from "./utilts";

let transactionFee = 0.1;

export default function App() {
  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentNum: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  const [data, setdata] = useState({
    userId: "1",
    rate: 0,
  });
  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        const zkappWorkerClient = new ZkappWorkerClient();

        console.log("Loading SnarkyJS...");
        await zkappWorkerClient.loadSnarkyJS();
        console.log("done");

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log("using key", publicKey.toBase58());

        console.log("checking if account exists...");
        // const res = await zkappWorkerClient.fetchAccount({
        //   publicKey: publicKey!,
        // });
        // const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        console.log("compiling zkApp");
        await zkappWorkerClient.compileContract();
        console.log("zkApp compiled");

        const zkappPublicKey = PublicKey.fromBase58(
          "B62qk6SyNNQpPs9682tA37eFnu7jfju9bRbqAgxbNEvwLc7uFNTh9RN"
        );

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log("getting zkApp state...");
        // await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        // const currentNum = await zkappWorkerClient.getNum();
        // console.log("current state:", currentNum.toString());

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists: true,
          // currentNum: 0,
        });
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  // useEffect(() => {
  //   (async () => {
  //     if (state.hasBeenSetup && !state.accountExists) {
  //       for (;;) {
  //         console.log("checking if account exists...");
  //         const res = await state.zkappWorkerClient!.fetchAccount({
  //           publicKey: state.publicKey!,
  //         });
  //         const accountExists = res.error == null;
  //         if (accountExists) {
  //           break;
  //         }
  //         await new Promise((resolve) => setTimeout(resolve, 1000));
  //       }
  //       console.log("test");
  //       setState({ ...state, accountExists: true });
  //     }
  //   })();
  // }, [state.hasBeenSetup]);

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    try {
      setState({ ...state, creatingTransaction: true });
      console.log("sending a transaction...");

      // await state.zkappWorkerClient!.fetchAccount({
      //   publicKey: state.publicKey!,
      // });
      const dataT = await getSignerData(data.userId, data.rate);
      await state.zkappWorkerClient!.createUpdateTransaction(dataT);

      // console.log("creating proof...");
      // await state.zkappWorkerClient!.proveUpdateTransaction();

      // console.log("getting Transaction JSON...");
      // const transactionJSON =
      //   await state.zkappWorkerClient!.getTransactionJSON();

      // console.log("requesting send transaction...");
      // console.log(transactionJSON);
      // const { hash } = await (window as any).mina.sendTransaction({
      //   transaction: transactionJSON,
      //   feePayer: {
      //     fee: transactionFee,
      //     memo: "zk",
      //   },
      // });

      console.log(
        "See transaction at https://berkeley.minaexplorer.com/transaction/"
        // hash
      );

      setState({ ...state, creatingTransaction: false });
    } catch (error) {
      console.log(error);
      setState({ ...state, creatingTransaction: false });
    }
  };

  // -------------------------------------------------------
  // Refresh the current state

  // const onRefreshCurrentNum = async () => {
  //   console.log("getting zkApp state...");
  //   await state.zkappWorkerClient!.fetchAccount({
  //     publicKey: state.zkappPublicKey!,
  //   });
  //   const currentNum = await state.zkappWorkerClient!.getNum();
  //   console.log("current state:", currentNum.toString());

  //   setState({ ...state, currentNum });
  // };

  // -------------------------------------------------------
  // Create UI elements

  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = "https://www.aurowallet.com/";
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        [Link]
      </a>
    );
    hasWallet = (
      <div>
        Could not find a wallet. Install Auro wallet here: {auroLinkElem}
      </div>
    );
  }

  let setupText = state.hasBeenSetup
    ? "SnarkyJS Ready"
    : "Setting up SnarkyJS...";
  let setup = (
    <div>
      {setupText} {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      "https://faucet.minaprotocol.com/?address=" + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        Account does not exist. Please visit the faucet to fund this account
        <a href={faucetLink} target="_blank" rel="noreferrer">
          [Link]
        </a>
      </div>
    );
  }

  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div>
        <input
          placeholder="enter value"
          value={data.rate}
          name="num"
          type="number"
          onChange={(e: any) => {
            setdata({
              ...data,
              rate: e.target.value,
            });
          }}
        />
        <button
          onClick={onSendTransaction}
          disabled={state.creatingTransaction}
        >
          Send Transaction
        </button>
        {/* <div> Current Number in zkApp: {state.currentNum!.toString()} </div>
        <button onClick={onRefreshCurrentNum}> Get Latest State </button> */}
      </div>
    );
  }

  const onSubmit = async () => {
    const res = await axios.get(
      "https://sellercentral.amazon.in/performance/detail/shipping?t=cr&ref=sp_st_dash_csp_car",
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    // const resR = await res.json();

    if (res.data.includes("Amazon Sign In")) {
      console.log("please login first");
      return;
    }
    console.log(
      res.data.slice(
        res.data.lastIndexOf(
          '<span class="a-color-base sp-giant-text pre-fulfillment-cancel-rate-metric">'
        ) +
          '<span class="a-color-base sp-giant-text pre-fulfillment-cancel-rate-metric">'
            .length,
        res.data.lastIndexOf(
          '</span></div></div></div><div id="pre-fulfillment-cancel-rate-summary-cancelled" class="a-section a-spacing-none">'
        )
      )
    );
  };

  return (
    <div>
      {setup}
      {accountDoesNotExist}
      {mainContent}
      <button style={{ backgroundColor: "Blue" }} onClick={onSubmit}>
        submit
      </button>
    </div>
  );
}

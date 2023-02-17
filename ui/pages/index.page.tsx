// import "../styles/globals.css";
import { useEffect, useState } from "react";
// import "./reactCOIServiceWorker";
import ZkappWorkerClient from "./zkappWorkerClient";
import { PublicKey, Field, Proof } from "snarkyjs";
import getSignerData from "./utilts";
import {
  Button,
  Box,
  Container,
  Typography,
  TextField,
  Grid,
} from "@mui/material";
import Loader from "../component/Loader";
import axios from "axios";

export default function Home() {
  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentState: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  const [txnJson, settxnJson] = useState<any>();

  const [data, setdata] = useState({
    userId: "" as string,
    rate: 0 as number,
  });

  const [uistate, setuistate] = useState({
    loading: false as boolean,
    message: null as null | string,
  });
  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        setuistate({ loading: true, message: "Loading SnarkyJS..." });
        const zkappWorkerClient = new ZkappWorkerClient();

        await zkappWorkerClient.loadSnarkyJS();
        setuistate({ ...uistate, message: "Creating contract instance..." });

        await zkappWorkerClient.setActiveInstanceToBerkeley();
        const publicKey = PublicKey.fromBase58(
          "B62qk6SyNNQpPs9682tA37eFnu7jfju9bRbqAgxbNEvwLc7uFNTh9RN"
        );

        console.log("using key", publicKey.toBase58());

        console.log("checking if account exists...");
        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey1 = PublicKey.fromBase58(publicKeyBase58);

        console.log("using key", publicKey.toBase58());

        console.log("checking if account exists...");
        const res1 = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey1!,
        });
        const accountExists = res1.error == null;

        console.log(res);
        setuistate({ ...uistate, message: "Loading contract..." });
        await zkappWorkerClient.loadContract();
        setuistate({ loading: true, message: "compiling zkApp..." });

        await zkappWorkerClient.compileContract();

        setuistate({ ...uistate, message: "zkApp compiled" });
        const zkappPublicKey = PublicKey.fromBase58(
          "B62qkXvMrDGhF1EgNNZ8UwgZkoTi8PJhhNkBqpx6B1QpKwco62iWsfn"
        );
        setuistate({ ...uistate, message: "Creating contract instance..." });
        await zkappWorkerClient.initZkappInstance(zkappPublicKey);
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        setuistate({ ...uistate, message: "getting zkApp state..." });
        const currentState = await zkappWorkerClient.getNum();

        currentState.toString() == "0" &&
          setuistate({ loading: false, message: "User state is False" });
        currentState.toString() == "1" &&
          setuistate({ loading: false, message: "User state is True" });

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          zkappPublicKey,
          accountExists,
          publicKey: publicKey1,
          currentState,
        });
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    try {
      setState({ ...state, creatingTransaction: true });
      setuistate({ loading: true, message: "sending a transaction..." });
      const dataT = await getSignerData(data.userId, data.rate);

      await state.zkappWorkerClient!.fetchAccount({
        publicKey: state.publicKey!,
      });

      await state.zkappWorkerClient!.createUpdateTransaction(dataT);

      console.log("creating proof...");
      await state.zkappWorkerClient!.proveUpdateTransaction();

      console.log("getting Transaction JSON...");
      const transactionJSON =
        await state.zkappWorkerClient!.getTransactionJSON();
      settxnJson(transactionJSON);
      console.log("requesting send transaction...");
      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          fee: 0.1,
          memo: "test",
        },
      });

      console.log(hash);

      // console.log("dataT", dataT);
      // const response: { success: boolean; message: any } =
      //   await state.zkappWorkerClient!.createUpdateTransaction(dataT);

      // if (!response?.success) {
      //   setuistate({
      //     loading: false,
      //     message: "Transaction decline. Current user state False.",
      //   });
      // } else {
      //   setuistate({
      //     loading: false,
      //     message:
      //       "Transaction Successful. Current user state True for user Id." +
      //       response?.message,
      //   });
      // }

      setState({ ...state, creatingTransaction: false });
    } catch (error) {
      console.log(error);
      setState({ ...state, creatingTransaction: false });
      setuistate({
        loading: false,
        message: "Transaction decline. Current user state False.",
      });
    }
  };

  const createSignature = async () => {
    const dataT = getSignerData(data.userId, data.rate);
    const fileName = "my-file";
    const json = JSON.stringify(dataT, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    // create "a" HTLM element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  const genrateProof = () => {
    // console.log(txnJson);
    // const chjson = Proof.fromJSON();
    // console.log(chjson);
  };

  const getData = async () => {
    const res = await axios.get(
      "https://sellercentral.amazon.in/performance/detail/shipping?t=cr&ref=sp_st_dash_csp_car",
      {
        headers: {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, PATCH, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "text/plain",
          "Access-Control-Max-Age": "86400",
        },
      }
    );
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

  const handelChange = (e: any) => {
    setdata({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Box
        component={"section"}
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4}>
              {uistate.loading ? (
                <Loader />
              ) : (
                <Box
                  sx={{
                    border: "1px solid #cccccc",
                    p: "30px 35px 24px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography
                    component={"h1"}
                    sx={{ fontSize: "20px", fontWeight: "600" }}
                  >
                    Amazon order cancelation proof
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={onSendTransaction}
                    noValidate
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="userId"
                      label="Amazon UID"
                      name="userId"
                      onChange={handelChange}
                      value={data.userId}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="rate"
                      label="Cancelation Rate"
                      type="number"
                      id="rate"
                      onChange={handelChange}
                      value={data.rate}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={getData}
                    >
                      Get your Amazon Data
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={createSignature}
                    >
                      Create Signature
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Submit
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={genrateProof}
                    >
                      Generate proof
                    </Button>
                  </Box>
                </Box>
              )}

              {uistate.message && (
                <Box
                  sx={{
                    position: "fixed",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    p: "15px 20px 15px",
                    bgcolor: "#1976d2",
                    "& p": {
                      textAlign: "center",
                      color: "#ffffff",
                    },
                  }}
                >
                  <Typography component={"p"}>{uistate.message}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

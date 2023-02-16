// import "../styles/globals.css";
import { useEffect, useState } from "react";
import "./reactCOIServiceWorker";
import ZkappWorkerClient from "./zkappWorkerClient";
import { PublicKey, Field } from "snarkyjs";
import getSignerData from "./utilts";
import {
  Button,
  Box,
  Container,
  Typography,
  TextField,
  Grid,
} from "@mui/material";
import axios from "axios";
import Loader from "../component/Loader";

export default function Home() {
  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentState: null as null | Field,
    // publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

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
          accountExists: true,
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
      console.log("dataT", dataT);
      const response: { success: boolean; message: any } =
        await state.zkappWorkerClient!.createUpdateTransaction(dataT);

      if (!response?.success) {
        setuistate({
          loading: false,
          message: "Transaction decline. Current user state False.",
        });
      } else {
        setuistate({
          loading: false,
          message:
            "Transaction Successful. Current user state True for user Id." +
            response?.message,
        });
      }

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

  // let mainContent;
  // if (state.hasBeenSetup && state.accountExists) {
  //   mainContent = (
  //     <div>
  //       <input
  //         placeholder="enter value"
  //         value={data.rate}
  //         name="num"
  //         type="number"
  //         onChange={(e: any) => {
  //           setdata({
  //             ...data,
  //             rate: e.target.value,
  //           });
  //         }}
  //       />
  //       <button
  //         onClick={onSendTransaction}
  //         disabled={state.creatingTransaction}
  //       >
  //         Send Transaction
  //       </button>
  //       {/* <div> Current Number in zkApp: {state.currentNum!.toString()} </div>
  //       <button onClick={onRefreshCurrentNum}> Get Latest State </button> */}
  //     </div>
  //   );
  // }

  // const onSubmit = async () => {
  //   const res = await axios.get(
  //     "https://sellercentral.amazon.in/performance/detail/shipping?t=cr&ref=sp_st_dash_csp_car",
  //     {
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //       },
  //     }
  //   );
  // const resR = await res.json();

  //   if (res.data.includes("Amazon Sign In")) {
  //     console.log("please login first");
  //     return;
  //   }
  //   console.log(
  //     res.data.slice(
  //       res.data.lastIndexOf(
  //         '<span class="a-color-base sp-giant-text pre-fulfillment-cancel-rate-metric">'
  //       ) +
  //         '<span class="a-color-base sp-giant-text pre-fulfillment-cancel-rate-metric">'
  //           .length,
  //       res.data.lastIndexOf(
  //         '</span></div></div></div><div id="pre-fulfillment-cancel-rate-summary-cancelled" class="a-section a-spacing-none">'
  //       )
  //     )
  //   );
  // };

  const getData = async () => {
    // const res = await axios.get(
    //   "https://sellercentral.amazon.in/performance/detail/shipping?t=cr&ref=sp_st_dash_csp_car",
    //   {
    //     headers: {
    //       "Access-Control-Allow-Credentials": "true",
    //       "Access-Control-Allow-Origin": "http://localhost:3000",
    //       "Access-Control-Allow-Methods":
    //         "GET, POST, PUT, PATCH, POST, DELETE, OPTIONS",
    //       "Access-Control-Allow-Headers": "Content-Type",
    //       "Content-Type": "text/plain",
    //       "Access-Control-Max-Age": "86400",
    //     },
    //   }
    // );
    // if (res.data.includes("Amazon Sign In")) {
    //   console.log("please login first");
    //   return;
    // }
    // console.log(
    //   res.data.slice(
    //     res.data.lastIndexOf(
    //       '<span class="a-color-base sp-giant-text pre-fulfillment-cancel-rate-metric">'
    //     ) +
    //       '<span class="a-color-base sp-giant-text pre-fulfillment-cancel-rate-metric">'
    //         .length,
    //     res.data.lastIndexOf(
    //       '</span></div></div></div><div id="pre-fulfillment-cancel-rate-summary-cancelled" class="a-section a-spacing-none">'
    //     )
    //   )
    // );
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
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Submit
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

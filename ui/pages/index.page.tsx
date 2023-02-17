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
    const res = await axios.get(
      "https://sellercentral.amazon.in/performance/detail/shipping?t=cr&ref=sp_st_dash_csp_car",
      {
        headers: {
          authority: "sellercentral.amazon.in",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
          "cache-control": "max-age=0",
          cookie:
            'session-id=262-7879717-5169137; ubid-acbin=257-1273715-4474749; __Host-mselc=H4sIAAAAAAAA/6tWSs5MUbJSSsytyjPUS0xOzi/NK9HLT85M0XM0DPE0inI3NfZ28nUOUtJRykVSmZtalJyRCFKKRV02ssICkBIjwxCvoNBQPxNv9zClWgChzu4adQAAAA==; __Host_mlang=en_IN; ld=inrgooginkenshoo_502X1069928_e_c_630646159638_asret__become_Navreg; AMCVS_A7493BC75245ACD20A490D4D%40AdobeOrg=1; AMCV_A7493BC75245ACD20A490D4D%40AdobeOrg=1585540135%7CMCIDTS%7C19406%7CMCMID%7C33479615651563642040046264681910167815%7CMCAAMLH-1677229699%7C12%7CMCAAMB-1677229699%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1676632099s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; s_ips=625; s_tp=2309; s_ppv=SC%253AIN%253AWP-Welcome%2C27%2C27%2C625%2C1%2C3; gpv_pn=SC%3AIN%3AWP-Welcome; s_vnc365=1708160899736%26vn%3D5; s_ivc=true; s_cc=true; s_nr365=1676624903295-Repeat; s_sq=amznsrvsglobalprod%252Camznsrvseumainprod%252Camznsrvsinprod%3D%2526c.%2526a.%2526activitymap.%2526page%253DSC%25253AIN%25253AWP-Welcome%2526link%253DLog%252520in%2526region%253Dsc-content-container%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253DSC%25253AIN%25253AWP-Welcome%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fsellercentral.amazon.in%25252Fsignin%25253Fref_%25253Dscin_soa_wp_signin_n%252526mons_sel_locale%25253Den_IN%252526initialSessio%2526ot%253DA; csm-hit=tb:GQSFEA9Q31PTEE5BMQPG+s-DBDWAA10T7BYEQSZ9SNG|1676625173150&t:1676625173150&adb:adblk_no; session-id-time=2307345182l; session-token=Ms/T2Wq2xcbJC6EA5/y/Y7EemWZCoPxNJ3N9fZKOwvOfdnFiqoCGr2GUXrYjXbw9c/ITWSq8ZrsaqFBsZA5+Y88uDixfdVb73rgz/G7qczuD3muciSpPSZ6T7aa6A894kelw8pwnC7RDMw9QBtBkltOLs2xJfavPS7ckb+usjDrR7LL1s7yJ/pJrpN3J7l4U+L/V65Y4NLqC2eehbjnHAaAlTaR1n8HnmQOITUHi/vLpw0eoURKmXzvanYyx6sBV; x-acbin="C8xCgbCJUqIOxVeHNRC9PCL5Z9r22vOEPQaz4v9w^@rnUke2qMZ6SKbXOsBf4CDk8"; at-acbin=Atza|IwEBIBKUvJt4IbBttmramDXESlL6uDLJ0eWEYNWGHs4VsYSqcHdPbt5PDIMEUxER-LvUBUYGB5D5XEp0ktjbJHo0Zd26Oox_Lqp2szbc48MoGIP0tmyURZQxAXBQQ8FqdBZPsN1qh-G2uoef5Y6mVaBtxHB-tz-Et57VWh0EriJpbuOeyHJ3rrF9jr7PwJPIRQHxOEek8hpzpA6J-Jh9xtfANzslSPQBZYhYqkvp3iETGNEQV_0aaQlfzu6q2UXTjHnrpHnEkLlglPu5FHz90qNiRs00S9C7Z1I_G-D-OW90tFAjYQ; sess-at-acbin="6ilD80BpIw98BTz7+R5rGtONKNvHIwcL33ZOSiJ2lOo="; sst-acbin=Sst1|PQG96jRThEpcJ7MGdGXRVAgoCV0YZlERGpDYujEwxr7Oc-S470OS1qj_7lOGThueSuwwQRmO0OXHkruuIT2z1yzJJdvlgUuk8AVWoq0CtUqHROcOsDC8MNSj0LSMLR_jJO9sScCVicaHZ2Cu8J66diCh0PzIQ9oa1XDUFyxbAciNJ6fabGk5yiaVFRwQpiWhDqKMEjMQ4dKAeY9MCSrtkyBx9HUqjumol6Np4BCHHUKv9iI5uKeiIuMQvsLzf_NCMmLZEMQ7rhMJ8QwxrsOvjxc44ivesugGuWU7UKKaSschkmg; session-id=262-7879717-5169137; session-id-time=2306830103l; session-token=lrkSiUlZxa8cCt7gtp7AO4eJwJkbWFYk4V627nOIVFhwRzuposDm6gdzA85XRPMk5jO+iOfF0y2NFWj0/oL2rfU3TSbROBDcx4tLLs9hQhWSQDH6wubvI50Q4eg3oUndtkPTgQ/Rhq6BJDEbBXIJL1aJFzdrCzBKT2Aclum+Ay0a+Vg+Fj+iG5CubJP2UalrpkHNfSsB2OWS7HwZjna0s09D/qry1Ftf5iMqdlf26OQ=; ubid-acbin=257-1273715-4474749',
          referer: "https://sellercentral.amazon.in/performance/dashboard",
          "sec-ch-ua":
            '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
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

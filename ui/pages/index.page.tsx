import { useEffect, useState } from "react";
import type { Add } from "../../contracts/src/";
import { Mina, isReady, PublicKey, PrivateKey, fetchAccount } from "snarkyjs";
// import { Add } from "../../contracts/build/src/Add";

export default function Home() {
  const [zkapp, setzkapp] = useState<any>();
  const [btnstate, setbtnstate] = useState<boolean>(true);
  const [message, setmessage] = useState<any>("Loading contract...");
  useEffect(() => {
    (async () => {
      await isReady;
      // setmessage();
      const { Add } = await import("../../contracts/build/src/");
      await Add.compile();

      const zkAppAddress =
        "B62qkUB2QWVk2ZSiCrHeBrLixsUUqyyjMLVbwrkjv3dxcCLwuyBMi5K";

      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qqkb7hD1We6gEfrcqosKt9C398VLp1WXeTo1i9boPoqF7B1LxHg4'
        );
      }
      const Berkeley = Mina.Network(
        "https://proxy.berkeley.minaexplorer.com/graphql"
      );
      Mina.setActiveInstance(Berkeley);

      const zkApp = new Add(PublicKey.fromBase58(zkAppAddress));
      console.log(zkApp);
      setzkapp(zkApp);
      setbtnstate(false);
      setmessage(null);
    })();
  }, []);

  const handelsubmit = async () => {
    setbtnstate(true);
    setmessage("Sending transaction...");
    if (zkapp) {
      const zkappAccountKey = PrivateKey.fromBase58(
        `EKEm14tBSqFXW6wSVzYiKHRsE9o5vT3L1ReFagbKkqur5pZvkN2i`
      );

      const tx = await Mina.transaction(
        PublicKey.fromBase58(
          "B62qmhsfPjwfPPcYNoToK2ofSsTnyzXXxy1qNU2CzPGjqiMVQgHNVDf"
        ),
        () => {
          zkapp.update();
        }
      );

      await tx.prove();
      await tx.sign([zkappAccountKey]);
      await tx.send();
      console.log(tx);
      setbtnstate(false);
      setmessage(null);
      // const mina = (window as any).mina;
      // const publicKeyBase58: string = (await mina.requestAccounts())[0];
      // const publicKey = PublicKey.fromBase58(publicKeyBase58);
      // if(mina == null){
      // await fetchAccount({ publicKey });
      // }

      //       const { hash } = await mina.sendTransaction({
      //         transaction: tx.toJSON(),
      //         feePayer: {
      //           fee: "0.1",
      //           memo: "zk",
      //         },
      //       });

      // await tx.sign([zkappAccountKey]);
      // await tx.send();
      // console.log(hash);
    }
  };

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {message && (
          <div>
            <p>{message}</p>
          </div>
        )}
        <button
          onClick={handelsubmit}
          className="submitBtn"
          disabled={btnstate}
        >
          submit
        </button>
      </div>
    </>
  );
}

import {
  Field,
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  PublicKey,
  Signature,
  PrivateKey,
} from "snarkyjs";

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
  "B62qk6SyNNQpPs9682tA37eFnu7jfju9bRbqAgxbNEvwLc7uFNTh9RN";

export class Add extends SmartContract {
  // Define contract state
  @state(PublicKey) oraclePublicKey = State<PublicKey>();
  @state(Field) status = State<Field>();
  // Define contract events
  events = {
    verified: Field,
  };

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
  }

  @method init(zkappKey: PrivateKey) {
    super.init(zkappKey);
    // Initialize contract state
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    this.status.set(Field(0));
    // Specify that caller should include signature with tx instead of proof
    this.requireSignature();
  }

  @method verify(id: Field, creditScore: Field, signature: Signature | null) {
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);

    const status = this.status.get();
    this.status.assertEquals(status);
    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature!.verify(oraclePublicKey, [
      id,
      creditScore,
    ]);
    // Check that the signature is valid
    validSignature.assertTrue();
    // Check that the provided credit score is greater than 700
    creditScore.assertLt(Field(2));
    this.status.set(Field(1));

    // Emit an event containing the verified users id
    this.emitEvent("verified", id);
  }
}

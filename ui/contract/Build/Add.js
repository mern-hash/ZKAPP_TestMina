var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, SmartContract, state, State, method, Permissions, PublicKey, Signature, PrivateKey, } from 'snarkyjs';
// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY = 'B62qk6SyNNQpPs9682tA37eFnu7jfju9bRbqAgxbNEvwLc7uFNTh9RN';
export class Add extends SmartContract {
    constructor() {
        super(...arguments);
        // Define contract state
        this.oraclePublicKey = State();
        this.status = State();
        // Define contract events
        this.events = {
            verified: Field,
        };
    }
    deploy(args) {
        super.deploy(args);
        this.setPermissions({
            ...Permissions.default(),
            editState: Permissions.proofOrSignature(),
        });
    }
    init(zkappKey) {
        super.init(zkappKey);
        // Initialize contract state
        this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
        this.status.set(Field(0));
        // Specify that caller should include signature with tx instead of proof
        this.requireSignature();
    }
    verify(id, creditScore, signature) {
        // Get the oracle public key from the contract state
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.assertEquals(oraclePublicKey);
        const status = this.status.get();
        this.status.assertEquals(status);
        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [id, creditScore]);
        // Check that the signature is valid
        validSignature.assertTrue();
        // Check that the provided credit score is greater than 700
        creditScore.assertLt(Field(2));
        this.status.set(Field(1));
        // Emit an event containing the verified users id
        this.emitEvent('verified', id);
    }
}
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], Add.prototype, "oraclePublicKey", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], Add.prototype, "status", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PrivateKey]),
    __metadata("design:returntype", void 0)
], Add.prototype, "init", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Field, Field, Signature]),
    __metadata("design:returntype", void 0)
], Add.prototype, "verify", null);

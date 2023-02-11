import { Field, PrivateKey, PublicKey, Signature } from "snarkyjs";

const getSignerData = (
  userId: string,
  rate: number
): {
  data: { id: string; creditScore: string };
  signature: any;
  publicKey: PublicKey;
} => {
  const id = Field(userId);
  const cancelRate = Field(rate);
  const privateKey = PrivateKey.fromBase58(
    "EKEGgniRoNPTjA6RJc1AKvagpqvBKkJy6zx2DyKJHP4Sm41n91Bd"
  );
  const publicKey = privateKey.toPublicKey();
  const signature = Signature.create(privateKey, [id, cancelRate]);
  const testsign = signature.toJSON();
  // console.log(testsign);
  return {
    data: { id: userId, creditScore: rate.toString() },
    signature: testsign,
    publicKey,
  };
};

export default getSignerData;

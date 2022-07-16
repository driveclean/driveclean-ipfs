import base58 from "bs58";
import { PHANTOM_DEEPLINK_BASE_URL } from "constants/constants";
import nacl from "tweetnacl";

/**
 * 获取干净的回调地址，删除会影响回调的url参数
 * @returns 干净的回调地址
 */
const paramBlackList = ["phantom_encryption_public_key", "nonce", "data", "errorCode", "errorMessage"];
export const cleanRedirectLink = () => {
  const params = new URLSearchParams(location.search);
  const newParams = new URLSearchParams();
  for (const key of params.keys()) {
    if (!paramBlackList.includes(key)) {
      newParams.append(key, params.get(key));
    }
  }
  const baseUrl = location.href.split("?")[0];
  return `${baseUrl}?${newParams.toString()}`;
};

/**
 * 拼接完整的deeplink
 * @param method 调用app钱包中的方法名
 * @returns 完整的deeplink
 */
export const buildDeepLink = (method: string) => {
  return `${PHANTOM_DEEPLINK_BASE_URL}/${method}`;
};

/**
 * 解密app钱包回调数据
 * @param data 回调数据中的data
 * @param nonce 回调数据中的nonce
 * @param sharedSecret 调用时生成的secret
 * @returns 解密后的数据
 */
export const decryptPayload = (data: string, nonce: string, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");
  const decryptedData = nacl.box.open.after(base58.decode(data), base58.decode(nonce), sharedSecret);
  if (!decryptedData) {
    throw new Error("Unable to decrypt data");
  }
  return JSON.parse(Buffer.from(decryptedData).toString("utf8"));
};

/**
 * 加密调用app钱包的数据
 * @param payload 需要加密的数据
 * @param sharedSecret 调用时生成的secret
 * @returns 加密后的数据
 */
export const encryptPayload = (payload: any, sharedSecret?: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");
  const nonce = nacl.randomBytes(24);
  const encryptedPayload = nacl.box.after(Buffer.from(JSON.stringify(payload)), nonce, sharedSecret);
  return { nonce: base58.encode(nonce), encryptedPayload: base58.encode(encryptedPayload) };
};

// const createTransferTransaction = async () => {
//   if (!phantomWalletPublicKey) throw new Error("missing public key from user");
//   let transaction = new Transaction().add(
//     SystemProgram.transfer({
//       fromPubkey: phantomWalletPublicKey,
//       toPubkey: phantomWalletPublicKey,
//       lamports: 100,
//     })
//   );
//   transaction.feePayer = phantomWalletPublicKey;
//   addLog("Getting recent blockhash");
//   const anyTransaction: any = transaction;
//   anyTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
//   return transaction;
// };

// const connect = async () => {
//   const params = new URLSearchParams({
//     dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//     cluster: "mainnet-beta",
//     app_url: "https://phantom.app",
//     redirect_link: onConnectRedirectLink,
//   });

//   const url = buildUrl("connect", params);
//   Linking.openURL(url);
// };

// const disconnect = async () => {
//   const payload = {
//     session,
//   };
//   const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

//   const params = new URLSearchParams({
//     dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//     nonce: bs58.encode(nonce),
//     redirect_link: onDisconnectRedirectLink,
//     payload: bs58.encode(encryptedPayload),
//   });

//   const url = buildUrl("disconnect", params);
//   Linking.openURL(url);
// };

// const signAndSendTransaction = async () => {
//   const transaction = await createTransferTransaction();

//   const serializedTransaction = transaction.serialize({
//     requireAllSignatures: false,
//   });

//   const payload = {
//     session,
//     transaction: bs58.encode(serializedTransaction),
//   };
//   const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

//   const params = new URLSearchParams({
//     dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//     nonce: bs58.encode(nonce),
//     redirect_link: onSignAndSendTransactionRedirectLink,
//     payload: bs58.encode(encryptedPayload),
//   });

//   addLog("Sending transaction...");
//   const url = buildUrl("signAndSendTransaction", params);
//   Linking.openURL(url);
// };

// const signAllTransactions = async () => {
//   const transactions = await Promise.all([createTransferTransaction(), createTransferTransaction()]);

//   const serializedTransactions = transactions.map((t) =>
//     bs58.encode(
//       t.serialize({
//         requireAllSignatures: false,
//       })
//     )
//   );

//   const payload = {
//     session,
//     transactions: serializedTransactions,
//   };

//   const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

//   const params = new URLSearchParams({
//     dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//     nonce: bs58.encode(nonce),
//     redirect_link: onSignAllTransactionsRedirectLink,
//     payload: bs58.encode(encryptedPayload),
//   });

//   addLog("Signing transactions...");
//   const url = buildUrl("signAllTransactions", params);
//   Linking.openURL(url);
// };

// const signTransaction = async () => {
//   const transaction = await createTransferTransaction();

//   const serializedTransaction = bs58.encode(
//     transaction.serialize({
//       requireAllSignatures: false,
//     })
//   );

//   const payload = {
//     session,
//     transaction: serializedTransaction,
//   };

//   const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

//   const params = new URLSearchParams({
//     dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//     nonce: bs58.encode(nonce),
//     redirect_link: onSignTransactionRedirectLink,
//     payload: bs58.encode(encryptedPayload),
//   });

//   addLog("Signing transaction...");
//   const url = buildUrl("signTransaction", params);
//   Linking.openURL(url);
// };

// const signMessage = async () => {
//   const message = "To avoid digital dognappers, sign below to authenticate with CryptoCorgis.";

//   const payload = {
//     session,
//     message: bs58.encode(Buffer.from(message)),
//   };

//   const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

//   const params = new URLSearchParams({
//     dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
//     nonce: bs58.encode(nonce),
//     redirect_link: onSignMessageRedirectLink,
//     payload: bs58.encode(encryptedPayload),
//   });

//   addLog("Signing message...");
//   const url = buildUrl("signMessage", params);
//   Linking.openURL(url);
// };

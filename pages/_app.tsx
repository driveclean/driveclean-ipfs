import "../styles/globals.css";
import type { AppProps, NextWebVitalsMetric } from "next/app";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "../app/store";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import Loading from "@components/common/loading";
import { LoadingProvider } from "@components/common/loading-provider";
import { ModalProvider } from "@components/common/modal-provider";
import { FIGMENT_DATAHUB_SOLANA_API_URL } from "@constants/constants";

/**
 * Send logs to Axiom: https://www.axiom.co/docs/integrations/vercel
 * @param metric Next.js web vitals metric
 */
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const url = process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT;

  if (!url) {
    return;
  }

  const body = JSON.stringify({
    route: window.__NEXT_DATA__.page,
    ...metric,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: "POST", keepalive: true });
  }
}

const persistor = persistStore(store, {}, function () {
  persistor.persist();
});

export default function FrontMain({ Component, pageProps }: AppProps) {
  // 从环境变量中获取当前所使用的Solana链网络
  let network = WalletAdapterNetwork.Devnet;
  switch (process.env.NEXT_PUBLIC_SOLANA_NETWORK) {
    case "devnet":
      WalletAdapterNetwork.Devnet;
      break;
    case "testnet":
      WalletAdapterNetwork.Testnet;
      break;
    case "mainnet-beta":
      WalletAdapterNetwork.Mainnet;
      break;
    default:
      throw new Error("Invalid Solana Network");
  }

  // 获取当前所使用的Solana链网络的API地址
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_NODE === "datahub") {
      return FIGMENT_DATAHUB_SOLANA_API_URL;
    }

    return clusterApiUrl(network);
  }, [network]);

  // 配置支持的钱包类型，这里只配置了Phantom钱包，如果需要支持其他钱包，可以在这里添加
  // https://github.com/solana-labs/wallet-adapter
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={<Loading visible={true} />} persistor={persistor}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
              <Head>
                <meta
                  name="viewport"
                  content="width=device-width, viewport-fit=cover, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                ></meta>
              </Head>
              <LoadingProvider>
                <ModalProvider>
                  <Component {...pageProps} />
                </ModalProvider>
              </LoadingProvider>
            </WalletProvider>
          </ConnectionProvider>
        </PersistGate>
      </Provider>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        className="w-full flex-grow-0 flex flex-col items-center"
        autoClose={1500}
        transition={Slide}
        toastClassName="w-11/12 mt-4 sm:mt-0 rounded-lg"
        toastStyle={{ borderRadius: "0.5rem" }}
        draggableDirection="y"
      />
    </>
  );
}

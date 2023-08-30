import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { Footer, Navbar } from "../components"
import { NotificationProvider } from "web3uikit"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import Script from "next/script"
import '../styles/globals.css';
import { chain, configureChains, createClient, WagmiConfig } from "wagmi"
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { NFTProvider } from "../context/NFTContext"
const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

// console.log("ApolloClient", client)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''

// const { chains, provider, webSocketProvider } = configureChains(
//   [
//     chain.mainnet,
//     chain.goerli,
//     chain.optimism,
//     chain.arbitrum,
//     ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
//       ? [chain.goerli, chain.localhost]
//       : []),
//   ],
//   [
//     alchemyProvider({
//       apiKey: ALCHEMY_API_KEY,
//     }),
//     publicProvider(),
//   ]
// )

// const wagmiClient = createClient({
//   autoConnect: true,
//   provider,
//   webSocketProvider,
// })
function MyApp({ Component, pageProps }) {
    // console.log("Componenet , pageProps", Component, pageProps)
    return (
        <NFTProvider>
            {/* <Head>
                <title className="text-gray-600 dark:text-gray-100">我的个人商城</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" href="/favicon.ico" />
            </Head> */}

            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Header />
                        {/* <Navbar /> */}
                        <div className="pt-65">
                            <Component {...pageProps} />
                        </div>
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
            <Footer />
            <Script src="https://kit.fontawesome.com/77a74156e4.js" crossOrigin="anonymous" />
        </NFTProvider>
    )
}

export default MyApp

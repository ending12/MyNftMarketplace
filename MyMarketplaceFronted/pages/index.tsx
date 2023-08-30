// import styles from "../styles/Home.module.css"
/**/
import styles from "../styles/Home.module.css"
import { useMoralisQuery, useMoralis } from "react-moralis"
import NFTBox from "../components/NFTBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries"
import { useQuery } from "@apollo/client"
import { Loading } from "web3uikit"
interface NFTBoxType {
    price: number
    nftAddress: string
    tokenId: number
    marketplaceAddress: string
    seller: number
    key: string
}

export default function Home() {
    const { chainId, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const canSupportBlockChain = networkMapping[chainString]
    const marketplaceAddress = canSupportBlockChain
        ? networkMapping[chainString].NftMarketplace[0]
        : null

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)
    console.log("get active items", loading, error, listedNfts)
    return (
        <div className="container mx-auto bg-white dark:bg-gray-800">
            <h1 className="py-4 px-4 font-bold text-2xl">近期的列表：</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled && chainId ? (
                    loading || !listedNfts ? (
                        <div
                            style={{
                                borderRadius: "8px",
                                padding: "20px",
                            }}
                        >
                            <Loading size={20} spinnerColor="#2E7DAF" />
                        </div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            const { price, nftAddress, tokenId, seller } = nft
                            return marketplaceAddress ? (
                                <NFTBox
                                    price={price}
                                    nftAddress={nftAddress}
                                    tokenId={tokenId}
                                    marketplaceAddress={marketplaceAddress}
                                    seller={seller}
                                    key={`${nftAddress}${tokenId}`}
                                />
                            ) : (
                                <div>网络出错，请重新切换检查网络</div>
                            )
                        })
                    )
                ) : (
                    <div>请连接钱包进行登录</div>
                )}
            </div>
        </div>
    )
}

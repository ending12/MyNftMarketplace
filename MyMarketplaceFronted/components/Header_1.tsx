import { ConnectButton, CryptoLogos } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h3 className="py-1 px-1 font-bold text-3xl">我的个人商城</h3>
            <div className="flex flex-initial flex-row justify-end">
                <div className="flex items-center mr-4">
                    <input
                        type="checkbox"
                        className="checkbox"
                        id="checkbox"
                        // onChange={() => setTheme('light' === 'light' ? 'dark' : 'light')}
                    />
                    <label
                        htmlFor="checkbox"
                        className="flexBetween w-8 h-4 bg-black rounded-2xl p-1 relative label cursor-pointer"
                    >
                        <i className="fas fa-moon" />
                        <i className="fas fa-sun" />
                        <div className="w-3 h-3 absolute bg-white rounded-full ball" />
                    </label>
                </div>
            </div>

            <div className="flex flex-row items-center">
                <Link href="/">
                    <a className="mr-4 p-6">交易市场</a>
                </Link>
                <Link href="/sell-nft">
                    <a className="mr-4 p-6">出售NFT</a>
                </Link>
                <Link href="/mint-nft">
                    <a className="mr-4 p-6">资产铸造</a>
                </Link>
                
                <ConnectButton moralisAuth={false} />
                <div className="py-1 px-1">
                    <CryptoLogos chain="ethereum" size="40px" />
                </div>
            </div>
        </nav>
    )
}

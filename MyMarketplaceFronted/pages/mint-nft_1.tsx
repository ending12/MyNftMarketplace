import { create } from "ipfs-http-client"
import { NextPage } from "next"
import Image from "next/image"
import { useRouter } from "next/router"
import React, { useCallback, useContext, useMemo, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useMoralis } from "react-moralis"
import { CryptoCards, Illustration, Input, Modal, TextArea } from "web3uikit"
import { Button, Loader } from "../components"
import { YourNFT_ABI } from "../constants/YourNft"
import { NFTContext } from "../context/NFTContext"
import { useCheckLocalChain } from "../hooks/useCheckLocalChain"
import { useIsMounted } from "../hooks/uselsMounted"
import { generateTokenUri } from "../utils/generateTokenUrl"
import images from "../assets"
export default function Home() {
    const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    // console.log("UNSPLASH_ACCESS_KEY", process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)
    const IPFS_BASE_URL = "https://ipfs.io/ipfs"

    const projectId = "2DDHiA47zFkJXtnxzl2jFkyuaoq"
    const projectSecret = "96a91eeafc0a390ab66e6a87f61152aa"
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, setFormInput] = useState({ price: "", name: "", description: "" })
    //   const { theme } = useTheme();
    const { isLoadingNFT, uploadToIPFS, createNFT } = useContext(NFTContext) as {
        isLoadingNFT
        uploadToIPFS
        createNFT
    }
    const router = useRouter()

    const onDrop = useCallback(async (acceptedFile) => {
        const url = await uploadToIPFS(acceptedFile[0])

        setFileUrl(url)
    }, [])

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: "image/*",
        maxSize: 5000000,
    })

    const fileStyle = useMemo(
        () =>
            `dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-sm border-dashed
    ${isDragActive && " border-file-active"}
    ${isDragAccept && " border-file-accept"}
    ${isDragReject && " border-file-reject"}
    `,
        [isDragActive, isDragAccept, isDragReject]
    )

    if (isLoadingNFT) {
        return (
            <div className="flexStart min-h-screen">
                <Loader />
            </div>
        )
    }
    return (
        <>
            <div className="w-100 flexCenter flex-col text-center">
                <div className="w-80">
                    <h3 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
                        创建新的NFT
                    </h3>
                    <div>
                        <div className="mt-4">
                            <div {...getRootProps()} >
                                <input {...getInputProps()} />
                                <div>
                                    <p className="font-poppins dark:text-white text-nft-black-1">
                                        支持文件格式: JPG, PNG, GIF, SVG, WEBM 最大不超过 100mb.
                                    </p>
                                    <div className="my-12 w-full">
                                        <Image
                                            src={images.upload}
                                            width="100"
                                            height="100"
                                            objectFit="contain"
                                            alt="file upload"
                                            className="filter invert"
                                        />
                                    </div>
                                    <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm">
                                        拖入文件,或点击进行浏览
                                    </p>
                                    {/* <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm mt-2">
                                    </p> */}
                                </div>
                            </div>
                            {fileUrl && (
                                <aside>
                                    <div className="flex justify-left">
                                        <Image
                                            loader={() => fileUrl}
                                            src={fileUrl}
                                            height="200"
                                            width="200"
                                            alt="upload_file"
                                        />
                                        {/* <Image
                                            width={100}
                                            height={100}
                                            objectFit="contain"
                                            src={fileUrl}
                                            alt="asset_file"
                                        /> */}
                                    </div>
                                </aside>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="justify-center mt-2 w-full">
                            <Input
                                type="text"
                                onChange={(e) =>
                                    setFormInput({ ...formInput, name: e.target.value })
                                }
                                validation={{
                                    required: true,
                                }}
                                placeholder="请输入NFT资产名称"
                            />
                        </div>
                        <div className="mt-6 w-full">
                            {/* <Input
                                type="text"
                                onChange={(e) =>
                                    setFormInput({ ...formInput, description: e.target.value })
                                }
                                validation={{
                                    required: true,
                                }}
                                placeholder="请输入NFT描述"
                                size="large"
                            /> */}
                            <TextArea
                                label="描述"
                                name="Test TextArea Default"
                                onChange={(e) =>
                                    setFormInput({ ...formInput, description: e.target.value })
                                }
                                placeholder="请输入NFT描述"
                            />
                        </div>
                        <div className="mt-6 w-full">
                            <Input
                                type="number"
                                validation={{
                                    required: true,
                                }}
                                onChange={(e) =>
                                    setFormInput({ ...formInput, price: e.target.value })
                                }
                                placeholder="NFT价格"
                            />
                        </div>
                        <div className="mt-6 w-full">
                            <Button
                                btnType="button"
                                btnName="铸造NFT"
                                classStyles="rounded-xl"
                                handleClick={() => createNFT(formInput, fileUrl, router)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

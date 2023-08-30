import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
    NftMarketplace,
    ItemBought as ItemBoughtEvent,
    ItemCanceled as ItemCanceledEvent,
    ItemListed as ItemListedEvent,
} from "../generated/NftMarketplace/NftMarketplace"
import { ItemListed, ActiveItem, ItemBought, ItemCanceled } from "../generated/schema"
// 处理展示商品的触发事件
export function handleItemListed(event: ItemListedEvent): void {
    let itemListed = ItemListed.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    let activeItem = ActiveItem.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    if (!itemListed) {
        itemListed = new ItemListed(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        )
    }
    if (!activeItem) {
        activeItem = new ActiveItem(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        )
    }
    itemListed.seller = event.params.seller
    activeItem.seller = event.params.seller

    itemListed.nftAddress = event.params.nftAddress
    activeItem.nftAddress = event.params.nftAddress

    itemListed.tokenId = event.params.tokenId
    activeItem.tokenId = event.params.tokenId

    itemListed.price = event.params.price
    activeItem.price = event.params.price

    activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

    itemListed.save()
    activeItem.save()
}
// 处理取消商品的触发事件
export function handleItemCanceled(event: ItemCanceledEvent): void {
    let itemCanceled = ItemCanceled.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    let activeItem = ActiveItem.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    if (!itemCanceled) {
        itemCanceled = new ItemCanceled(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        )
    }
    itemCanceled.seller = event.params.seller
    itemCanceled.nftAddress = event.params.nftAddress
    itemCanceled.tokenId = event.params.tokenId
    // 非空断言操作符（!），它用于指示编译器activeItem不为null或undefined。
    // 如果在运行时activeItem为null或undefined，则会抛出一个运行时错误
    // 代码将一个名为activeItem的对象的buyer属性设置为一个特殊的地址，
    // 该地址表示以太坊区块链上的“死地址”。这个地址通常用于销毁代币或标记无效的交易
    // Address.fromString方法用于将一个十六进制字符串转换为一个Address对象。
    // 在这个例子中，它将字符串"0x000000000000000000000000000000000000dEaD"转换为一个Address对象，并将其赋值给activeItem.buyer
    activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")

    itemCanceled.save()
    activeItem!.save()
}
// 处理购买商品的监听事件
export function handleItemBought(event: ItemBoughtEvent): void {
    let itemBought = ItemBought.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    let activeItem = ActiveItem.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    if (!itemBought) {
        itemBought = new ItemBought(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        )
    }
    itemBought.buyer = event.params.buyer
    itemBought.nftAddress = event.params.nftAddress
    itemBought.tokenId = event.params.tokenId
    activeItem!.buyer = event.params.buyer
    itemBought.save()
    activeItem!.save()
}
// 从事件参数中获取唯一的ID，用于标识特定的NFT
function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
    return tokenId.toHexString() + nftAddress.toHexString()
}

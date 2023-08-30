export const getCreators = (nfts) => {
  const creators = nfts.reduce((creatorObject, nft) => {
    (creatorObject[nft.seller] = creatorObject[nft.seller] || []).push(nft);

    return creatorObject;
  }, {});

  return Object.entries(creators).map((creator) => {
    const seller = creator[0];
    const trasatioin = creator[1] as [TransactionVo];
    const sum = trasatioin.map((item) => Number(item.price)).reduce((prev, curr) => prev + curr, 0);

    return ({ seller, sum });
  });
};

interface TransactionVo {
  price: number
  item: TransactionVo
}

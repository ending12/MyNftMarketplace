### 前言

本项目是我的毕设《基于区块链的个人Dapp设计与实现》开发的Demo。该论文提出要让个人资产可视化，可呈现在日常生活中，利用区块链技术，在以太坊上建立了一个可让资产NFT化，进行简易交易的平台。 

该项目前端使用next.js，智能合约由hardhat，数据存储索引由IPFS加TheGraph框架组成。 与传统的web开发技术相比。Dapp在核心实现在并不复杂，只是加入了区块链对传统的存储方案做了一个改造。

Hardhat是一个开源的以太坊开发环境，它可以用来编译、测试、部署和调试Solidity智能合约。它的设计理念是为开发者提供一个更加高效和可靠的开发环境，同时保持灵活性和可扩展性。Hardhat在以太坊开发社区中非常受欢迎，已经成为了以太坊开发中不可或缺的工具之一。下面列出Hardhat常见的命令操作，命令行组成为Hardhat--<命令>参数。
-- clean 清除缓存和删除所有的预载包
-- compile 编译整个项目，构建预载包 
-- deploy 部署智能合约
-- node 在Hardhat EVM中开启JSON-RPC服务
-- run  在进行项目的编译后执行用户指定的脚本
（1）要创建一个新的Hardhat项目，首先需要安装Hardhat和Node.js。Node.js是一个JavaScript运行时环境，它可以计算机上运行JavaScript代码。首先在官网上获取最新的稳定版Node.js，然后在文件夹创建项目目录，执行“npm install –global yarn”把npm替换为yarn，执行“yarn add hardhat”在安装Hardhat。
（2）安装完成后，在创建好的目录中使用hardhat运行“yarn hardhat create”，来创建一个新的Hardhat项目。如图5.1所示，选择对应模板后，Hardhat会在当前目录中创建一个新的项目，并安装所有必要的依赖项。

![Image](https://user-images.githubusercontent.com/41329085/264258721-8f5f5339-d687-4f47-9088-55532ff65e4a.png)

图5.1  创建Hardhat项目
5.1.2 TheGraph安装与配置
The Graph是一个开源的Web3数据协议和工具套件，用于从以太坊和IPFS等分布式网络中收集和索引数据，并将其提供给开发者进行查询和使用。The Graph旨在为Web3开发者提供更好的数据访问和管理工具，以便他们可以更好地构建去中心化应用程序，以下为TheGraph常见的命令操作。
-- add 增加一个新的数据源到subgraph
-- auth 在部署一个Graph节点时，设置一个要使用的部署密钥
-- build 构建一个subgraph，上传到IPFS中（可选）
-- codegen  为subgraph生成AssemblyScript类型
-- create 注册一个subgraph的名字
-- deploy  部署一个subgraph到Graph节点中
-- remove  解除subgraph名字
-- test 运行rust二进制以进行子图测试
（1）要使用The Graph，需要安装Graph CLI和Graph Node。但由于使用官方提供的线上ApiKey，可以省略在本地安装Graph Node节点运行子图的节点。其中子图是一种定义了如何从区块链上获取和索引数据的规范。在确保安装了Node.js和npm下打开命令行终端并运行 “yarn global add @graphprotocol/graph-cli” 全局安装Graph CLI，然后登录The Graph官网创建subgraph，如图5.2所示。


![Image](https://user-images.githubusercontent.com/41329085/264258819-f91ade05-a757-4509-8e7c-236f34baf5a6.png)


图5.2  注册TheGraph
（2）如图5.3所示，执行“yarn graph init –studio my-marketplace”在当前目录中创建一个名为my-marketplace的新目录，并在其中初始化一个新的子图项目。它会生成一些模板文件，包括子图清单、智能合约ABI和GraphQL模式。附带--studio标志来指示Graph CLI使用The Graph Studio来部署子图。The Graph Studio是一个在线工具，可以快速部署和测试子图，而无需运行本地Graph Node。


![Image](https://user-images.githubusercontent.com/41329085/264258890-f3b3a668-d954-4720-bad8-45a7401d50ce.png)


图5.3  初始化subgraph
（4）如图5.4所示，“graph auth --studio e713b7df9fe415998604230fce1eb530” 运行此命令时，在The Graph Studio网站上登录帐户并获取访问令牌，然后进行授权 The Graph Studio访问令牌。当执行授权成功时Graph CLI会自动验证身份，并将访问令牌存储在本地计算机上。这样使用Graph CLI部署子图到The Graph Studio时，就无需再次输入访问令牌。

 

![Image](https://user-images.githubusercontent.com/41329085/264258917-4c3e49bf-fb93-4b10-8c24-bc0185b47729.png)


图5.4  设置授权密钥
（5）如图5.5所示，graph codegen命令用于根据子图清单和智能合约ABI生成用于描述子图中的实体和事件处理程序的一组TypeScript类型。运行此命令时，Graph CLI会在子图项目的src/types目录中生成类型定义文件。而graph build命令则用于构建子图。它会编译子图项目中的所有TypeScript文件，并生成一个可部署的WASM模块。运行此命令时，Graph CLI会在子图项目的build目录中生成构建结果。


![Image](https://user-images.githubusercontent.com/41329085/264258989-61aba86a-9bf6-4f05-9e3c-c1dac25e50d3.jpg)


图5.5  subgraph构建
（6）如图5.6所示，运行“graph deploy --studio my-marketplace”此命令时，Graph CLI会构建子图项目并将其部署到The Graph Studio。它会使用之前存储的访问令牌来验证身份，并将子图上传到The Graph Studio。当部署完成后，可以在The Graph Studio网站上查看子图的状态和性能指标或在Vscode在客户端编写查询并从The Graph Studio检索数据。


![Image](https://user-images.githubusercontent.com/41329085/264259030-352c281f-26a3-42e8-b935-e9dd0660bfa5.jpg)


图5.6  部署subgraph
（7）如图5.7所示，当返回后台执行“yarn Hardhat run scripts/mint-and-list-item.js --network goerli”生成NFT数据，测试成功并导入了数据。


![Image](https://user-images.githubusercontent.com/41329085/264259065-1384dfab-337f-45c6-8455-86a9c595342d.png)


图5.7  查看thegraph导入的数据
5.2 个人Dapp系统展示
用户通过系统提供前端图形界面来实现与区块链网络的业务交互，不同类型的用户和不同的业务操作都需要通过前端界面传递数据给智能合约实现前后台的数据交互。
1）交易平台首页。当用户进入系统，然后点击“Connect Wallet”连接钱包进行登录（初次点击时要进行签名，注册新账号），首页交易市场会展示需要出售的NFT，如图5.8所示。


![Image](https://user-images.githubusercontent.com/41329085/264259118-d3cc03ea-9858-4ac8-8ab0-533a0f6b3dd4.png)


图5.8  交易平台首页
2）Metamask钱包交互。当用户访问个人Dapp时，会通过请求连接到用户的MetaMask钱包。如果用户同意，系统就可以通过MetaMask与用户的钱包进行交互，如图5.9所示。


![Image](https://user-images.githubusercontent.com/41329085/264259142-78008887-2ca1-479d-a558-b2efed0ad4fa.png)



图5.9  Metamask钱包交互
3）登录与交易。当用户进行登录时，MetaMask会弹出一个窗口，显示交易或调用的详细信息，并要求用户确认操作。如果用户同意，MetaMask会将交易或调用广播到以太坊区块链，并在操作完成后通知用户，最后把链上的数据返回到前端页面进行展示。当用户点击卡片时，可对其内容进行更改，当点击确认时，需支付一定的gas费用即可完成数据的更新，如图5-10，5-11所示。


![Image](https://user-images.githubusercontent.com/41329085/264259186-70716d46-2ccf-4418-b2ba-e16e3b4fbbc9.png)


图5.10  登录后页面


![Image](https://user-images.githubusercontent.com/41329085/264259227-c18afc2a-efc3-4fc7-aef0-44c3a88546aa.png)


图5.11  NFT卡片交易


![Image](https://user-images.githubusercontent.com/41329085/264259556-6a981a11-c9d6-43a3-aad2-5c6764aee908.png)


4）出售NFT界面。可以从其他合约导入NFT资产信息，然后选择提交在交易市场中显示，然后即可在平台上进行交易，如图5.12所示。


![Image](https://user-images.githubusercontent.com/41329085/264259597-3a00b004-db35-4033-ba60-5dc007462a47.png)


图5.12  出售NFT
5）资产铸造界面。可以在页面上传相应的资产信息制作成NFT在个人界面中进行展示，如图5.13所示。


![Image](https://user-images.githubusercontent.com/41329085/264259699-24aa759f-bd07-4e37-8704-72635c690291.png)


图5.13  资产铸造
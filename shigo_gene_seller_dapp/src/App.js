import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const { ethers } = require('ethers')
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

import { allowlistAddresses }  from "./allowlist";


const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

export const StyledLinkWhite = styled.a`
  color: white;
  text-decoration: none;
`;

function App() {
  let flag = 0;
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`MINTボタンを押してNFTをミントしてください。`);
  const [allowlistUserAmountData, setAllowlistUserAmountData] = useState(0);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
    SINGLE_MINT_MODE: false,
  });
  let nameMap;
  let leafNodes;
  let merkleTree;
  let addressId = -1;
  let claimingAddress;
  let hexProof;

  const connectFunc = () =>{
    dispatch(connect());
  }

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost);
    let totalGasLimit = String(gasLimit);
    let allowlistMaxMintAmount;
    let reservedTokenId;
  
    nameMap = allowlistAddresses.map( list => list[0] );
    leafNodes = allowlistAddresses.map(addr => ethers.utils.solidityKeccak256(['address', 'uint256'], [addr[0] , addr[1]]));
    merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
    addressId = nameMap.indexOf(blockchain.account);
    if( addressId == -1){
      //data.whitelistUserAmount = 0;
      reservedTokenId = 0;
      claimingAddress = ethers.utils.solidityKeccak256(['address', 'uint256'], [allowlistAddresses[0][0] , allowlistAddresses[0][1]]);
      hexProof = merkleTree.getHexProof(claimingAddress);    
    }else{
      //data.whitelistUserAmount = allowlistAddresses[addressId][1];
      reservedTokenId = allowlistAddresses[addressId][1];
      claimingAddress = ethers.utils.solidityKeccak256(['address', 'uint256'], [allowlistAddresses[addressId][0] , allowlistAddresses[addressId][1]]);
      hexProof = merkleTree.getHexProof(claimingAddress);    
    }

    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(` ${CONFIG.NFT_NAME} をミントしています。しばらくお待ちください。`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .buy(reservedTokenId,hexProof)
      .send({
        //gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `${CONFIG.NFT_NAME}がミントできました! Opensea.io で確認してみましょう。`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      })
  };



  const getMerkleData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      nameMap = allowlistAddresses.map( list => list[0] );
      addressId = nameMap.indexOf(blockchain.account);

      if( addressId == -1){
        setAllowlistUserAmountData(-1)
      }else{
        setAllowlistUserAmountData(allowlistAddresses[addressId][1]);
      }



    }
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    getMerkleData();
  }, [data.loading]);


  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/left.png"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {CONFIG.NFT_NAME} 
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {CONFIG.SYMBOL} 1枚につき {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  別途ガス代がかかります。ウォレットのHiddenに届く場合があります。
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {CONFIG.NETWORK.NAME} Network のウォレットを接続してください。
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        connectFunc();
                        getData();
                      }}
                    >
                      接続
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >

{
    data.loading == true
    ? "読み込み中です。しばらくお待ちください。"
    : data.paused == false
        //in operation
        ? allowlistUserAmountData == -1
            //not allow list user
            ? "接続したウォレットはアローリストに登録されていません。"
            //allow list user 
            : data.reserved == true
                ? "現在購入可能です。接続したウォレットはアローリストに登録されています。" 
                : "予約分はすでに購入済みです。"
        //stop
        : allowlistUserAmountData == -1
            //not allow list user
            ? "現在停止中です。接続したウォレットはアローリストに登録されていません。" 
            //allow list user
            : data.reserved == true
                ? "現在停止中です。接続したウォレットはアローリストに登録されています。" 
                : "現在停止中です。予約分はすでに購入済みです。"
}

                    </s.TextDescription>

                    <s.TextDescription
                      style={{ textAlign: "center", color: "var(--accent-text)" }}
                    >
                      ウォレットアドレス：{blockchain.account}
                    </s.TextDescription>

                    <s.SpacerMedium />

                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled=
                        
{
//1: disable
//0: able
    claimingNft
    ? 1
    : data.paused == false
        //in operation
        ? allowlistUserAmountData == -1
            //not allow list user
            ? 1
            //allow list user 
            : data.reserved == true
                ? 0
                : 1
        //stop
        : allowlistUserAmountData == -1
            //not allow list user
            ? 1 
            //allow list user
            : data.reserved == true
                ? 1
                : 1
}
                      

                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >

{
    claimingNft
    ? "読み込み中"
    : data.paused == false
        //in operation
        ? allowlistUserAmountData == -1
            //not allow list user
            ? "STOP"
            //allow list user 
            : data.reserved == true
                ? "BUY"
                : "STOP"
        //stop
        : allowlistUserAmountData == -1
            //not allow list user
            ? "STOP"
            //allow list user
            : data.reserved == true
                ? "STOP"
                : "STOP"

}

                      </StyledButton>
                    </s.Container>
                  </>

                )}
              </>
            )}
            <s.SpacerMedium />


            <StyledLinkWhite target={"_blank"} href="https://opensea.io/account?tab=collected">
                  OpenSeaのリンクはこちら
            </StyledLinkWhite>


          </s.Container>

          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/right.png"}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            正しいネットワークに接続されているか確認してください (
            {CONFIG.NETWORK.NAME} Mainnet) 。何度も購入ボタンを押すとその度に購入されますのでご注意ください。
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            ガス代が低すぎると失敗することがあります。適切なガス代を設定してください。
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;

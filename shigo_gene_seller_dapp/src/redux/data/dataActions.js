// log
import store from "../store";
import { allowlistAddresses }  from "../../allowlist";


const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {

      const blockchain = store.getState().blockchain
      let nameMap = allowlistAddresses.map( list => list[0] );
      let addressId = nameMap.indexOf(blockchain.account);

      let paused = await store.getState().blockchain.smartContract.methods.paused().call();
      let reservedTokenId = -1;
      let reserved = false;
      if( addressId == -1){
        reserved = false;
      }else{
        reservedTokenId = allowlistAddresses[addressId][1];
        reserved = await store.getState().blockchain.smartContract.methods.NFTinStock(reservedTokenId).call();
      }

      //let onlyAllowlisted = await store.getState().blockchain.smartContract.methods.onlyAllowlisted().call()
      //let maxMintAmountPerTransaction = await store.getState().blockchain.smartContract.methods.maxMintAmountPerTransaction().call();
      //let mintCount = await store.getState().blockchain.smartContract.methods.mintCount().call()
      //let publicSaleMaxMintAmountPerAddress = await store.getState().blockchain.smartContract.methods.publicSaleMaxMintAmountPerAddress().call()
      //let allowlistUserAmount = await store.getState().blockchain.smartContract.methods.getAllowlistUserAmount(blockchain.account).call()
      //let allowlistType = await store.getState().blockchain.smartContract.methods.allowlistType().call()

      dispatch(
        fetchDataSuccess({
          paused,
          reservedTokenId,
          reserved,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};

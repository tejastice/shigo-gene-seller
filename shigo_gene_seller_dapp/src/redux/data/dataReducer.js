const initialState = {
  loading: false,
  cost: 0,
  paused: true,
  reservedTokenId: 0,
  reserved: false,
  error: false,
  errorMsg: "",
};


const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,
        loading: false,
        paused: action.payload.paused,
        reservedTokenId: action.payload.reservedTokenId,
        reserved: action.payload.reserved,
        error: false,
        errorMsg: "",
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        errorMsg: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;

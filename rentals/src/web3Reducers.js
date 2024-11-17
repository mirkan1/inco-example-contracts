import { createSlice } from '@reduxjs/toolkit'

export const web3AccountAdder = createSlice({
  name: 'account',
  initialState: {
    value: null,
    balance: null,
    contract: null,
    recentGames: null,
    provider: null,
    isConnected: false,
    totalBets: 0,
    isItHead: null,
    TotalBetCounter: 0,
    waitingForFlip: false,
    winAnimationStatus: false,
    networkId: 1,
    infoText: false,
    totalItems: null,
    itemsArr: [],
    currentItem: null,
    _userChanged: false,
    currentItemRendered: false,
    rederedItem: null,
  },
  reducers: {
    add: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value = action.payload
    },
    remove: (state) => {
      state.value = null
    },
    changeBalance: (state, action) => {
      state.balance = action.payload
    },
    changeBalanceNull: (state) => {
      state.balance = null
    },
    changeContractNull: (state) => {
      state.contract = null
    },
    changeContract: (state, action) => {
      state.contract = action.payload
    },
    addRecentGames: (state, action) => {
      state.recentGames = action.payload
    },
    addProvider: (state, action) => {
      state.provider = action.payload
    },
    setConnection: (state, action) => {
      state.isConnected = action.payload
    },
    setNetworkId: (state, action) => {
      state.networkId = action.payload
    },
    setInfoText: (state, action) => {
      state.infoText = action.payload
    },
    setAccount: (state, action) => {
      state.value = action.payload
    },
    setTotalItems: (state, action) => {
      state.totalItems = action.payload
    },
    setItemsArr: (state, action) => {
      state.itemsArr = action.payload
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload
    },
    userChangeStatus: (state, action) => {
      state._userChanged = action.payload
    },
    didRenderedCurrentItem: (state, action) => {
      state.currentItemRendered = action.payload
    },
    renderSpesificItem: (state, action) => {
      state.rederedItem = state.itemsArr[action.payload];
    }
  },
})

// Action creators are generated for each case reducer function
export const {
  add, remove, changeBalance, changeContract, changeBalanceNull, addProvider,
  changeContractNull, renderSpesificItem, setItemsArr, didRenderedCurrentItem, userChangeStatus,
  setCurrentItem, addRecentGames, setTotalItems, setConnection, setNetworkId, setInfoText, setAccount
} = web3AccountAdder.actions;

export default web3AccountAdder.reducer;

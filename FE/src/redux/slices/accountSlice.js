import { createSlice } from '@reduxjs/toolkit';

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    address: 'where am i',
    balance: 'poor',
    userName: 'no name lol',
    gmail: 'no gmail lol',
    currentGold: 'no',
    currentSilver: 'nein',
    currentBronze: 'iie',
    currentNFT: 'no nft for me',
    currentMoney: 'where erc20?',
    currentBoxesOwned: [],
    totalStep: 'no leg',
  },
  reducers: {
    updateAccountData: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateAddress: (state, action) => {
      state.address = action.payload;
    },
    updateBalance: (state, action) => {
      state.balance = Number(action.payload);
    },
    updateUserName: (state, action) => {
      state.userName = action.payload;
    },
    updateGmail: (state, action) => {
      state.gmail = action.payload;
    },
    updateCurrentGold: (state, action) => {
      state.currentGold = Number(action.payload);
    },
    updateCurrentSilver: (state, action) => {
      state.currentSilver = Number(action.payload);
    },
    updateCurrentBronze: (state, action) => {
      state.currentBronze = Number(action.payload);
    },
    updateCurrentNFT: (state, action) => {
      state.currentNFT = Number(action.payload);
    },
    updateCurrentMoney: (state, action) => {
      state.currentMoney = Number(action.payload);
    },
    updateCurrentBoxesOwned: (state, action) => {
      state.currentBoxesOwned = action.payload;
    },
    updateTotalStep: (state, action) => {
      state.totalStep = Number(action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  updateAccountData,
  updateAddress,
  updateBalance,
  updateUserName,
  updateGmail,
  updateCurrentGold,
  updateCurrentSilver,
  updateCurrentBronze,
  updateCurrentNFT,
  updateCurrentMoney,
  updateCurrentBoxesOwned,
  updateTotalStep,
} = accountSlice.actions;

export default accountSlice.reducer;

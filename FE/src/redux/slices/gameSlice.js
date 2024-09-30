import { createSlice } from '@reduxjs/toolkit';

export const gameSlice = createSlice({
  name: 'game',
  initialState: {
    goldNeed: 0,
    silverNeed: 0,
    bronzeNeed: 0,
    stepNeed: 0,
    moneyPerNFT: 0,
  },
  reducers: {
    updateGameData: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateGoldNeed: (state, action) => {
      state.goldNeed = Number(action.payload);
    },
    updateSilverNeed: (state, action) => {
      state.silverNeed = Number(action.payload);
    },
    updateBronzeNeed: (state, action) => {
      state.bronzeNeed = Number(action.payload);
    },
    updateStepNeed: (state, action) => {
      state.stepNeed = Number(action.payload);
    },
    updateMoneyPerNFT: (state, action) => {
      state.moneyPerNFT = Number(action.payload);
    },
  },
});

export const {
  updateGameData,
  updateGoldNeed,
  updateSilverNeed,
  updateBronzeNeed,
  updateStepNeed,
  updateMoneyPerNFT,
} = gameSlice.actions;

export default gameSlice.reducer;

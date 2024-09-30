import { createSlice } from '@reduxjs/toolkit';
import { sessionStorage } from '../../utils/webStorage';

const initialState = {
  isLogin: sessionStorage && sessionStorage.getItem('isLogin') === 'true',
  isLoading: true,
  isTransactioning: false,
  chainNetworkConnected: false,
  toggleUpdate: false,
};
let restartState = { ...initialState, isLogin: false };

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUser: () => {
      if (sessionStorage) {
        sessionStorage.setItem('isLogin', false);
      }
      return restartState;
    },
    login: (state) => {
      if (sessionStorage) {
        sessionStorage.setItem('isLogin', true);
      }
      state.isLogin = true;
    },
    logout: (state) => {
      if (sessionStorage) {
        sessionStorage.setItem('isLogin', false);
      }
      state.isLogin = false;
    },
    connectChainNetwork: (state) => {
      state.chainNetworkConnected = true;
    },
    disconnectChainNetwork: (state) => {
      state.chainNetworkConnected = false;
    },
    loadingData: (state) => {
      state.isLoading = true;
    },
    finishLoadingData: (state) => {
      state.isLoading = false;
    },
    haveTransaction: (state) => {
      state.isTransactioning = true;
    },
    finishTransaction: (state) => {
      state.isTransactioning = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  resetUser,
  login,
  logout,
  connectChainNetwork,
  disconnectChainNetwork,
  loadingData,
  finishLoadingData,
  haveTransaction,
  finishTransaction,
} = userSlice.actions;

export default userSlice.reducer;

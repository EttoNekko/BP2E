import { configureStore, applyMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './saga/saga';
import userReducer from './slices/userSlice';
import accountReducer from './slices/accountSlice';
import gameReducer from './slices/gameSlice';

// const sagaMiddleware = createSagaMiddleware();

export default configureStore({
  reducer: {
    user: userReducer,
    account: accountReducer,
    game: gameReducer,
  },
  // middleware: [sagaMiddleware],
});
// sagaMiddleware.run(rootSaga);

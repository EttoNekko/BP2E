import { all, call, put, takeLatest } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';

export const sayHelloAsync = createAction('sayHello');

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export function* helloSaga() {
  console.log('Hello Sagas!');
}

export function* helloAgainSaga() {
  yield delay(1000);
  console.log('Hello Sagas Again!');
}

export function* watchHelloAsync() {
  yield takeEvery(sayHelloAsync, helloAgainSaga);
}

export default function* rootSaga() {
  yield all([helloSaga(), watchHelloAsync()]);
}

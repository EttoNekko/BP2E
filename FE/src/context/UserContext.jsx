import { createContext, useContext, useState } from 'react';
import { toast, Bounce, Slide } from 'react-toastify';
import BoxReward from '../components/Box/BoxReward';

const UserContext = createContext();

export default function UserContextProvider({ children }) {
  return <UserContext.Provider value={{}}>{children}</UserContext.Provider>;
}

export const notifyUser = (message) => {
  let options = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Slide,
  };
  toast(`${message}`, options);
};
export const notifyReward = (amount, pieceId) => {
  let options = {
    position: 'top-center',
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Bounce,
  };
  toast(<BoxReward amount={amount} pieceId={pieceId} />, options);
};

export const getUserContext = () => {
  return useContext(UserContext);
};

import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export default function UserContextProvider({ children }) {
  const [user, setUser] = useState({
    isLogin: false,

    toggleUpdate: false,
  });
  const [account, setAccount] = useState({
    address: 'where am i',
    currentGold: 'no',
    currentSilver: 'nein',
    currentBronze: 'iie',
    currentNFT: 'no nft for me',
    currentBoxesOwned: [],
  });

  return (
    <UserContext.Provider value={{ user, setUser, account, setAccount }}>
      {children}
    </UserContext.Provider>
  );
}

export const userInfo = () => {
  return useContext(UserContext);
};

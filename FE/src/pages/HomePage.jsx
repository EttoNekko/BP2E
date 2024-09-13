import React, { useEffect } from 'react';
import { providers, utils, Contract } from 'ethers';
import { userInfo } from '../context/UserContext';
import pieceGeneratorAbi from '../contracts/PieceGeneratorAbi';
import moneyGeneratorAbi from '../contracts/MoneyGeneratorAbi';
import { formatIntFromChain } from '../utils/format';

const HomePage = () => {
  const { user, account, setAccount, blockchain } = userInfo();

  const provider = new providers.Web3Provider(window.ethereum);

  async function getAccountInfo() {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const pieceGeneratorContract = new Contract(
      import.meta.env.VITE_pieceGenerator_Address,
      pieceGeneratorAbi,
      signer,
    );
    const moneyGeneratorContract = new Contract(
      import.meta.env.VITE_moneyGenerator_Address,
      moneyGeneratorAbi,
      signer,
    );
    const balanceWei = await provider.getBalance(signerAddress);
    const balanceETH = utils.formatEther(balanceWei);
    const currentGold = formatIntFromChain(
      await pieceGeneratorContract.balanceOf(signerAddress, 0),
    );
    const currentSilver = formatIntFromChain(
      await pieceGeneratorContract.balanceOf(signerAddress, 1),
    );
    const currentBronze = formatIntFromChain(
      await pieceGeneratorContract.balanceOf(signerAddress, 2),
    );
    const currentNFT = formatIntFromChain(
      await moneyGeneratorContract.balanceOf(signerAddress),
    );

    setAccount({
      ...account,
      balance: balanceETH,
      currentGold,
      currentSilver,
      currentBronze,
      currentNFT,
    });
  }

  useEffect(() => {
    if (user.isLogin && user.chainNetworkConnected) {
      getAccountInfo();
    }
  }, [user.isLogin, user.chainNetworkConnected]);

  return (
    <>
      {!user.isLogin ? (
        <p className='h-screen w-screen place-content-center text-center'>
          Nothing here lol
        </p>
      ) : (
        <>
          {!account.balance ? (
            <p className='h-screen w-screen place-content-center text-center'>
              Loading user info
            </p>
          ) : (
            <>
              <p className='text-center text-base'>
                ETH balance: {account.balance}
              </p>
              <p className='text-center text-base'>
                gold amount: {account.currentGold}
              </p>
              <p className='text-center text-base'>
                silver amount: {account.currentSilver}
              </p>
              <p className='text-center text-base'>
                bronze amount: {account.currentBronze}
              </p>
              <p className='text-center text-base'>
                NFTeehee amount: {account.currentNFT}
              </p>
            </>
          )}
        </>
      )}
    </>
  );
};

export default HomePage;

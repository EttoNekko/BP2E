import React, { useCallback, useEffect, useState } from 'react';
import { providers, utils, Contract } from 'ethers';
import { userInfo } from '../context/UserContext';
import pieceGeneratorAbi from '../contracts/PieceGeneratorAbi';
import moneyGeneratorAbi from '../contracts/MoneyGeneratorAbi';

const HomePage = () => {
  const { user, account, setAccount, blockchain } = userInfo();

  const provider = new providers.Web3Provider(window.ethereum);
  const [pieceNeed, setPieceNeed] = useState([0, 0, 0]);
  const [amountUse, setAmountUse] = useState([0, 0, 0]);
  const [pieceChoose, setPieceChoose] = useState(0);

  const updatePieceUseInput = (e, i) => {
    let newPieceUse = [...amountUse];
    newPieceUse[i] = e.target.value.replace(/\D/, '');
    setAmountUse(newPieceUse);
  };

  const choosePiece = (i) => {
    setPieceChoose(i);
  };

  const combinePieces = async () => {
    let currentPiece;
    switch (pieceChoose) {
      case 0:
        currentPiece = account.currentGold;
        break;
      case 1:
        currentPiece = account.currentSilver;
        break;
      case 2:
        currentPiece = account.currentBronze;
        break;
    }
    let amountInput = parseInt(amountUse[pieceChoose]);
    if (amountInput == 0) {
      window.alert('you dont want NFT?');
      return;
    }
    if (currentPiece < pieceNeed[pieceChoose] * amountInput) {
      window.alert('not enough piece for amount');
      return;
    }
    const signer = provider.getSigner();
    const pieceGeneratorContract = new Contract(
      import.meta.env.VITE_pieceGenerator_Address,
      pieceGeneratorAbi,
      signer,
    );
    let combinePiecesTx = await pieceGeneratorContract.combinePieces(
      pieceChoose,
      amountInput,
      {
        nonce: await signer.getTransactionCount(),
      },
    );
    await combinePiecesTx.wait();

    let listenForPieceCombined = async (user, pieceType, amount, pieceLeft) => {
      if (!account.address == user) return;

      amount = utils.formatUnits(amount, 0);
      pieceLeft = utils.formatUnits(pieceLeft, 0);
      window.alert(
        `you get ${amount} and have ${pieceLeft} of ${pieceType} left`,
      );
      let newAccount = { ...account };
      switch (pieceType) {
        case 0:
          newAccount.currentGold = pieceLeft;
          break;
        case 1:
          newAccount.currentSilver = pieceLeft;
          break;
        case 2:
          newAccount.currentBronze = pieceLeft;
          break;
      }
      newAccount.currentNFT = Number(Number(newAccount.currentNFT) + amount);
      setAccount(newAccount);
      pieceGeneratorContract.off('PieceCombined', listenForPieceCombined);
    };
    pieceGeneratorContract.on('PieceCombined', listenForPieceCombined);
  };

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
    const currentGold = utils.formatUnits(
      await pieceGeneratorContract.balanceOf(signerAddress, 0),
      0,
    );
    const currentSilver = utils.formatUnits(
      await pieceGeneratorContract.balanceOf(signerAddress, 1),
      0,
    );
    const currentBronze = utils.formatUnits(
      await pieceGeneratorContract.balanceOf(signerAddress, 2),
      0,
    );
    const currentNFT = utils.formatUnits(
      await moneyGeneratorContract.balanceOf(signerAddress),
      0,
    );
    const totalStep = utils.formatUnits(
      await pieceGeneratorContract.totalStepsRun(signerAddress),
      0,
    );
    let pieceTypes = await pieceGeneratorContract.pieceTypes();
    let pieceTypeRequired = [];
    for (let i = 0; i < pieceTypes; i++) {
      pieceTypeRequired[i] = await pieceGeneratorContract.pieceTypeRequired(i);
    }
    setPieceNeed(pieceTypeRequired);

    setAccount({
      ...account,
      balance: balanceETH,
      currentGold,
      currentSilver,
      currentBronze,
      currentNFT,
      totalStep,
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
            <div className='w-full place-content-center'>
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
              <p className='text-center text-base'>
                Total step: {account.totalStep}
              </p>
              <div className='mx-auto flex w-2/3 items-center justify-between'>
                <p>Gold required: {`${pieceNeed[0]}`}</p>
                <p>Silver required: {`${pieceNeed[1]}`}</p>
                <p>Bronze required: {`${pieceNeed[2]}`}</p>
              </div>
              <div className='mx-auto flex w-2/3 items-center justify-between gap-x-2'>
                <input
                  type='text'
                  className='w-1/4 focus:border-4 focus:border-solid focus:border-green-500'
                  pattern='[0-9]*'
                  onMouseDown={() => choosePiece(0)}
                  value={amountUse[0]}
                  onChange={(e) => updatePieceUseInput(e, 0)}
                />
                <input
                  type='text'
                  className='w-1/4 focus:border-4 focus:border-solid focus:border-green-500'
                  pattern='[0-9]*'
                  onMouseDown={() => choosePiece(1)}
                  value={amountUse[1]}
                  onChange={(e) => updatePieceUseInput(e, 1)}
                />
                <input
                  type='text'
                  className='w-1/4 focus:border-4 focus:border-solid focus:border-green-500'
                  pattern='[0-9]*'
                  onMouseDown={() => choosePiece(2)}
                  value={amountUse[2]}
                  onChange={(e) => updatePieceUseInput(e, 2)}
                />
              </div>
              <button
                onMouseDown={combinePieces}
                className='mx-auto block rounded-md bg-green-500 p-2 text-center text-base disabled:bg-gray-500'
              >
                Combine
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HomePage;

import React, { useState } from 'react';
import { providers, utils, Contract } from 'ethers';
import { userInfo } from '../context/UserContext';
import pieceGeneratorAbi from '../contracts/PieceGeneratorAbi';

const BoxDetail = ({ boxId, setToggleBoxDetail }) => {
  const { account, setAccount } = userInfo();
  const [isBuying, setIsBuying] = useState(false);

  const provider = new providers.Web3Provider(window.ethereum);
  const box = account.currentBoxesOwned[boxId];

  const buyBox = async () => {
    setIsBuying(true);
    const signer = provider.getSigner();
    const pieceGeneratorContract = new Contract(
      import.meta.env.VITE_pieceGenerator_Address,
      pieceGeneratorAbi,
      signer,
    );
    const buyBoxTx = await pieceGeneratorContract.buyBox(boxId, {
      value: utils.parseEther(box.boxType.price),
      nonce: await signer.getTransactionCount(),
    });
    await buyBoxTx.wait();

    box.quantity++;
    setAccount(account);
    setIsBuying(false);
  };

  const openBox = async () => {
    if (box.quantity <= 0) {
      window.alert('u no box');
      return;
    }
    setIsBuying(true);
    const signer = provider.getSigner();
    const pieceGeneratorContract = new Contract(
      import.meta.env.VITE_pieceGenerator_Address,
      pieceGeneratorAbi,
      signer,
    );
    const openBoxTx = await pieceGeneratorContract.openBox(boxId, {
      nonce: await signer.getTransactionCount(),
    });
    await openBoxTx.wait();
    let listenForPieceGot = async (user, pieceGot, amount) => {
      if (!account.address == user) return;
      box.quantity--;
      window.alert(`you get ${amount} pieces of ${pieceGot}`);
      setAccount(account);
      setIsBuying(false);
      pieceGeneratorContract.off('PieceGot', listenForPieceGot);
    };
    pieceGeneratorContract.on('PieceGot', listenForPieceGot);
  };

  return (
    <div
      className='fixed inset-0 z-10 h-screen w-screen place-content-center bg-none backdrop-blur-sm'
      onClick={(e) => {
        e.stopPropagation();
        setToggleBoxDetail(false);
      }}
    >
      <div
        className='relative z-20 m-auto h-80 w-80 bg-green-300 p-5'
        onClick={(e) => e.stopPropagation()}
      >
        <p>Gold: {box.boxType.GOLD}</p>
        <p>Silver: {box.boxType.SILVER}</p>
        <p>Bronze: {box.boxType.BRONZE}</p>
        <p>Price: {box.boxType.price} ETH</p>
        <p>quantity: {box.quantity}</p>
        <div className='absolute bottom-5 left-0 flex w-full justify-evenly'>
          <button
            disabled={isBuying}
            onClick={buyBox}
            className='w-1/3 rounded-md bg-red-500 p-2 disabled:bg-gray-500'
          >
            Buy
          </button>
          <button
            disabled={isBuying}
            onClick={openBox}
            className='w-1/3 rounded-md bg-blue-500 p-2 disabled:bg-gray-500'
          >
            Open X3
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxDetail;

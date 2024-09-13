import React, { useState } from 'react';
import { userInfo } from '../context/UserContext';
import pieceGeneratorAbi from '../contracts/PieceGeneratorAbi';

const BoxDetail = ({ boxId, setToggleBoxDetail }) => {
  const { account, blockchain } = userInfo();
  const [isBuying, setIsBuying] = useState(false);
  const box = account.currentBoxesOwned[boxId];

  const buyBox = async () => {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const pieceGeneratorContract = new Contract(
      import.meta.env.VITE_pieceGenerator_Address,
      pieceGeneratorAbi,
      signer,
    );
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
            className='w-1/3 rounded-md bg-red-500 p-2'
          >
            Buy
          </button>
          <button
            disabled={isBuying}
            className='w-1/3 rounded-md bg-blue-500 p-2'
          >
            Open X3
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxDetail;

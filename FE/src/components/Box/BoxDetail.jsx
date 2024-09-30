import React, { useState } from 'react';
import { providers, utils, Contract } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateCurrentBoxesOwned,
  updateCurrentGold,
  updateCurrentBronze,
  updateCurrentSilver,
  updateBalance,
} from '../../redux/slices/accountSlice';
import { buyBox, openBox } from '../../Blockchain/contracts/methods/pieceGenerator';
import pieceGeneratorAbi from '../../Blockchain/contracts/Abi/PieceGeneratorAbi';
import { finishTransaction, haveTransaction } from '../../redux/slices/userSlice';
import { notifyReward, notifyUser } from '../../context/UserContext';
import { getAccountETHBalance, pieceGeneratorContract } from '../../Blockchain/Metamask';
import { Card, CardHeader, Typography } from '@material-tailwind/react';
const UPDATE = {
  GOLD: 0,
  SILVER: 1,
  BRONZE: 2,
};
const BoxDetail = ({ boxId, setToggleBoxDetail }) => {
  const goldImgUri = 'src/assets/pieces/Gold_Ingot.png';
  const silverImgUri = 'src/assets/pieces/Silver_Ingot.png';
  const bronzeImgUri = 'src/assets/pieces/Bronze_Ingot.png';

  const dispatch = useDispatch();
  const isTransactioning = useSelector((state) => state.user.isTransactioning);

  const { address, balanceETH, currentGold, currentSilver, currentBronze, currentBoxesOwned } =
    useSelector((state) => state.account);

  const box = currentBoxesOwned[boxId];

  const goldNum = box.boxType.GOLD;
  const silverNum = box.boxType.SILVER;
  const bronzeNum = box.boxType.BRONZE;

  const goldChance = !goldNum
    ? 0
    : Math.floor((Math.abs(goldNum - (silverNum ? silverNum : bronzeNum)) / 10) * 100);
  const silverChance = !silverNum ? 0 : Math.floor((Math.abs(silverNum - bronzeNum) / 10) * 100);
  const bronzeChance = !bronzeNum ? 0 : Math.floor((Math.abs(bronzeNum - 0) / 10) * 100);

  const ClickBuyBox = async () => {
    dispatch(haveTransaction());

    if (balanceETH < box.boxType.price) {
      notifyUser('Not enough money for box');
      dispatch(finishTransaction());
      return;
    }
    await buyBox(boxId, box.boxType.price).then(async () => {
      const _balanceETH = await getAccountETHBalance();
      dispatch(updateBalance(_balanceETH));
      dispatch(
        updateCurrentBoxesOwned(
          currentBoxesOwned.map((box) => {
            if (box.boxId === boxId) return { ...box, quantity: box.quantity + 1 };
            return box;
          }),
        ),
      );
    });
    dispatch(finishTransaction());
    notifyUser(`You buy box number ${boxId + 1}`);
  };

  const ClickOpenBox = async () => {
    dispatch(haveTransaction());

    if (box.quantity <= 0) {
      notifyUser('u no box');
      dispatch(finishTransaction());
      return;
    }
    await openBox(boxId);
    let listenForPieceGot = async (user, pieceGot, amount) => {
      if (!address == user) return;
      switch (pieceGot) {
        case UPDATE.GOLD:
          dispatch(updateCurrentGold(currentGold + amount));
          break;
        case UPDATE.SILVER:
          dispatch(updateCurrentSilver(currentSilver + amount));
          break;
        case UPDATE.BRONZE:
          dispatch(updateCurrentBronze(currentBronze + amount));
          break;
      }

      dispatch(
        updateCurrentBoxesOwned(
          currentBoxesOwned.map((box) => {
            if (box.boxId == boxId) return { ...box, quantity: box.quantity - 1 };
            return box;
          }),
        ),
      );
      notifyReward(amount, pieceGot);

      pieceGeneratorContract.off('PieceGot', listenForPieceGot);
      dispatch(finishTransaction());
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
      <Card
        variant='gradient'
        className='relative z-20 m-auto h-80 w-80 bg-green-300 p-5'
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant='h5' className='mb-2 text-center'>
          Piece Chances
        </Typography>

        <div className='mb-5 flex justify-between'>
          <div className='flex items-center gap-2'>
            <img src={goldImgUri} className='size-10 object-scale-down' />
            <p>{goldChance}%</p>
          </div>
          <div className='flex items-center gap-2'>
            <img src={silverImgUri} className='size-10 object-scale-down' />
            <p>{silverChance}%</p>
          </div>
          <div className='flex items-center gap-2'>
            <img src={bronzeImgUri} className='size-10 object-scale-down' />
            <p>{bronzeChance}%</p>
          </div>
        </div>

        {/* <div className='mb-5 flex justify-between'>
          <div className='flex items-center gap-2'>
            <img src={goldImgUri} className='size-10 object-scale-down' />
            <p>{box.boxType.GOLD}</p>
          </div>
          <div className='flex items-center gap-2'>
            <img src={silverImgUri} className='size-10 object-scale-down' />
            <p>{box.boxType.SILVER}</p>
          </div>
          <div className='flex items-center gap-2'>
            <img src={bronzeImgUri} className='size-10 object-scale-down' />
            <p>{box.boxType.BRONZE}</p>
          </div>
        </div> */}

        <p className='mb-10 text-center'>
          You have {box.quantity} {box.quantity <= 1 ? 'box' : 'boxes'}
        </p>
        <Typography variant='h3' className='text-center font-bold'>
          Price: <i>{Math.round((box.boxType.price + Number.EPSILON) * 100) / 100} ETH</i>
        </Typography>
        <div className='absolute bottom-7 left-0 flex w-full justify-evenly'>
          <button
            disabled={isTransactioning}
            onClick={ClickBuyBox}
            className='w-1/3 rounded-md bg-red-500 p-2 disabled:bg-gray-500'
          >
            Buy
          </button>
          <button
            disabled={isTransactioning}
            onClick={ClickOpenBox}
            className='w-1/3 rounded-md bg-blue-500 p-2 disabled:bg-gray-500'
          >
            Open X3
          </button>
        </div>
      </Card>
    </div>
  );
};

export default BoxDetail;

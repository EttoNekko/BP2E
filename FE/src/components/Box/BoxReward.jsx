import React from 'react';
import { pieceType } from '../../Blockchain/contracts/methods/pieceGenerator';

const BoxReward = ({ amount, pieceId }) => {
  let pieceGot;
  const goldImgUri = 'src/assets/pieces/Gold_Ingot.png';
  const silverImgUri = 'src/assets/pieces/Silver_Ingot.png';
  const bronzeImgUri = 'src/assets/pieces/Bronze_Ingot.png';
  let pieceImgUri;

  switch (pieceId) {
    case pieceType.Gold:
      pieceGot = 'Gold';
      pieceImgUri = goldImgUri;
      break;
    case pieceType.Silver:
      pieceGot = 'Silver';
      pieceImgUri = silverImgUri;
      break;
    case pieceType.Bronze:
      pieceGot = 'Bronze';
      pieceImgUri = bronzeImgUri;
      break;
  }

  return (
    <>
      <div className=''>
        <p className='text-center'>{`🎉Congratulation🎉`}</p>
        <div className='flex place-content-center items-center gap-2 text-lg'>
          <p>
            You get {amount} {pieceGot}
          </p>
          <img src={pieceImgUri} className='size-6 object-scale-down' />
        </div>
      </div>
    </>
  );
};

export default BoxReward;

import { React, useState } from 'react';
import BoxDetail from '../components/Box/BoxDetail';
import { useSelector, useDispatch } from 'react-redux';
import { updateCurrentBoxesOwned } from '../redux/slices/accountSlice';
import {} from '../Blockchain/contracts/methods/pieceGenerator';
import { BoxCard } from '../components/Box/BoxCard';

const BoxPage = () => {
  const dispatch = useDispatch();
  const { isLogin, isLoading, chainNetworkConnected } = useSelector((state) => state.user);

  const currentBoxesOwned = useSelector((state) => state.account.currentBoxesOwned);

  const [toggleBoxDetail, setToggleBoxDetail] = useState(false);
  const [currentBoxId, setCurrentBoxId] = useState(0);

  return (
    <>
      {!isLogin || !chainNetworkConnected ? (
        <p className='h-screen w-screen place-content-center text-center'>
          Connect to Metamask to play
        </p>
      ) : (
        <>
          {isLoading ? (
            <p className='h-screen w-screen place-content-center text-center'>Loading box</p>
          ) : (
            <div className='gray-padding h-screen w-screen px-5 pt-6 lg:px-32 xl:px-48'>
              <ul className='flex w-full flex-wrap justify-evenly gap-12'>
                {currentBoxesOwned.map((b) => {
                  return (
                    // <li
                    //   key={b.boxId}
                    //   className='bg-pink-500 text-center text-base'
                    // onClick={() => {
                    //   setCurrentBoxId(b.boxId);
                    //   setToggleBoxDetail(true);
                    // }}
                    // >
                    //   <img
                    //     src='src/assets/mystery_box.png'
                    //     alt=''
                    //     className='block w-full object-scale-down align-baseline'
                    //   />
                    //   <p className='align-baseline'>Box Id: {b.boxId}</p>
                    //   <p className='align-baseline'>quantity: {b.quantity}</p>
                    // </li>
                    <BoxCard
                      key={b.boxId}
                      boxId={b.boxId}
                      onClick={() => {
                        setCurrentBoxId(b.boxId);
                        setToggleBoxDetail(true);
                      }}
                    />
                  );
                })}
              </ul>
            </div>
          )}
          {toggleBoxDetail ? (
            <BoxDetail boxId={currentBoxId} setToggleBoxDetail={setToggleBoxDetail}></BoxDetail>
          ) : null}
        </>
      )}
    </>
  );
};

export default BoxPage;

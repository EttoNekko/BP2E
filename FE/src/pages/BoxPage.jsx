import { React, useEffect, useState } from 'react';
import { providers, utils, Contract } from 'ethers';
import { userInfo } from '../context/UserContext';
import pieceGeneratorAbi from '../contracts/PieceGeneratorAbi';
import BoxDetail from '../components/BoxDetail';

const BoxPage = () => {
  const { user, account, setAccount, blockchain } = userInfo();
  const provider = new providers.Web3Provider(window.ethereum);

  const [toggleBoxDetail, setToggleBoxDetail] = useState(false);
  const [currentBoxId, setCurrentBoxId] = useState(0);

  const getAccountBoxInfo = async () => {
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const pieceGeneratorContract = new Contract(
      import.meta.env.VITE_pieceGenerator_Address,
      pieceGeneratorAbi,
      signer,
    );
    let currentBoxesOwned = [];
    const boxTypeCount = await pieceGeneratorContract.boxTypeCount();
    for (let i = 0; i < boxTypeCount; i++) {
      let { GOLD, SILVER, BRONZE, price } =
        await pieceGeneratorContract.boxTypes(i);
      let quantity = utils.formatUnits(
        await pieceGeneratorContract.boxesOwned(signerAddress, i),
        0,
      );
      currentBoxesOwned.push({
        boxId: i,
        boxType: {
          GOLD,
          SILVER,
          BRONZE,
          price: utils.formatEther(price),
        },
        quantity,
      });
    }
    setAccount({
      ...account,
      currentBoxesOwned,
    });
  };

  useEffect(() => {
    if (user.isLogin && user.chainNetworkConnected) {
      getAccountBoxInfo();
    }
  }, [user.isLogin, user.chainNetworkConnected]);

  return (
    <>
      {!user.isLogin ? (
        <p className='h-screen w-screen place-content-center text-center'>
          No box here lol
        </p>
      ) : (
        <>
          {account.currentBoxesOwned.length <= 0 ? (
            <p className='h-screen w-screen place-content-center text-center'>
              Loading box
            </p>
          ) : (
            <ul className='flex w-screen flex-wrap justify-evenly gap-10 p-10'>
              {account.currentBoxesOwned.map((b) => {
                return (
                  <li
                    key={b.boxId}
                    className='bg-pink-500 text-center text-base'
                    onClick={() => {
                      setCurrentBoxId(b.boxId);
                      setToggleBoxDetail(true);
                    }}
                  >
                    <img
                      src='src/assets/mystery_box.png'
                      alt=''
                      className='block w-full object-scale-down align-baseline'
                    />
                    <p className='align-baseline'>Box Id: {b.boxId}</p>
                    <p className='align-baseline'>quantity: {b.quantity}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {toggleBoxDetail ? (
            <BoxDetail
              boxId={currentBoxId}
              setToggleBoxDetail={setToggleBoxDetail}
            ></BoxDetail>
          ) : null}
        </>
      )}
    </>
  );
};

export default BoxPage;

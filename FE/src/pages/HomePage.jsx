import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@apollo/client';
import { Button, FloatingLabel, HR } from 'flowbite-react';
import { Select, Option, Typography } from '@material-tailwind/react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateCurrentBronze,
  updateCurrentGold,
  updateCurrentNFT,
  updateCurrentSilver,
  updateTotalStep,
  updateUserName,
} from '../redux/slices/accountSlice';
import { combinePieces, pieceType } from '../Blockchain/contracts/methods/pieceGenerator';
import { finishTransaction, haveTransaction } from '../redux/slices/userSlice';
import { notifyUser } from '../context/UserContext';
import MTNumberInput from '../components/Input/MTNumberInput';
import { mutateUserByAddress } from '../graphql/user.gql';
import { redirect } from 'react-router-dom';
import { handleTransRefuse } from '../Blockchain/Metamask';
// import { connectNewSigner } from '../Blockchain/Metamask';

const cHRTheme = {
  root: { base: 'my-5 h-px border-0 bg-gray-200 dark:bg-gray-700' },
};
const cFloatLabelTheme = {
  input: {
    default: {
      outlined: {
        sm: 'peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-xs text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500',
        md: 'peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500',
      },
    },
  },
  helperText: { default: 'mt-0 text-xs text-gray-600 dark:text-gray-400' },
};

const HomePage = () => {
  // const ipfsHttpUrl = 'http://localhost:8000/ipfs/QmdFiEAspvMxtVVWYoLW4jNbS2Rq23ccsx3RBrAoar5byw/';
  const goldImgUri = 'src/assets/pieces/Gold_Ingot.png';
  const silverImgUri = 'src/assets/pieces/Silver_Ingot.png';
  const bronzeImgUri = 'src/assets/pieces/Bronze_Ingot.png';

  const dispatch = useDispatch();
  const { isLogin, isLoading, isTransactioning, chainNetworkConnected } = useSelector(
    (state) => state.user,
  );

  const {
    address,
    balance,
    userName,
    gmail,
    currentGold,
    currentSilver,
    currentBronze,
    currentNFT,
    currentMoney,
    totalStep,
  } = useSelector((state) => state.account);

  const { goldNeed, silverNeed, bronzeNeed, stepNeed, moneyPerNFT } = useSelector(
    (state) => state.game,
  );

  const [inputUserName, setInputUserName] = useState(userName);
  const [isPieceSelect, setIsPieceSelect] = useState(false);
  const [pieceChoose, setPieceChoose] = useState(0);

  const currentPiece = [currentGold, currentSilver, currentBronze];
  const pieceNeed = [goldNeed, silverNeed, bronzeNeed];
  const [amountWant, setAmountWant] = useState(0);

  const [checkUserByAddress] = useMutation(mutateUserByAddress);

  async function getAccountfromGraphql(input = {}) {
    const res = await checkUserByAddress({
      variables: { address: address, input: input },
    });
    console.log(res.data.userByAddress);
    return res.data.userByAddress;
  }

  const ClickCombinePieces = async () => {
    dispatch(haveTransaction());
    if (amountWant == 0) {
      notifyUser('you dont want NFT?');
      dispatch(finishTransaction());
      return;
    }
    if (currentPiece[pieceChoose] < pieceNeed[pieceChoose] * amountWant) {
      notifyUser(`not enough piece for ${amountWant} NFTs`);
      dispatch(finishTransaction());
      return;
    }
    if (totalStep < stepNeed * amountWant) {
      notifyUser(`not enough steps for ${amountWant} NFTs`);
      dispatch(finishTransaction());
      return;
    }

    await combinePieces(pieceChoose, amountWant);
    dispatch(updateCurrentNFT(currentNFT + amountWant));
    let pieceLeft = currentPiece[pieceChoose] - pieceNeed[pieceChoose] * amountWant;
    let pieceName;
    switch (pieceChoose) {
      case pieceType.Gold:
        dispatch(updateCurrentGold(pieceLeft));
        pieceName = 'Gold';
        break;
      case pieceType.Silver:
        dispatch(updateCurrentSilver(pieceLeft));
        pieceName = 'Silver';

        break;
      case pieceType.Bronze:
        dispatch(updateCurrentBronze(pieceLeft));
        pieceName = 'Bronze';

        break;
    }
    dispatch(updateTotalStep(totalStep - stepNeed * amountWant));
    notifyUser(`you get ${amountWant} NFT and have ${pieceLeft} pieces of ${pieceName} left`);
    dispatch(finishTransaction());
  };

  async function changeName(newName) {
    await getAccountfromGraphql({ userName: newName });
    notifyUser('You become a new you');
    dispatch(updateUserName(newName));
  }

  async function clickConnectToGoogleFit() {
    const endpoint = import.meta.env.VITE_BE_URL + 'user/googleAuthURl';
    const res = await axios.post(endpoint, { address });
    console.log(res.data);
    const url = res.data.result.url;
    window.location.href = url;
  }

  useEffect(() => {
    if (isLogin && chainNetworkConnected) {
      // connectNewSigner();
      setInputUserName(userName);
      setIsPieceSelect(false);
    }
  }, [isLogin, chainNetworkConnected, userName]);

  return (
    <>
      {!isLogin || !chainNetworkConnected ? (
        <p className='h-screen w-screen place-content-center text-center'>
          Connect to Metamask to play
        </p>
      ) : (
        <>
          {isLoading ? (
            <p className='h-screen w-screen place-content-center text-center'>Loading user info</p>
          ) : (
            <div className='gray-padding w-screen px-5 pt-4 lg:px-32 xl:px-48'>
              <h1 className='text-center text-4xl font-semibold'>
                Let's play, {userName.length > 17 ? userName.slice(0, 17) + '...' : userName} :3!
              </h1>
              <HR theme={cHRTheme} className='my-5 bg-gray-300' />
              <div className='mx-auto flex place-content-center gap-x-10'>
                <FloatingLabel
                  variant='outlined'
                  label='New username'
                  helperText='Change your name if you want'
                  theme={cFloatLabelTheme}
                  className=''
                  onChange={(e) => {
                    setInputUserName(e.target.value);
                  }}
                />
                <Button
                  label='2'
                  onClick={() => {
                    changeName(inputUserName);
                  }}
                  className='block h-fit disabled:bg-gray-500 sm:mt-1'
                >
                  Change name
                </Button>
              </div>
              <HR theme={cHRTheme} className='my-5 bg-gray-300' />
              <h5 className='mb-5 text-2xl font-bold tracking-tight text-gray-900'>
                Here's yo fortune
              </h5>
              <div className='mx-auto flex flex-col justify-center gap-3 rounded-lg border border-gray-200 bg-white px-8 py-6 text-lg shadow-xl md:w-10/12'>
                <p>Account balance: {balance} ETH</p>
                <p>Pieces got:</p>
                <div className='flex justify-around gap-x-4'>
                  <div className='flex items-center gap-2'>
                    <img src={goldImgUri} className='size-7 object-scale-down' />
                    <p className='text-xl'>{currentGold} gold</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <img src={silverImgUri} className='size-7 object-scale-down' />
                    <p className='text-xl'>{currentSilver} silver</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <img src={bronzeImgUri} className='size-7 object-scale-down' />
                    <p className='text-xl'>{currentBronze} bronze</p>
                  </div>
                </div>
                <p>NFTs owned: {currentNFT}</p>
                <div>
                  <p>P2EC token amount: {currentMoney}</p>
                  <p className='ms-4 text-sm text-gray-400'>
                    *You get {moneyPerNFT} P2EC tokens for each NFT, everyday ฅ ^≧∇≦^ ฅ
                  </p>
                </div>

                <p>{totalStep} steps left in contract</p>
              </div>

              <HR theme={cHRTheme} className='my-5 bg-gray-300' />
              <h5 className='mb-5 text-2xl font-bold tracking-tight text-gray-900'>
                Craft NFT station
              </h5>

              <div className='mx-auto flex flex-col justify-center gap-3 rounded-lg border border-gray-200 bg-white px-8 py-6 text-lg shadow-xl md:w-10/12'>
                <div className='mx-auto w-fit'>
                  <Select
                    label='Choose your material'
                    animate={{
                      mount: { y: 0 },
                      unmount: { y: 25 },
                    }}
                    className=''
                    onChange={(v) => {
                      let value = Number(v);
                      setPieceChoose(value);
                      setIsPieceSelect(true);
                    }}
                  >
                    <Option value='0'>
                      <div className='flex items-center gap-2'>
                        <img src={goldImgUri} className='size-4 object-scale-down' />
                        <p className=''>Gold</p>
                      </div>
                    </Option>
                    <Option value='1'>
                      <div className='flex items-center gap-2'>
                        <img src={silverImgUri} className='size-4 object-scale-down' />
                        <p className=''>Silver</p>
                      </div>
                    </Option>
                    <Option value='2'>
                      <div className='flex items-center gap-2'>
                        <img src={bronzeImgUri} className='size-4 object-scale-down' />
                        <p className=''>Bronze</p>
                      </div>
                    </Option>
                  </Select>
                </div>
                {isPieceSelect ? (
                  <>
                    <p className='text-center'>You have {`${currentPiece[pieceChoose]}`} pieces</p>

                    <div className='flex justify-around gap-x-6'>
                      <p>Require {`${pieceNeed[pieceChoose]}`} pieces per NFT</p>
                      <p>Require {`${stepNeed}`} steps per NFT</p>
                    </div>

                    <div className='mx-auto mt-5 md:w-80'>
                      <Typography variant='small' color='blue-gray' className='mb-1 font-medium'>
                        How many NFT you want?
                      </Typography>
                      <MTNumberInput amountWant={amountWant} setAmountWant={setAmountWant} />
                      {amountWant !== 0 ? (
                        <p className='text-sm font-extralight'>
                          you'll need {amountWant * pieceNeed[pieceChoose]} pieces and
                          {` ${amountWant * stepNeed}`} steps
                        </p>
                      ) : (
                        <></>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        ClickCombinePieces().catch((err) => handleTransRefuse(err));
                      }}
                      disabled={isTransactioning}
                      className='mx-auto block w-32 rounded-md bg-yellow-300 p-2 text-center text-base text-white hover:bg-yellow-400 disabled:bg-gray-500'
                    >
                      Combine!!!
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <HR theme={cHRTheme} className='my-5 bg-gray-300' />
              <h5 className='mb-5 text-2xl font-bold tracking-tight text-gray-900'>
                Google Fit check
              </h5>
              {!gmail ? (
                <>
                  <p>You haven't connect this app to Google fit yet</p>
                  <p>Your daily steps run won't be updated in the smart contract</p>
                  <button
                    onClick={clickConnectToGoogleFit}
                    className='mx-auto mt-5 block rounded-md bg-green-400 p-2 text-center text-base text-white hover:bg-green-500 disabled:bg-gray-500'
                  >
                    Connect to Google Fit
                  </button>
                </>
              ) : (
                <>
                  <p>The app is connected to google fit</p>
                  <p>Your steps run will be update to the smart contract at 11pm daily</p>
                </>
              )}

              <div className='h-32'></div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HomePage;

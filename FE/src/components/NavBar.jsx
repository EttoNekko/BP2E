import React, { useEffect, useState } from 'react';
import { Button, Navbar } from 'flowbite-react';
import { providers, utils, Contract } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { gql, useMutation, useQuery } from '@apollo/client';
import {
  connectChainNetwork,
  disconnectChainNetwork,
  finishLoadingData,
  loadingData,
  login,
  logout,
} from '../redux/slices/userSlice';
import { updateAddress, updateUserName, updateAccountData } from '../redux/slices/accountSlice';
import { updateGameData } from '../redux/slices/gameSlice';
import {
  signerAddress,
  connectToMetaMask,
  connectNewSigner,
  getAccountETHBalance,
  connectToChainNetwork,
} from '../Blockchain/Metamask';
import {
  getBoxInfo,
  getBoxOwned,
  getBoxTypeCount,
  getCurrentPiece,
  getPieceNeed,
  getstepNeed,
  getTotalStep,
  pieceType,
} from '../Blockchain/contracts/methods/pieceGenerator';
import { getCurrentNFT, getMoneyPerNFT } from '../Blockchain/contracts/methods/moneyGenerator';
import { getCurrentMoney } from '../Blockchain/contracts/methods/myMoney';
import { mutateUserByAddress } from '../graphql/user.gql';

const cNavBarTheme = {
  root: { inner: { base: 'mx-auto flex flex-wrap md:flex-nowrap items-center justify-between' } },
};

const NavBar = () => {
  const [checkUserByAddress] = useMutation(mutateUserByAddress);

  let location = useLocation();

  const dispatch = useDispatch();
  const { isLogin, isLoading, chainNetworkConnected } = useSelector((state) => state.user);

  const address = useSelector((state) => state.account.address);

  const ClickConnectToMetaMask = async () => {
    //disable the connect button
    await connectToMetaMask().then(() => {
      dispatch(updateAddress(signerAddress));
      dispatch(login());
    });
  };

  const ClickConnectToChainNetwork = async () => {
    await connectToChainNetwork().then(() => {
      dispatch(connectChainNetwork());
    });
  };

  async function getAccountfromGraphql(input = {}) {
    // const endPoint = import.meta.env.VITE_BE_URL + 'graphql';
    // const headers = {
    //   'content-type': 'application/json',
    // };
    // const graphqlQuery = {
    //   query: `mutation ($address: String!, $input: UserInput = {}) { userByAddress(address: $address, input: $input) { _id userName currentGold currentSilver currentBronze currentNFT currentMoney currentBoxesOwned { boxId quantity } } }`,
    //   variables: {
    //     address: address,
    //     input: input,
    //   },
    // };
    // const response = await axios({
    //   url: endPoint,
    //   method: 'POST',
    //   headers: headers,
    //   data: graphqlQuery,
    // }).catch((err) => {
    //   window.alert(err);
    // });
    // console.log(response.data.data.userByAddress);
    // return response.data.data.userByAddress;
    const res = await checkUserByAddress({
      variables: { address: address, input: input },
    });
    console.log(res.data.userByAddress);
    return res.data.userByAddress;
  }

  async function getAccountInfo() {
    dispatch(loadingData());

    const [
      balanceETH,
      _currentGold,
      _currentSilver,
      _currentBronze,
      _currentNFT,
      _currentMoney,
      _totalStep,
    ] = await Promise.all([
      getAccountETHBalance(),
      getCurrentPiece(pieceType.Gold),
      getCurrentPiece(pieceType.Silver),
      getCurrentPiece(pieceType.Bronze),
      getCurrentNFT(),
      getCurrentMoney(),
      getTotalStep(),
    ]);

    const [_goldNeed, _silverNeed, _bronzeNeed, _stepNeed, _moneyPerNFT] = await Promise.all([
      getPieceNeed(pieceType.Gold),
      getPieceNeed(pieceType.Silver),
      getPieceNeed(pieceType.Bronze),
      getstepNeed(),
      getMoneyPerNFT(),
    ]);

    dispatch(
      updateGameData({
        goldNeed: _goldNeed,
        silverNeed: _silverNeed,
        bronzeNeed: _bronzeNeed,
        stepNeed: _stepNeed,
        moneyPerNFT: _moneyPerNFT,
      }),
    );

    let _currentBoxesOwned = [];
    const boxTypeCount = await getBoxTypeCount();
    for (let i = 0; i < boxTypeCount; i++) {
      let { GOLD, SILVER, BRONZE, price } = await getBoxInfo(i);
      let quantity = await getBoxOwned(i);
      _currentBoxesOwned.push({
        boxId: i,
        boxType: {
          GOLD,
          SILVER,
          BRONZE,
          price,
        },
        quantity,
      });
    }

    dispatch(
      updateAccountData({
        balance: balanceETH,
        currentGold: _currentGold,
        currentSilver: _currentSilver,
        currentBronze: _currentBronze,
        currentNFT: _currentNFT,
        currentMoney: _currentMoney,
        totalStep: _totalStep,
        currentBoxesOwned: _currentBoxesOwned,
      }),
    );

    _currentBoxesOwned = _currentBoxesOwned.map((b) => {
      return { boxId: b.boxId, quantity: b.quantity };
    });

    const { userName: _userName, gmail: _gmail } = await getAccountfromGraphql({
      address: address,
      currentGold: _currentGold,
      currentSilver: _currentSilver,
      currentBronze: _currentBronze,
      currentNFT: _currentNFT,
      currentMoney: _currentMoney,
      currentBoxesOwned: _currentBoxesOwned,
      totalStep: _totalStep,
    });
    dispatch(updateAccountData({ userName: _userName, gmail: _gmail ? _gmail : null }));

    dispatch(finishLoadingData());
  }

  useEffect(() => {
    if (isLogin && !chainNetworkConnected) {
      ClickConnectToMetaMask().then(ClickConnectToChainNetwork);
    }
  });

  useEffect(() => {
    if (isLogin && chainNetworkConnected) {
      dispatch(loadingData());
      connectNewSigner().then(getAccountInfo);
    }
  }, [isLogin, chainNetworkConnected]);

  return (
    <Navbar
      fluid
      rounded
      theme={cNavBarTheme}
      className='sticky top-0 z-40 border-b-2 border-gray-300 bg-gray-100 px-5 lg:px-32 xl:px-48'
    >
      <Navbar.Toggle />
      <Navbar.Brand href='/'>
        <img
          src='src/assets/nik_cat.png'
          className='mr-3 h-8 object-scale-down sm:h-12'
          alt='black fat cat'
        />
        <span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-3xl'>
          Play 2 Earn
        </span>
      </Navbar.Brand>

      <div className={`flex md:order-2`}>
        <Button
          onClick={() => {
            ClickConnectToMetaMask().then(ClickConnectToChainNetwork);
          }}
          className={`${!isLogin || !chainNetworkConnected ? 'bg-orange-500 enabled:hover:bg-orange-600' : ''} focus:ring-0`}
        >
          {!isLogin ? (
            'Connect to Metamask'
          ) : isLogin && !chainNetworkConnected ? (
            'Connect to Network'
          ) : (
            <p className='w-20 truncate sm:w-fit'>{address.slice(0, 17) + '...'}</p>
          )}
        </Button>
      </div>
      <Navbar.Collapse>
        <Link to='/' preventScrollReset={true}>
          <Navbar.Link as='div' active={location.pathname == '/'} className='text-xl font-semibold'>
            Home
          </Navbar.Link>
        </Link>
        <Link to='/box' preventScrollReset={true}>
          <Navbar.Link
            as='div'
            active={location.pathname == '/box'}
            className='text-xl font-semibold'
          >
            Gacha
          </Navbar.Link>
        </Link>
        {/* <Link to='/random' preventScrollReset={true}>
          <Navbar.Link
            as='div'
            active={location.pathname == '/random'}
            className='text-xl font-semibold'
          >
            Random
          </Navbar.Link>
        </Link> */}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;

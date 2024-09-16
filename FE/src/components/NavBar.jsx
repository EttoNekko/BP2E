import React, { useEffect, useState } from 'react';
import { providers, Contract } from 'ethers';
import { userInfo } from '../context/UserContext';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const { user, setUser, account, setAccount } = userInfo();
  const [dropDown, setDropDown] = useState(true);

  const provider = new providers.Web3Provider(window.ethereum);

  //if user disconnect metamask after connect
  const connectToMetaMask = async () => {
    //disable the connect button
    await provider
      .send('eth_requestAccounts', [])
      .then(async () => {
        const signer = provider.getSigner();
        const newAccountAddress = await signer.getAddress();
        setAccount({ ...account, address: newAccountAddress });
        setUser({ ...user, isLogin: true });
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error.
          // If this happens, the user rejected the connection request.
          window.alert('Please connect to MetaMask.');
          console.log('Please connect to MetaMask.');
        } else {
          window.alert(err);
          console.log(err);
        }
      });
  };

  const connectChainNetwork = async () => {
    //get data about user from database
    await provider
      .send('wallet_switchEthereumChain', [
        { chainId: import.meta.env.VITE_chainId },
      ])
      .then(setUser({ ...user, chainNetworkConnected: true }))
      .catch(async (err) => {
        if (err.code === 4902) {
          await provider
            .send('wallet_addEthereumChain', [
              {
                chainId: import.meta.env.VITE_chainId,
                chainName: import.meta.env.VITE_chainName,
                nativeCurrency: {
                  decimals: parseInt(import.meta.env.VITE_currency_decimals),
                  symbol: import.meta.env.VITE_currency_symbol,
                },
                rpcUrls: [import.meta.env.VITE_RPC_URL],
                blockExplorerUrls: null,
              },
            ])
            .then(setUser({ ...user, chainNetworkConnected: true }))
            .catch((err) => {
              window.alert(err.message);
              setUser({ ...user, chainNetworkConnected: false });
            });
        }
      });
  };

  useEffect(() => {
    if (user.isLogin) {
      connectChainNetwork();
    }
  }, [user.isLogin]);

  return (
    <>
      <div className='sticky top-0'>
        <nav className='relative flex h-16 w-screen items-center justify-between bg-blue-300 px-2'>
          <a className='h-full'>
            <img
              src='src\assets\nik_cat.png'
              alt='black thing'
              className='inline h-full object-scale-down align-baseline'
            />
          </a>

          <button
            type='button'
            className='inline-flex items-center justify-center rounded-lg bg-gray-100 object-scale-down p-2 align-baseline text-sm text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
            aria-controls='navbar-default'
            aria-expanded='false'
            onClick={() => setDropDown(!dropDown)}
          >
            <span className='sr-only'>Open main menu</span>
            <svg
              className='h-5 w-5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 17 14'
            >
              <path
                stroke='currentColor'
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M1 1h15M1 7h15M1 13h15'
              />
            </svg>
          </button>
          <div className='hidden sm:visible sm:flex sm:w-1/2 sm:justify-evenly sm:gap-x-3'>
            <Link
              to='/'
              className='place-content-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800'
            >
              Home
            </Link>
            <Link
              to='/box'
              className='place-content-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800'
            >
              Gacha
            </Link>
            {!user.isLogin ? (
              <p
                onClick={connectToMetaMask}
                className='place-content-center text-nowrap rounded-lg bg-orange-400 px-5 py-2.5 text-center text-sm font-semibold hover:outline-green-600 hover:ring-4 hover:ring-green-600'
              >
                Connect to MetaMask
              </p>
            ) : (
              <p className='place-content-center truncate text-nowrap rounded-lg bg-orange-400 px-5 py-2.5 text-center text-sm font-semibold hover:outline-green-600 hover:ring-4 hover:ring-green-600'>
                {account.address}
              </p>
            )}
          </div>
        </nav>
        {dropDown ? null : (
          <div className='absolute right-0 flex w-fit flex-col items-end justify-around gap-y-3 rounded bg-slate-400 p-3 sm:hidden'>
            <Link
              to='/'
              className='place-content-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800'
            >
              Home
            </Link>
            <Link
              to='/box'
              className='place-content-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800'
            >
              Gacha
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default NavBar;

import { providers, utils, Contract } from 'ethers';
import PieceGeneratorAbi from '../contracts/Abi/PieceGeneratorAbi';
import MoneyGeneratorAbi from '../contracts/Abi/MoneyGeneratorAbi';
import MyMoneyAbi from '../contracts/Abi/MyMoneyAbi';
import store from '../../redux/store';
import { finishTransaction, resetUser } from '../../redux/slices/userSlice';
import { notifyUser } from '../../context/UserContext';

let provider = new providers.Web3Provider(window.ethereum, 'any');
let signer;
let signerAddress;
let pieceGeneratorContract;
let moneyGeneratorContract;
let myMoneyContract;

const metamaskEvent = () => {
  provider.provider // Or window.ethereum if you don't support EIP-6963.
    .on('accountsChanged', () => {
      store.dispatch(resetUser());
      // window.location.reload();
    });
  provider.provider // Or window.ethereum if you don't support EIP-6963.
    .on('chainChanged', (chainId) => {
      if (chainId == import.meta.env.VITE_chainId) return;
      store.dispatch(resetUser());
    });
};

//if user disconnect metamask after connect
export const connectToMetaMask = async () => {
  //disable the connect button
  await provider
    .send('eth_requestAccounts', [])
    .then(async () => {
      signer = provider.getSigner();
      signerAddress = await signer.getAddress();
      metamaskEvent();
    })
    .catch((err) => {
      let errMess = '';
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error.
        // If this happens, the user rejected the connection request.
        errMess = 'Please connect to meta mask';
      }
      notifyUser(errMess);
      throw err;
    });
};

export const connectToChainNetwork = async () => {
  //get data about user from database
  await provider
    .send('wallet_switchEthereumChain', [{ chainId: import.meta.env.VITE_chainId }])
    .catch(async (err) => {
      if (err.code === 4902) {
        await provider
          .send('wallet_addEthereumChain', [
            {
              chainId: import.meta.env.VITE_chainId,
              chainName: import.meta.env.VITE_chainName,
              nativeCurrency: {
                decimals: Number(import.meta.env.VITE_currency_decimals),
                symbol: import.meta.env.VITE_currency_symbol,
              },
              rpcUrls: [import.meta.env.VITE_RPC_URL],
              blockExplorerUrls: null,
            },
          ])
          .catch((err) => {
            let errMess = '';
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error.
              // If this happens, the user rejected the connection request.
              errMess = 'Please connect to our network';
            }
            errMess ? notifyUser(errMess) : null;
            throw err;
          });
      }
      let errMess = '';
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error.
        // If this happens, the user rejected the connection request.
        errMess = 'Please switch to our network';
      }
      errMess ? notifyUser(errMess) : null;
      throw err;
    });
};

export const handleTransRefuse = async (err) => {
  let errMess = 'okay';
  console.log(err);
  if (err.code === 'ACTION_REJECTED') {
    // ethhers action rejected error.
    // If this happens, the user rejected the transaction request.
    errMess = 'okay? you no play';
  }
  notifyUser(errMess);
  store.dispatch(finishTransaction());
  return;
};

export const connectNewSigner = async () => {
  signer = provider.getSigner();
  signerAddress = await signer.getAddress();
  pieceGeneratorContract = new Contract(
    import.meta.env.VITE_pieceGenerator_Address,
    PieceGeneratorAbi,
    signer,
  );
  moneyGeneratorContract = new Contract(
    import.meta.env.VITE_moneyGenerator_Address,
    MoneyGeneratorAbi,
    signer,
  );

  myMoneyContract = new Contract(import.meta.env.VITE_money_Address, MyMoneyAbi, signer);
};

export const getAccountETHBalance = async () => {
  const balanceWei = await provider.getBalance(signerAddress);
  const balanceETH = utils.formatEther(balanceWei);
  return Number(balanceETH);
};

export {
  provider,
  signer,
  signerAddress,
  pieceGeneratorContract,
  moneyGeneratorContract,
  myMoneyContract,
};

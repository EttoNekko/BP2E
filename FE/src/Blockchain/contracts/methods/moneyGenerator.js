import { providers, utils, Contract } from 'ethers';
import { provider, signer, signerAddress, moneyGeneratorContract } from '../../Metamask';

export const getCurrentNFT = async () => {
  const currentNFT = utils.formatUnits(await moneyGeneratorContract.balanceOf(signerAddress), 0);
  return Number(currentNFT);
};

export const getMoneyPerNFT = async () => {
  const moneyPerNFT = utils.formatUnits(await moneyGeneratorContract.moneyPerNFT(), 0);
  return Number(moneyPerNFT);
};

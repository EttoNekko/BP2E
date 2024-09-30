import { providers, utils, Contract } from 'ethers';
import { provider, signer, signerAddress, myMoneyContract } from '../../Metamask';

export const getCurrentMoney = async () => {
  const currentMoney = utils.formatUnits(await myMoneyContract.balanceOf(signerAddress), 0);
  return Number(currentMoney);
};

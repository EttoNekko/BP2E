import { utils } from 'ethers';

export const formatIntFromChain = (value, decimals = 18) => {
  return parseInt(utils.formatUnits(value, decimals));
};

import { providers, utils, Contract } from 'ethers';
import { provider, signer, signerAddress, pieceGeneratorContract } from '../../Metamask';

export const pieceType = {
  Gold: 0,
  Silver: 1,
  Bronze: 2,
};

export const getBoxTypeCount = async () => {
  const boxTypeCount = await pieceGeneratorContract.boxTypeCount();
  return boxTypeCount;
};

export const getBoxInfo = async (boxId) => {
  const { GOLD, SILVER, BRONZE, price } = await pieceGeneratorContract.boxTypes(boxId);
  return {
    GOLD: Number(GOLD),
    SILVER: Number(SILVER),
    BRONZE: Number(BRONZE),
    price: Number(utils.formatEther(price)),
  };
};

export const getBoxOwned = async (boxId) => {
  const quantity = utils.formatUnits(
    await pieceGeneratorContract.boxesOwned(signerAddress, boxId),
    0,
  );
  return Number(quantity);
};

export const getCurrentPiece = async (pieceType) => {
  const currentGold = utils.formatUnits(
    await pieceGeneratorContract.balanceOf(signerAddress, pieceType),
    0,
  );
  return Number(currentGold);
};

export const getTotalStep = async () => {
  const totalStep = utils.formatUnits(await pieceGeneratorContract.totalStepsRun(signerAddress), 0);
  return Number(totalStep);
};

export const getPieceNeed = async (pieceType) => {
  let pieceNeed = await pieceGeneratorContract.pieceTypeRequired(pieceType);
  return Number(pieceNeed);
};

export const getstepNeed = async () => {
  let stepNeed = await pieceGeneratorContract.stepsRequired();
  return Number(stepNeed);
};

export const buyBox = async (boxId, boxPrice) => {
  const buyBoxTx = await pieceGeneratorContract.buyBox(boxId, {
    value: utils.parseEther(boxPrice.toString()),
    nonce: await signer.getTransactionCount(),
  });
  await buyBoxTx.wait();
};

export const openBox = async (boxId) => {
  const openBoxTx = await pieceGeneratorContract.openBox(boxId, {
    nonce: await signer.getTransactionCount(),
  });
  await openBoxTx.wait();
};

export const combinePieces = async (pieceChoose, amountInput) => {
  let combinePiecesTx = await pieceGeneratorContract.combinePieces(pieceChoose, amountInput, {
    nonce: await signer.getTransactionCount(),
  });
  await combinePiecesTx.wait();
};

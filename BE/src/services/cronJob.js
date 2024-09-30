const ethers = require('ethers');
// require('dotenv').config();
const schedule = require('node-schedule');
const { google } = require('googleapis');
const User = require('../models/user');
const pieceGeneratorAbi = require('../contracts/PieceGeneratorAbi');
const moneyGeneratorAbi = require('../contracts/MoneyGeneratorAbi');

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.Owner_PRIVATE_KEY, provider);

console.log('starting cronjob');
const moneyGenerator = new ethers.Contract(
  process.env.moneyGenerator_Address,
  moneyGeneratorAbi,
  signer,
);
const pieceGenerator = new ethers.Contract(
  process.env.pieceGenerator_Address,
  pieceGeneratorAbi,
  signer,
);

const makeMoney = async () => {
  const result = await User.find({}, 'address');
  let userAddress = [];
  result.forEach((u) => {
    userAddress.push(u.address);
  });
  const makeMoneyTx = await moneyGenerator.generateBatchMoney(userAddress);
  await makeMoneyTx.wait();
  console.log('just make mon mon eiii');
};

const getStepFromGoogleFitApi = async (refresh_token) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  oAuth2Client.setCredentials({ refresh_token });

  const fitnessStore = google.fitness({ version: 'v1', auth: oAuth2Client });
  const dataTypeName = 'com.google.step_count.delta';
  const dataSourceId =
    'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps';
  const currentTimeInMs = Date.now();
  const exactTodayInMs = currentTimeInMs - (currentTimeInMs % (86400 * 1000));
  const data = {
    aggregateBy: [{ dataTypeName, dataSourceId }],
    bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
    startTimeMillis: exactTodayInMs,
    endTimeMillis: exactTodayInMs + 24 * 60 * 60 * 1000,
  };
  const result = await fitnessStore.users.dataset.aggregate({
    userId: 'me',
    requestBody: data,
    fields: 'bucket(dataset(point(value(intVal))))',
  });
  if (!result.data.bucket[0].dataset[0].point.length) {
    // console.log('nothing ran');
    return 0;
  }
  const stepRunToday =
    result.data.bucket[0].dataset[0].point[0].value[0].intVal;
  // console.log(stepRunToday);
  return stepRunToday;
};

const addUserStepToBlock = async () => {
  let addresses = [];
  let steps = [];
  const users = await User.find({}, 'address gmail googleRefreshToken');
  for (const u of users) {
    if (!u.gmail || !u.googleRefreshToken) {
      // console.log('not connected to gmail yet');
      continue;
    }

    const stepRunToday = await getStepFromGoogleFitApi(u.googleRefreshToken);

    if (!stepRunToday) continue;
    addresses.push(u.address);
    steps.push(stepRunToday);
  }

  console.log(addresses, steps);
  await pieceGenerator.addBatchSteps(addresses, steps);
};

const updateUserStep = async () => {
  const users = await User.find({}, 'address gmail googleRefreshToken');
  users.forEach(async (u) => {
    if (!u.gmail || !u.googleRefreshToken) return;

    const stepRunToday = await getStepFromGoogleFitApi(u.googleRefreshToken);

    await User.updateOne(
      { address: u.address },
      { $push: { runHistory: { steps: stepRunToday } } },
    );
  });
};

const job = schedule.scheduleJob('*/5 * * * * *', async function () {
  // console.log('Here money');
  // await makeMoney();
  // await updateUserStep();
  // console.log('update user step to mongo');
  await addUserStepToBlock();
  console.log('update user step to blockchain');
});

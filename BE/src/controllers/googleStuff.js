const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const resTemplate = require('../utils/responseTemplate');
const User = require('../models/user');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

exports.generateGoogleAuthUrl = (req, res, next) => {
  const { address } = req.body;
  if (!address)
    return resTemplate.response_fail(
      res,
      resTemplate.BAD_REQUEST,
      'need address in body',
    );
  const userInfo = jwt.sign({ address }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      process.env.GOOGLE_FIT_SCOPE,
      process.env.GOOGLE_USERINFO_SCOPE,
      process.env.GOOGLE_USEREMAIL_SCOPE,
    ],
    state: userInfo,
  });
  return resTemplate.response_success(
    res,
    resTemplate.OK,
    'url to google auth',
    { url },
  );
};

exports.getUserGoogleToken = async (req, res, next) => {
  const { code, state, error } = req.query;
  if (error === 'access_denied') {
    // return res.json({ mess: 'you deny me' });
    return res.redirect(process.env.FE_URL);
  }
  const { address } = jwt.verify(state, process.env.JWT_SECRET);
  const googleRes = await oAuth2Client.getToken(code);
  // console.log(googleRes);
  const { tokens } = googleRes;
  console.log(tokens);

  oAuth2Client.setCredentials(tokens);

  let oauth2 = google.oauth2({
    auth: oAuth2Client,
    version: 'v2',
  });
  let { data } = await oauth2.userinfo.get(); // get user info

  await User.findOneAndUpdate(
    { address: address },
    { gmail: data.email, googleRefreshToken: tokens.refresh_token },
    {
      new: true,
      upsert: true,
    },
  );

  return res.redirect(process.env.FE_URL);
};

exports.getGoogleFitUserStep = async (req, res, next) => {
  const { address } = req.query;
  if (!address)
    return resTemplate.response_fail(
      res,
      resTemplate.BAD_REQUEST,
      'need address in query',
    );
  const user = await User.findOne(
    { address },
    'address userName googleRefreshToken',
  );
  console.log(user);
  oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

  const fitnessStore = google.fitness({ version: 'v1', auth: oAuth2Client });
  const dataTypeName = 'com.google.step_count.delta';
  const dataSourceId =
    'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps';
  const currentTimeInMs = Date.now();
  const exactTodayInMs = currentTimeInMs - (currentTimeInMs % (86400 * 1000));
  const data = {
    aggregateBy: [{ dataTypeName, dataSourceId }],
    bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
    startTimeMillis: exactTodayInMs - 2 * 24 * 60 * 60 * 1000,
    endTimeMillis: exactTodayInMs + 24 * 60 * 60 * 1000,
  };
  const result = await fitnessStore.users.dataset.aggregate({
    userId: 'me',
    requestBody: data,
    fields: 'bucket(dataset(point(value(intVal))))',
  });
  res.json(result.data);
};

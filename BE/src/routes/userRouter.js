const express = require('express');
const router = express.Router();

const {
  generateGoogleAuthUrl,
  getUserGoogleToken,
  getGoogleFitUserStep,
} = require('../controllers/googleStuff');

router.post('/googleAuthURl', generateGoogleAuthUrl);

router.get('/getGoogleToken', getUserGoogleToken);

router.get('/steps', getGoogleFitUserStep);

module.exports = router;

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
// const { buildSchema } = require('graphql');
// const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { createHandler } = require('graphql-http/lib/use/express');
const { ruruHTML } = require('ruru/server');

const resTemplate = require('./utils/responseTemplate');

const userRouter = require('./routes/userRouter');

require('./services/randomNumber');
require('./services/box');
// require('./services/cronJob');

const PORT = process.env.PORT || 3000;

const app = express();

//app.use('/', express.static(path.join(__dirname, 'the-cat')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectionURL = process.env.mongoDB_connection_URL;
mongoose
  .connect(connectionURL)
  .then(() => {
    console.log('connection to mongodb successfully');
  })
  .catch(() => {
    console.log('connect to DB failed');
  });

app.use('/user', userRouter);

const schema = makeExecutableSchema({
  typeDefs: loadFilesSync(path.join(__dirname, '**/**/*.graphql')),
  resolvers: loadFilesSync(path.join(__dirname, '**/**/*.resolver.js')),
});

app.use(
  '/graphql',
  createHandler({
    schema: schema,
  }),
);

// Serve the GraphiQL IDE.
app.use('/graphi', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.use((err, req, res, next) => {
  return resTemplate.response_error(
    res,
    resTemplate.INTERNAL_SERVER_ERROR,
    err,
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

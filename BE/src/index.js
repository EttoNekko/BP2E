const express = require('express');
const path = require('path');
const cors = require('cors');
// const { buildSchema } = require('graphql');
// const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { createHandler } = require('graphql-http');
const { ruruHTML } = require('ruru/server');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

//app.use('/', express.static(path.join(__dirname, 'the-cat')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// app.use((err, req, res, next) => {
//   return resTemplate.response_error(res, resTemplate.INTERNAL_SERVER_ERROR, err);
// })

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

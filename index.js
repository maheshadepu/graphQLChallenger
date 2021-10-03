const express = require("express");
const app = express();
const { ApolloServer } = require("apollo-server-express");
const apolloConfig = require("./ApolloConfig");

const server = new ApolloServer(apolloConfig);
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
}
startServer();

let httpSever = app.listen({ port: 4000 }, () =>
  console.log(`Listening on http://localhost:4000/graphql`)
); 
 
module.exports = {app};
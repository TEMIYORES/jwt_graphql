// import { AppDataSource } from "./data-source";
// import { User } from "./entity/User";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import express from "express";
import { UserResolver } from "./UserResolver";
import { buildSchema } from "type-graphql";
import { AppDataSource } from "./data-source";
import cookieParser from "cookie-parser";
import { User } from "./entity/User";
import jwt from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";

dotenv.config();

(async () => {
  const app = express();
  app.use(cookieParser());
  const PORT = process.env.PORT || 5000;
  app.post("/refresh-token", async (req, res) => {
    const token = req.cookies.jwt1;
    if (!token) return res.send({ message: "invalid token", accessToken: "" });
    let payload: any = null;

    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN!);
      console.log("payload", payload);
      const user = await User.findOne({ where: { id: payload.id } });
      if (!user) return res.send({ message: "invalid token", accessToken: "" });
      if (user.tokenVersion !== payload.tokenVersion)
        return res.send({
          message: "tokenVersion does not match",
          accessToken: "",
        });
      sendRefreshToken(res, createRefreshToken(user));
      return res.send({
        message: "new accessToken issued",
        accessToken: createAccessToken(user),
      });
    } catch (error) {
      return res.send({ message: error.message, accessToken: "" });
    }
  });
  await AppDataSource.initialize()
    .then(() => console.log("Data Source has been initialized!"))
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
})();

// AppDataSource.initialize().then(async () => {

//     console.log("Inserting a new user into the database...")
//     const user = new User()
//     user.firstName = "Jake"
//     user.lastName = "Mitchel"
//     user.age = 22
//     await AppDataSource.manager.save(user)
//     console.log("Saved a new user with id: " + user.id)

//     console.log("Loading users from the database...")
//     const users = await AppDataSource.manager.find(User)
//     console.log("Loaded users: ", users)

//     console.log("Here you can setup and run express / fastify / any other framework.")

// }).catch(error => console.log(error))

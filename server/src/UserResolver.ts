import bcryptjs from "bcryptjs";
import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from "./entity/User";
import { MyContext } from "./myContext";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { AppDataSource } from "./data-source";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field()
  userId: number;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  @UseMiddleware(isAuth)
  hello(@Ctx() { payload }: MyContext) {
    console.log(payload);
    return `user is authenticated and user ID is ${payload!.userId}`;
  }
  @Query(() => String)
  greeting() {
    return "I am greeting you";
  }
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("name") name: string,
    @Arg("password") password: string,
    @Arg("email") email: string
  ) {
    try {
      const hashedPwd = await bcryptjs.hash(password, 12);

      await User.insert({
        fullname: name,
        email: email,
        password: hashedPwd,
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    await AppDataSource.getRepository(User).increment(
      { id: userId },
      "tokenVersion",
      1
    );
    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("password") password: string,
    @Arg("email") email: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid Email");
    }
    const confirmPwd = await bcryptjs.compare(password, user.password);
    if (!confirmPwd) throw new Error("Invalid password");

    // login Successful
    console.log("user", user);
    sendRefreshToken(res, createRefreshToken(user));
    return {
      accessToken: createAccessToken(user),
      userId: user.id,
    };
  }
}

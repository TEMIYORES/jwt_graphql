import { User } from "./entity/User";
import jwt from "jsonwebtoken";
export const createAccessToken = (user: User) => {
  return jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN!, {
    expiresIn: "1m",
  });
};
export const createRefreshToken = (user: User) => {
  console.log("user refresh", user.id);
  return jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN!,
    {
      expiresIn: "1d",
    }
  );
};

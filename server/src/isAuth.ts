import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./myContext";
import jwt from "jsonwebtoken";
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) {
    throw new Error("not authenticated");
  }
  try {
    const token = authorization;
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN!);
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error("jwt expired");
  }
  return next();
};

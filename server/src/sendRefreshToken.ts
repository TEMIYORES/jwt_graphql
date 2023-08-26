import { Response } from "express";

export const sendRefreshToken = (res: Response, token: String) => {
  res.cookie("jwt1", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

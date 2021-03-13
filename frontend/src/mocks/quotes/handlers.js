import { rest } from "msw";
import response from "./fixtures/response.json";

export const successfulHandler = rest.get(
  "https://type.fit/api/quotes",
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(response));
  }
);

export const errorHandler = rest.get(
  "https://type.fit/api/quotes",
  (req, res, ctx) => {
    return res(ctx.status(404));
  }
);

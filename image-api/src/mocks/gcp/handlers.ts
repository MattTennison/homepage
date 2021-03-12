import {
  DefaultRequestBody,
  RequestParams,
  ResponseResolver,
  rest,
  RestContext,
  RestRequest,
} from "msw";
import { clone } from "../../utils/clone";
import successfulSafeSearchFixture from "./fixtures/safesearch.json";

const makeSafeSearchResponse = (
  responseHandler: ResponseResolver<
    RestRequest<DefaultRequestBody, RequestParams>,
    RestContext,
    any
  >
) => {
  return rest.post(
    "https://vision.googleapis.com/v1/images:annotate",
    responseHandler
  );
};

export const successfulSafeSearchResponse = makeSafeSearchResponse(
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(successfulSafeSearchFixture));
  }
);

export const mangledSafeSearchResponse = makeSafeSearchResponse(
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ manged: "data" }));
  }
);

export const emptyResponsesSafeSearch = makeSafeSearchResponse(
  (req, res, ctx) => {
    const emptyResponses = {
      ...clone(successfulSafeSearchFixture),
      responses: [],
    };

    return res(ctx.status(200), ctx.json(emptyResponses));
  }
);

export const errorCodeSafeSearch = (errorCode: number) =>
  makeSafeSearchResponse((req, res, ctx) => {
    return res(ctx.status(errorCode));
  });

export const safeSearchResponse = (overrides: {
  adult?: string;
  spoof?: string;
  medical?: string;
  violence?: string;
  racy?: string;
}) => {
  const response = clone(successfulSafeSearchFixture);
  response.responses[0].safeSearchAnnotation = {
    ...response.responses[0].safeSearchAnnotation,
    ...overrides,
  };

  return makeSafeSearchResponse((req, res, ctx) => {
    return res(ctx.status(200), ctx.json(response));
  });
};

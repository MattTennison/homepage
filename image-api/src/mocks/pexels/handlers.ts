import { FileHandle, readFile } from "fs/promises";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseResolver,
  rest,
  RestContext,
  RestRequest,
} from "msw";
import { resolve } from "path";
import { URL } from "url";
import { dogPhoto } from "./fixtures/image-assets/helpers";
import successfulSearchResponse from "./fixtures/search.json";

const setupSearchResponse = (
  responseHandler: ResponseResolver<
    RestRequest<DefaultRequestBody, RequestParams>,
    RestContext,
    any
  >
) => {
  return rest.get("https://api.pexels.com/v1/search", responseHandler);
};

export const successfulSearch = setupSearchResponse((req, res, ctx) => {
  return res(ctx.status(200), ctx.json(successfulSearchResponse));
});

export const mangledSearch = setupSearchResponse((req, res, ctx) => {
  return res(ctx.status(200), ctx.json({ manged: "data" }));
});

export const errorCodeSearch = (errorCode: number) =>
  setupSearchResponse((req, res, ctx) => {
    return res(ctx.status(errorCode));
  });

const setupImageResponse = (
  responseHandler: ResponseResolver<
    RestRequest<DefaultRequestBody, RequestParams>,
    RestContext,
    any
  >
) => {
  return rest.get(
    "https://images.pexels.com/photos/:photoId/*",
    responseHandler
  );
};

export const assetResponse = (
  absolutePath: string | Buffer | URL | FileHandle
) =>
  setupImageResponse(async (req, res, ctx) => {
    const asset = await readFile(absolutePath);

    return res(
      ctx.status(200),
      ctx.set("Content-Length", asset.byteLength.toString()),
      ctx.set("Content-Type", "image/jpeg"),
      ctx.body(asset)
    );
  });

export const successfulAssetResponse = setupImageResponse(
  async (req, res, ctx) => {
    return res(ctx.status(200), ctx.body(dogPhoto.buffer));
  }
);

export const errorCodeAsset = (errorCode: number) =>
  setupImageResponse(async (req, res, ctx) => {
    return res(ctx.status(errorCode));
  });

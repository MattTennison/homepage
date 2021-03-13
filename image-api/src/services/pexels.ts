import axios from "axios";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { config } from "../config";
import { wrapAxios } from "../logger/logger";

const searchResponse = t.exact(
  t.type({
    photos: t.array(
      t.exact(
        t.type({
          id: t.number,
          src: t.type({
            original: t.string,
            large: t.string,
          }),
        })
      )
    ),
  })
);

const getClient = () => {
  const client = axios.create({
    baseURL: "https://api.pexels.com/v1",
    headers: {
      Authorization: config.pexels.apiToken,
    },
  });

  wrapAxios(client);

  return client;
};

export const search = async ({ query }: { query: string }) => {
  const pexels = getClient();
  const response = await pexels.get("search", { params: { query } });

  const decodedResponse = searchResponse.decode(response.data);

  if (isLeft(decodedResponse)) {
    throw new Error("pexels.api.malformed");
  }

  return {
    photos: decodedResponse.right.photos.map((photo) => ({
      id: photo.id,
      src: photo.src.large,
    })),
  };
};

export const fetchImageInBase64 = async ({ path }: { path: string }) => {
  const imageClient = axios.create({
    baseURL: "https://images.pexels.com",
    maxContentLength: config.pexels.maxImageSizeInBytes,
    validateStatus: (status) => status === 200,
  });
  wrapAxios(imageClient);
  const result = await imageClient.get(path, { responseType: "arraybuffer" });

  return Buffer.from(result.data, "binary").toString("base64");
};

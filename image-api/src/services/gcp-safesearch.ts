import axios from "axios";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { config } from "../config";

const analyseResponse = t.exact(
  t.type({
    responses: t.array(
      t.exact(
        t.type({
          safeSearchAnnotation: t.type({
            adult: t.string,
            spoof: t.string,
            medical: t.string,
            violence: t.string,
            racy: t.string,
          }),
        })
      )
    ),
  })
);

export const analyse = async ({ imageInBase64 }: { imageInBase64: string }) => {
  const client = axios.create({
    baseURL: "https://vision.googleapis.com/v1",
    headers: {
      Authorization: `Bearer ${config.gcp.apiToken}`,
    },
  });

  const response = await client.post("/images:annotate", {
    requests: [
      {
        image: { content: imageInBase64 },
        features: [{ type: "SAFE_SEARCH_DETECTION" }],
      },
    ],
  });

  const decodedResponse = analyseResponse.decode(response.data);
  if (isLeft(decodedResponse) || decodedResponse.right.responses.length === 0) {
    throw new Error("gcp.api.vision.malformed");
  }

  return {
    safeSearch: decodedResponse.right.responses[0].safeSearchAnnotation,
  };
};

import axios from "axios";
import * as t from "io-ts";
import { PathReporter } from "io-ts/PathReporter";
import { isLeft } from "fp-ts/Either";
import { config } from "../config";
import { logger, wrapAxios } from "../logger/logger";

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
  });

  wrapAxios(client);

  const response = await client.post(
    "/images:annotate",
    {
      requests: [
        {
          image: { content: imageInBase64 },
          features: [{ type: "SAFE_SEARCH_DETECTION" }],
        },
      ],
    },
    { params: { key: config.gcp.apiToken } }
  );

  const decodedResponse = analyseResponse.decode(response.data);
  if (isLeft(decodedResponse) || decodedResponse.right.responses.length === 0) {
    const reasons = PathReporter.report(decodedResponse);
    logger.error(
      `Request to https://vision.googleapis.com/v1/images:annotate came back malformed ${reasons.join(
        ", "
      )}`
    );
    throw new Error("gcp.api.vision.malformed");
  }

  return {
    safeSearch: decodedResponse.right.responses[0].safeSearchAnnotation,
  };
};

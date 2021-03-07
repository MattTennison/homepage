import nock from "nock";
import { fetchImageInBase64, search } from "./pexels";
import successfulSearchResponse from "../fixtures/pexels/search.json";
import { readFile } from "fs/promises";
import { resolve } from "path";

jest.mock("../config", () => ({
  config: {
    ...jest.requireActual("../config").config,
    pexels: {
      apiToken: "pexels-api-token",
      maxImageSizeInBytes: 10 * 1024,
    },
  },
}));

describe("Pexels", () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  describe("#search", () => {
    let apiScope: nock.Scope;

    beforeEach(() => {
      apiScope = nock("https://api.pexels.com/v1");
    });

    it("returns results from the API", async () => {
      apiScope
        .get("/search?query=ocean")
        .matchHeader("Authorization", "pexels-api-token")
        .reply(200, successfulSearchResponse);

      const result = await search({ query: "ocean" });

      expect(result.photos).toHaveLength(15);
      expect(result.photos[0]).toEqual({
        id: 189349,
        src: "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg",
      });
    });

    describe("error handling", () => {
      it("throws an error if the API returns malformed data", () => {
        apiScope.get("/search?query=ocean").reply(200, { mangledData: "foo" });

        return expect(search({ query: "ocean" })).rejects.toBeTruthy();
      });

      it.each([201, 400, 500])(
        "throws an error if the API returns %s status code",
        (statusCode) => {
          apiScope.get("/search?query=ocean").reply(statusCode);

          return expect(search({ query: "ocean" })).rejects.toBeTruthy();
        }
      );
    });
  });

  describe("#fetchImageInBase64", () => {
    let imageScope: nock.Scope;
    const path = "photos/189349/pexels-photo-189349.jpeg";

    beforeEach(() => {
      imageScope = nock("https://images.pexels.com/photos");
    });

    it("returns the asset as a Base64 string", async () => {
      const assetPath = resolve(
        __dirname,
        "../fixtures/pexels/image-assets/dog.webp"
      );
      const asset = await readFile(assetPath);
      const assetInBase64 = asset.toString("base64");

      imageScope
        .get("/189349/pexels-photo-189349.jpeg")
        .replyWithFile(200, assetPath);

      const result = await fetchImageInBase64({ path });

      expect(result).toEqual(assetInBase64);
    });

    it("throws an error if the asset is too large", () => {
      const largeAssetPath = resolve(
        __dirname,
        "../fixtures/pexels/image-assets/cat.jpeg"
      );

      imageScope
        .get("/189349/pexels-photo-189349.jpeg")
        .replyWithFile(200, largeAssetPath);

      return expect(fetchImageInBase64({ path })).rejects.toBeTruthy();
    });

    it.each([201, 404, 500])(
      "throws an error if the response status code is %s",
      (statusCode) => {
        imageScope.get("/189349/pexels-photo-189349.jpeg").reply(statusCode);

        return expect(fetchImageInBase64({ path })).rejects.toBeTruthy();
      }
    );
  });
});

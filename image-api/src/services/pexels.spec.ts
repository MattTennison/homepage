import { fetchImageInBase64, search } from "./pexels";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { setupServer, SetupServerApi } from "msw/node";
import {
  assetResponse,
  errorCodeSearch,
  mangledSearch,
  errorCodeAsset,
  successfulSearch,
} from "../mocks/pexels/handlers";

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
  let server: SetupServerApi;

  describe("#search", () => {
    describe("with successful API responses", () => {
      beforeEach(() => {
        server = setupServer(successfulSearch);
        server.listen();
      });

      afterEach(() => {
        server.close();
      });

      it("returns results from the API", async () => {
        const result = await search({ query: "ocean" });

        expect(result.photos).toHaveLength(15);
        expect(result.photos[0]).toEqual({
          id: 189349,
          src:
            "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
        });
      });
    });

    describe("error handling", () => {
      describe("with malformed API responses", () => {
        beforeEach(() => {
          server = setupServer(mangledSearch);
          server.listen();
        });

        afterEach(() => {
          server.close();
        });

        it("throws an error if the API returns malformed data", () => {
          return expect(search({ query: "ocean" })).rejects.toBeTruthy();
        });
      });

      describe.each([201, 400, 500])(
        "with the API returning %s status code",
        (statusCode) => {
          beforeEach(() => {
            server = setupServer(errorCodeSearch(statusCode));
            server.listen();
          });

          afterEach(() => {
            server.close();
          });

          it("throws an error", () => {
            return expect(search({ query: "ocean" })).rejects.toBeTruthy();
          });
        }
      );
    });
  });

  describe("#fetchImageInBase64", () => {
    const path = "photos/189349/pexels-photo-189349.jpeg";
    let assetPath: string;

    describe("with successful asset responses", () => {
      beforeEach(() => {
        assetPath = resolve(
          __dirname,
          "../mocks/pexels/fixtures/image-assets/dog.webp"
        );
        server = setupServer(assetResponse(assetPath));
        server.listen();
      });

      afterEach(() => {
        server.close();
      });

      it("returns the asset as a Base64 string", async () => {
        const asset = await readFile(assetPath);
        const result = await fetchImageInBase64({ path });

        expect(result).toEqual(asset.toString("base64"));
      });
    });

    describe("with large asset", () => {
      beforeEach(() => {
        assetPath = resolve(
          __dirname,
          "../mocks/pexels/fixtures/image-assets/cat.jpeg"
        );
        server = setupServer(assetResponse(assetPath));
        server.listen();
      });

      afterEach(() => {
        server.close();
      });

      it("throws an error", () => {
        return expect(fetchImageInBase64({ path })).rejects.toBeTruthy();
      });
    });

    describe.each([201, 401, 500])("with a %s response", (statusCode) => {
      beforeEach(() => {
        server = setupServer(errorCodeAsset(statusCode));
        server.listen();
      });

      afterEach(() => {
        server.close();
      });

      it("throws an error", () => {
        return expect(fetchImageInBase64({ path })).rejects.toBeTruthy();
      });
    });
  });
});

import { setupServer, SetupServerApi } from "msw/node";
import {
  emptyResponsesSafeSearch,
  errorCodeSafeSearch,
  mangledSafeSearchResponse,
  successfulSafeSearchResponse,
} from "../mocks/gcp/handlers";
import { analyse } from "./gcp-safesearch";

jest.mock("../config", () => ({
  config: {
    ...jest.requireActual("../config").config,
    gcp: {
      apiToken: "GCP-token",
    },
  },
}));

describe("GCP SafeSearch Image Detection", () => {
  describe("#analyse", () => {
    let server: SetupServerApi;

    afterEach(() => {
      server.close();
    });

    describe("with successful API responses", () => {
      beforeEach(() => {
        server = setupServer(successfulSafeSearchResponse);
        server.listen();
      });

      it("returns results from the API", async () => {
        const result = await analyse({ imageInBase64: "base64-encoded-image" });

        expect(result).toEqual({
          safeSearch: {
            adult: "VERY_UNLIKELY",
            spoof: "VERY_UNLIKELY",
            medical: "VERY_UNLIKELY",
            violence: "VERY_UNLIKELY",
            racy: "VERY_UNLIKELY",
          },
        });
      });
    });

    describe("with mangled API responses", () => {
      beforeEach(() => {
        server = setupServer(mangledSafeSearchResponse);
        server.listen();
      });

      it("throws an error", () => {
        return expect(
          analyse({ imageInBase64: "base64-encoded-image" })
        ).rejects.toBeTruthy();
      });
    });

    describe.each([201, 401, 500])(
      "with a %s response from the API",
      (statusCode) => {
        beforeEach(() => {
          server = setupServer(errorCodeSafeSearch(statusCode));
          server.listen();
        });

        it("throws an error", () => {
          return expect(
            analyse({ imageInBase64: "base64-encoded-image" })
          ).rejects.toBeTruthy();
        });
      }
    );

    describe("with empty responses array", () => {
      beforeEach(() => {
        server = setupServer(emptyResponsesSafeSearch);
        server.listen();
      });

      it("throws an error", () => {
        return expect(
          analyse({ imageInBase64: "base64-encoded-image" })
        ).rejects.toBeTruthy();
      });
    });
  });
});

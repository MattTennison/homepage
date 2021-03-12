import { filter, toArray } from "rxjs/operators";
import { safeSearchResponse } from "../mocks/gcp/handlers";
import { dogPhoto } from "../mocks/pexels/fixtures/image-assets/helpers";
import { server } from "../mocks/server";
import { search } from "./search";

jest.mock("../config", () => ({
  config: {
    ...jest.requireActual("../config").config,
    gcp: {
      apiToken: "GCP-token",
    },
    pexels: {
      apiToken: "pexels-api-token",
      maxImageSizeInBytes: 10 * 1024,
    },
  },
}));

describe("Search Route", () => {
  describe("with successful API responses", () => {
    beforeAll(() => {
      server.listen({ onUnhandledRequest: "error" });
    });

    afterEach(() => {
      server.resetHandlers();
    });

    afterAll(() => {
      server.close();
    });

    it("returns images in base64", (done) => {
      search({ query: "oceans" })
        .pipe(
          filter((value) => value.type === "ASSET"),
          toArray()
        )
        .subscribe((result) => {
          const isDogPhotoInBase64 = ({ payload }) =>
            payload === dogPhoto.base64;

          expect(result).toHaveLength(15);
          expect(result).toSatisfyAll(isDogPhotoInBase64);
          done();
        });
    });

    describe("SafeSearch filtering", () => {
      const categories = ["adult", "violence", "racy"];
      const unacceptableValues = [
        "UNKNOWN",
        "POSSIBLE",
        "LIKELY",
        "VERY_LIKELY",
      ];

      describe.each(categories)("for %s images", (category) => {
        it.each<string | jest.DoneCallback>(unacceptableValues)(
          "removes images with likelihood %s",
          (likelihood: string, done: jest.DoneCallback) => {
            server.use(safeSearchResponse({ [category]: likelihood }));

            search({ query: "oceans" })
              .pipe(
                filter((value) => value.type === "ASSET"),
                toArray()
              )
              .subscribe((result) => {
                expect(result).toBeEmpty();
                done();
              });
          }
        );
      });
    });
  });
});

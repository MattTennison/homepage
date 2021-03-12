import { setupServer } from "msw/node";
import { successfulSafeSearchResponse } from "./gcp/handlers";
import { successfulAssetResponse, successfulSearch } from "./pexels/handlers";

export const server = setupServer(
  successfulSearch,
  successfulSafeSearchResponse,
  successfulAssetResponse
);

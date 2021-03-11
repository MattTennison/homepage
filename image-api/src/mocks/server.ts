import { setupServer } from "msw/node";
import { successfulSearch } from "./pexels/handlers";

export const server = setupServer(successfulSearch);

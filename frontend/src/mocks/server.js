import { setupServer } from "msw/node";
import { successfulHandler } from "./quotes/handlers";

export const server = setupServer(successfulHandler);

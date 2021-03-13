import React from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { App } from "../App";
import { server } from "../mocks/server";
import quotesResponse from "../mocks/quotes/fixtures/response.json";
import { errorHandler } from "../mocks/quotes/handlers";

describe("Homepage Quotes", () => {
  const quotes = quotesResponse.map((qoute) => qoute.text);

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe("with successful API responses", () => {
    it("displays a quote at random from the API", () => {
      render(<App />);

      return screen.findByText((content) => quotes.includes(content));
    });

    it("does display the quote container", () => {
      render(<App />);

      screen.getByTestId("homepage-quote-container");
    });
  });

  describe("with failed API responses", () => {
    beforeEach(() => {
      server.use(errorHandler);
    });

    it("does not display the quote container", () => {
      render(<App />);

      return waitForElementToBeRemoved(() =>
        screen.queryByTestId("homepage-quote-container")
      );
    });
  });
});

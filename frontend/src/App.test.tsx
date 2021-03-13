import React from "react";
import { render } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("displays hello world", () => {
    const { getByText } = render(<App />);

    expect(getByText("Hello World")).toBeInTheDocument();
  });
});

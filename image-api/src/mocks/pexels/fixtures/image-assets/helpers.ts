import { resolve } from "path";
import { readFileSync } from "fs";

export const dogPhoto = {
  get buffer() {
    return readFileSync(resolve(__dirname, "./dog.webp"));
  },

  get base64() {
    return dogPhoto.buffer.toString("base64");
  },
};

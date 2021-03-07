export const clone = <T extends unknown>(object: T): T => {
  return JSON.parse(JSON.stringify(object));
};

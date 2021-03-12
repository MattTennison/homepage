import { AxiosInstance } from "axios";
import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  transports: [new transports.Console({ format: format.simple() })],
});

export const wrapAxios = (client: AxiosInstance) => {
  client.interceptors.request.use((config) => {
    const fullyQualifiedUri = new URL(config.url, config.baseURL);
    logger.info(
      `Request to ${config.method.toUpperCase()} ${fullyQualifiedUri} started`
    );
    return config;
  });

  client.interceptors.response.use((response) => {
    const { config } = response;
    const fullyQualifiedUri = new URL(config.url, config.baseURL);
    logger.info(
      `Request to ${config.method.toUpperCase()} ${fullyQualifiedUri} finished with ${
        response.status
      }`
    );
    return response;
  });
};

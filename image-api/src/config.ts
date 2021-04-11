const getInt = (key: string) => {
  const result = process.env[key];
  try {
    return parseInt(result, 10);
  } catch (e) {
    return 0;
  }
};

export const config = {
  pexels: {
    apiToken: process.env.PEXELS_API_TOKEN,
    maxImageSizeInBytes:
      getInt("PEXELS_MAX_IMAGE_SIZE_IN_BYTES") || 10 * 1024 * 1024,
  },
  gcp: {
    apiToken: process.env.GCP_API_TOKEN,
  },
  port: getInt("PORT") || 3000,
};

const getInt = (key) => {
  const result = process.env[key];
  try {
    parseInt(result, 10);
  } catch {
    return 0;
  }
};

export const config = {
  pexels: {
    apiToken: process.env.PEXELS_API_TOKEN,
    maxImageSizeInBytes:
      getInt("PEXELS_MAX_IMAGE_SIZE_IN_BYTES") || 10 * 1024 * 1024,
    apiBaseUrl: process.env.PEXELS_API_BASE_URL,
  },
  gcp: {
    apiToken: process.env.GCP_API_TOKEN,
  },
};

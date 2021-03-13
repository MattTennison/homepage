import { Observable } from "rxjs";
import { analyse } from "../services/gcp-safesearch";
import { fetchImageInBase64, search as pexelsSearch } from "../services/pexels";

type SearchResponse = {
  type: "ASSET";
  payload: string;
};

const checkImageForExplictContent = async (absolutePexelsPath: string) => {
  const base64 = await fetchImageInBase64({
    path: absolutePexelsPath.replace("https://images.pexels.com", ""),
  });
  const { safeSearch } = await analyse({ imageInBase64: base64 });

  const categoriesToCheck = ["adult", "violence", "racy"];
  const isKnownSafe = categoriesToCheck.every(
    (category) =>
      safeSearch[category] === "VERY_UNLIKELY" ||
      safeSearch[category] === "UNLIKELY"
  );

  return {
    isKnownSafe,
    payload: absolutePexelsPath,
  };
};

export const search = ({ query }: { query: string }) => {
  return new Observable<SearchResponse>((subscriber) => {
    pexelsSearch({ query }).then((assets) => {
      return Promise.allSettled(
        assets.photos.map((photo) =>
          checkImageForExplictContent(photo.src)
            .then((result) => {
              if (result.isKnownSafe) {
                subscriber.next({ type: "ASSET", payload: result.payload });
              }
            })
            .catch((err) => {
              console.log(err);
              throw err;
            })
        )
      ).then(() => subscriber.complete());
    });
  });
};

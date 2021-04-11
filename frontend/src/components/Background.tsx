import React, { useReducer, useEffect } from "react";
import { Box, Button, VStack } from "@chakra-ui/react";
import { get, set } from "idb-keyval";

type BackgroundProps = {
  children: React.ReactNode;
};

type BackgroundReducerUpdateUrlAction = {
  type: "UPDATE_URL";
  url: string;
};

type BackgroundReducerUpdateDataAction = {
  type: "UPDATE_DATA";
  assetUrl: string;
  assetInBase64: string;
};

type BackgroundReducerAction =
  | BackgroundReducerUpdateUrlAction
  | BackgroundReducerUpdateDataAction;

type BackgroundReducerLoadedStore = {
  state: "LOADED";
  currentAsset: {
    url: string;
    base64: string;
  };
};

type BackgroundReducerLoadingStore = {
  state: "LOADING";
  currentAsset: {
    url: string;
  };
};

type BackgroundReducerInitialStore = {
  state: "PENDING";
};

type BackgroundReducerState =
  | BackgroundReducerInitialStore
  | BackgroundReducerLoadingStore
  | BackgroundReducerLoadedStore;

const blobToBase64 = (blob: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("unknown.reader.result.type");
      }
    };
  });
};
const saveBlobToIndexedDb = (backgroundImage: string) => async (blob: Blob) => {
  await set(backgroundImage, blob);

  return blob;
};

export const Background: React.FC<BackgroundProps> = ({ children }) => {
  const [store, dispatch] = useReducer(
    (state: BackgroundReducerState, action: BackgroundReducerAction) => {
      if (action.type === "UPDATE_URL") {
        const returnValue: BackgroundReducerLoadingStore = {
          state: "LOADING",
          currentAsset: {
            url: action.url,
          },
        };
        return returnValue;
      }

      if (action.type === "UPDATE_DATA") {
        const returnValue: BackgroundReducerLoadedStore = {
          state: "LOADED",
          currentAsset: {
            url: action.assetUrl,
            base64: action.assetInBase64,
          },
        };
        return returnValue;
      }

      return state;
    },
    { state: "PENDING" }
  );

  const backgroundImage =
    store.state === "PENDING"
      ? "https://images.pexels.com/photos/2527556/pexels-photo-2527556.jpeg"
      : store.currentAsset.url;

  useEffect(() => {
    let isActive = true;
    let image = backgroundImage;

    fetch(image)
      .then((response) => response.blob())
      .then(saveBlobToIndexedDb(image))
      .then(blobToBase64)
      .then((assetInBase64) => {
        if (isActive) {
          dispatch({
            type: "UPDATE_DATA",
            assetUrl: image,
            assetInBase64,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [backgroundImage]);

  const getNewImage = () => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.addEventListener("message", (message) => {
      if (typeof message.data === "string") {
        const parsedData = JSON.parse(message.data);
        if (parsedData.payload.assetUrl) {
          dispatch({
            type: "UPDATE_URL",
            url: parsedData.payload.assetUrl,
          });
        }
      }
    });
  };

  return (
    <Box
      background={
        store.state === "LOADED"
          ? `url(${store.currentAsset.base64})`
          : undefined
      }
      w="100vw"
      h="100vh"
      backgroundSize="cover"
      backgroundPosition="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack>
        {children}
        <Button onClick={getNewImage}>New Image Please</Button>
      </VStack>
    </Box>
  );
};

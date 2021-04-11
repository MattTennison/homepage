import React, { useReducer, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { set } from "idb-keyval";

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

type BackgroundReducerModalActions = {
  type: "DISPLAY_MODAL" | "CLOSE_MODAL";
};

type BackgroundReducerAction =
  | BackgroundReducerUpdateUrlAction
  | BackgroundReducerUpdateDataAction
  | BackgroundReducerModalActions;

type CurrentAssetLoadedState = {
  state: "LOADED";
  url: string;
  base64: string;
};

type CurrentAssetLoadingState = {
  state: "LOADING";
  url: string;
};

type BackgroundReducerState = {
  currentAsset: CurrentAssetLoadingState | CurrentAssetLoadedState;
};

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
        return {
          currentAsset: {
            state: "LOADING" as const,
            url: action.url,
          },
        };
      }

      if (action.type === "UPDATE_DATA") {
        return {
          currentAsset: {
            state: "LOADED" as const,
            url: action.assetUrl,
            base64: action.assetInBase64,
          },
        };
      }

      return state;
    },
    {
      currentAsset: {
        state: "LOADING",
        url:
          "https://images.pexels.com/photos/2527556/pexels-photo-2527556.jpeg",
      },
    }
  );

  const backgroundImage = store.currentAsset.url;

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
    <Flex
      background={
        store.currentAsset.state === "LOADED"
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
      {children}
      <SettingsIcon
        alignSelf="end"
        color="whiteAlpha.800"
        boxSize="2em"
        padding="4"
        boxSizing="content-box"
        _hover={{ color: "whiteAlpha.900" }}
      />
    </Flex>
  );
};

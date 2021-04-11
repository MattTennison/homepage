import React, { useReducer, useState } from "react";
import { Flex, HStack } from "@chakra-ui/react";
import { SettingsIcon, RepeatIcon } from "@chakra-ui/icons";
import { BackgroundImageModal } from "./BackgroundImageModal";
import { BackgroundProvider, useBackgroundImage } from "./BackgroundContext";

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
  modal: {
    visible: boolean;
  };
  currentAsset: CurrentAssetLoadingState | CurrentAssetLoadedState;
};

const BackgroundUI: React.FC<BackgroundProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { backgroundImage, refresh } = useBackgroundImage();

  return (
    <Flex
      background={
        backgroundImage
          ? `url(${backgroundImage.url})`
          : `linear-gradient(90deg, #4b6cb7 0%, #182848 100%);`
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
      <HStack alignSelf="end" padding={4}>
        {backgroundImage ? (
          <RepeatIcon
            onClick={refresh}
            color="whiteAlpha.800"
            boxSize="2em"
            boxSizing="content-box"
            _hover={{ color: "whiteAlpha.900" }}
          />
        ) : null}
        <SettingsIcon
          onClick={() => setIsModalVisible(true)}
          color="whiteAlpha.800"
          boxSize="2em"
          boxSizing="content-box"
          _hover={{ color: "whiteAlpha.900" }}
        />
      </HStack>
      <BackgroundImageModal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </Flex>
  );
};

export const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <BackgroundProvider>
      <BackgroundUI>{children}</BackgroundUI>
    </BackgroundProvider>
  );
};

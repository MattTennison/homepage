import {
  Button,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useReducer, useState } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import { useUpdateBackgroundImages } from "./BackgroundContext";

type BackgroundImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type BackgroundImageModalState = {
  isLoading: boolean;
  images: { url: string }[];
};

type Loading = {
  type: "START_LOADING" | "STOP_LOADING";
};

type LoadImage = {
  type: "IMAGE_LOADED";
  asset: {
    url: string;
  };
};

type BackgroundImageModalAction = Loading | LoadImage;

type SearchInputProps = {
  onSearch: (searchValue: string) => void;
  canSearch: boolean;
};

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, canSearch }) => {
  const [input, setInput] = useState("");

  return (
    <InputGroup>
      <Input
        placeholder="Enter a theme"
        onChange={(e) => setInput(e.target.value)}
      />
      <InputRightAddon>
        <IconButton
          aria-label="Search"
          icon={<SearchIcon />}
          onClick={() => onSearch(input)}
          disabled={!canSearch}
        />
      </InputRightAddon>
    </InputGroup>
  );
};

export const BackgroundImageModal: React.FC<BackgroundImageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [store, dispatch] = useReducer(
    (state: BackgroundImageModalState, action: BackgroundImageModalAction) => {
      if (action.type === "START_LOADING") {
        return { ...state, images: [], isLoading: true };
      }

      if (action.type === "STOP_LOADING") {
        return { ...state, isLoading: false };
      }

      if (action.type === "IMAGE_LOADED") {
        return {
          ...state,
          images: [...state.images, { url: action.asset.url }],
        };
      }

      return state;
    },
    { isLoading: false, images: [] }
  );

  const updateBackgroundImages = useUpdateBackgroundImages();

  const searchForImages = (searchTerm: string) => {
    dispatch({ type: "START_LOADING" });

    const ws = new WebSocket("ws://localhost:3000");

    ws.addEventListener("message", (message) => {
      if (typeof message.data === "string") {
        const parsedData = JSON.parse(message.data);
        if (parsedData.payload.assetUrl) {
          dispatch({
            type: "IMAGE_LOADED",
            asset: {
              url: parsedData.payload.assetUrl,
            },
          });
        }
      }
    });

    ws.addEventListener("close", () => {
      dispatch({ type: "STOP_LOADING" });
    });
  };

  const onSave = () => {
    updateBackgroundImages(store.images);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent paddingY={4} paddingX={2}>
        <ModalCloseButton alignSelf="end" />
        <ModalHeader>Change Background</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text>
              Background images are provided by{" "}
              <Link href="https://www.pexels.com" color="teal.500">
                Pexels
              </Link>
              . Images are filtered with Google SafeSearch.
            </Text>
            <SearchInput
              onSearch={searchForImages}
              canSearch={!store.isLoading}
            />
            {store.isLoading ? <Spinner /> : null}
            <SimpleGrid columns={3} spacing={4}>
              {store.images.map((asset, index) => (
                <Image
                  flexGrow={1}
                  width="210px"
                  height="120px"
                  src={asset.url}
                  key={index}
                  fit="cover"
                />
              ))}
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            onClick={onSave}
            isDisabled={store.isLoading || store.images.length === 0}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

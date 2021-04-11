import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

type Asset = {
  url: string;
};

type BackgroundContextType = {
  assets: Asset[];
  replaceAssets: (newAssets: Asset[]) => void;
};

const noOp = () => {};

const BackgroundContext = React.createContext<BackgroundContextType>({
  assets: [],
  replaceAssets: noOp,
});

type BackgroundProvderProps = {
  children: React.ReactNode;
};

type BackgroundProviderState = {
  assets: Asset[];
};

type ReplaceAssetsAction = {
  type: "REPLACE_ASSETS";
  newAssets: Asset[];
};

type BackgroundProviderAction = ReplaceAssetsAction;

export const BackgroundProvider: React.FC<BackgroundProvderProps> = ({
  children,
}) => {
  const [store, dispatch] = useReducer(
    (state: BackgroundProviderState, action: BackgroundProviderAction) => {
      if (action.type === "REPLACE_ASSETS") {
        return {
          ...state,
          assets: [...action.newAssets],
        };
      }

      return state;
    },
    { assets: [] }
  );
  const replaceAssets = useCallback(
    (newAssets) => {
      dispatch({ type: "REPLACE_ASSETS", newAssets });
    },
    [dispatch]
  );

  const contextValue = useMemo(
    () => ({
      assets: store.assets,
      replaceAssets,
    }),
    [replaceAssets, store.assets]
  );

  return (
    <BackgroundContext.Provider value={contextValue}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useUpdateBackgroundImages = () => {
  const context = useContext(BackgroundContext);

  return context.replaceAssets;
};

const getRandomElement = (array: Asset[]): Asset | undefined => {
  if (array.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
};

export const useBackgroundImage = () => {
  const { assets } = useContext(BackgroundContext);
  const [chosenAsset, setChosenAsset] = useState<Asset | undefined>(
    getRandomElement(assets)
  );

  const refresh = useCallback(() => {
    setChosenAsset((chosenAsset) => {
      if (assets.length === 1) {
        return chosenAsset;
      }

      const otherAssets = assets.filter((a) => a !== chosenAsset);
      return getRandomElement(otherAssets);
    });
  }, [assets, setChosenAsset]);

  useEffect(() => refresh(), [assets, refresh]);

  return {
    backgroundImage: chosenAsset,
    refresh,
  };
};

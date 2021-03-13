import React from "react";
import { Box } from "@chakra-ui/react";

type BackgroundProps = {
  children: React.ReactNode;
};

export const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <Box
      backgroundImage="url(https://images.pexels.com/photos/2527556/pexels-photo-2527556.jpeg)"
      w="100vw"
      h="100vh"
      backgroundSize="cover"
      backgroundPosition="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </Box>
  );
};

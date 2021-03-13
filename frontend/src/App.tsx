import React from "react";
import { ChakraProvider, Container } from "@chakra-ui/react";
import { Quotes } from "./components/Quotes";
import { Background } from "./components/Background";

export const App = () => (
  <ChakraProvider>
    <Background>
      <Container
        backgroundColor="white"
        padding={4}
        borderWidth={2}
        borderColor="whiteAlpha.600"
        backgroundClip="padding-box"
        centerContent
      >
        <Quotes />
      </Container>
    </Background>
  </ChakraProvider>
);

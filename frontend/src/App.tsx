import React from 'react';
import { Box, ChakraProvider, Container } from '@chakra-ui/react';

export const App = () => (
  <ChakraProvider>
    <Box backgroundImage="url(https://images.pexels.com/photos/2527556/pexels-photo-2527556.jpeg)" w="100vw" h="100vh" backgroundSize="cover" backgroundPosition="center" display="flex" alignItems="center" justifyContent="center">
      <Container backgroundColor="white" padding={4} borderWidth={2} borderColor="whiteAlpha.600" backgroundClip="padding-box">
        Hello World
      </Container>
    </Box>
  </ChakraProvider>
);

import { Text } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/skeleton';
import React, { useEffect, useState } from 'react';

enum ComponentState {
    LOADING,
    LOADED,
    ERROR
};

export const Quotes = () => {
    const [quoteToDisplay, setQuoteToDisplay] = useState<string>();
    const [state, setState] = useState<ComponentState>(ComponentState.LOADING);
    
    useEffect(() => {
        let isMounted = true;

        fetch("https://type.fit/api/quotes")
            .then(response => response.json())
            .then(response => {
                const quoteIndex = Math.floor(Math.random() * response.length);
                if (isMounted) {
                    setQuoteToDisplay(response[quoteIndex].text);
                    setState(ComponentState.LOADED)
                }
            })
            .catch(() => {
                if (isMounted) {
                    setState(ComponentState.ERROR);
                }
            });

        return () => {
            isMounted = false;
        }
    }, [])

    return state === ComponentState.ERROR ? null : (
        <Skeleton data-testid="homepage-quote-container" isLoaded={state !== ComponentState.LOADING}>
            <Text w="100%" minH="1em">
                {quoteToDisplay}
            </Text>
        </Skeleton>
    )
}
import React, { createContext, useContext, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type ScrollContextType = {
    isScrollingDown: boolean;
    handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const ScrollContext = createContext<ScrollContextType>({
    isScrollingDown: false,
    handleScroll: () => { },
});

export function ScrollProvider({ children }: { children: React.ReactNode }) {
    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const lastOffsetY = useRef(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const diff = currentY - lastOffsetY.current;

        // Only react if scroll is significant (> 2px) and past initial area
        if (currentY > 50) {
            if (diff > 2) {
                setIsScrollingDown(true);
            } else if (diff < -2) {
                setIsScrollingDown(false);
            }
        } else {
            setIsScrollingDown(false);
        }

        lastOffsetY.current = currentY;
    };

    return (
        <ScrollContext.Provider value={{ isScrollingDown, handleScroll }}>
            {children}
        </ScrollContext.Provider>
    );
}

export function useScrollDirection() {
    return useContext(ScrollContext);
}

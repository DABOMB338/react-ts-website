import React from "react";

export default function useWindowSize() {
    const screenSize = React.useRef<number[]>([window.innerHeight, window.innerWidth]);

    React.useEffect(() => {
        window.addEventListener("resize", () => {
            console.log("Resized window to", window.innerHeight, window.innerWidth);
            screenSize.current = [window.innerHeight, window.innerWidth];
        });
        return () => {
            window.removeEventListener("resize", () => {
                screenSize.current = [window.innerHeight, window.innerWidth];
            })
        }
    }, []);
    
    return screenSize.current;
}
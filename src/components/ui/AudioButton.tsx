import React, { useCallback, useMemo } from "react";
import buttonBell from "@/assets/sounds/beep.mp3";
import { Button } from "./button";
import { ButtonProps } from "./button";

interface AudioButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

const AudioButton: React.FC<AudioButtonProps> = ({
  onClick,
  children,
  ...props
}) => {
  const audio = useMemo(() => {
    const audioObj = new Audio(buttonBell);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn("Audio playback failed:", error);
      });

      onClick?.(event);
    },
    [audio, onClick],
  );

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

export default AudioButton;
import { cn } from "@/utils";
import { motion } from "framer-motion";
import { quantum } from 'ldrs';

quantum.register();

const desktopClassName = "lg:aspect-video lg:max-h-none lg:h-auto";
const tabletClassName = "sm:max-h-[680px] md:max-h-[720px]"; 
const mobileClassName = "w-full h-full max-h-[90vh] max-w-full";

export const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2.5xl border-2 border-primary bg-wrapper shadow-wrapper-shadow backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        desktopClassName,
        tabletClassName,
        mobileClassName,
      )}
    >
      <img
        src="/images/dialogBlur.svg"
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children || (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <l-quantum
            size="45"
            speed="1.75"
            color="white"
          ></l-quantum>
          <p className="text-white text-lg">Loading...</p>
        </div>
      )}
    </div>
  );
};

export const AnimatedWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        scale: {
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }}
      className={cn(
        "relative overflow-hidden rounded-2.5xl border-2 border-primary bg-wrapper shadow-wrapper-shadow backdrop-blur-sm",
        "transition-all duration-300 ease-in-out",
        desktopClassName,
        tabletClassName,
        mobileClassName,
      )}
    >
      <img
        src="/images/dialogBlur.svg"
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}
    </motion.div>
  );
};

export const TextBlockWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="relative flex size-full flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8">
      {children}
    </div>
  );
};

export const AnimatedTextBlockWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        scale: {
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        },
      }}
      className="relative flex size-full flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8"
    >
      {children}
    </motion.div>
  );
};

export const StaticTextBlockWrapper = ({
  imgSrc,
  title,
  titleClassName,
  description,
  descriptionClassName,
  children,
}: {
  imgSrc: string;
  title: string;
  titleClassName?: string;
  description: string;
  descriptionClassName?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center max-w-full">
      <img
        src={imgSrc}
        alt="icon"
        className="mb-4 size-16 sm:mb-6 sm:size-20 lg:mb-8 lg:size-30"
      />
      <h2
        className={cn(
          "mb-4 bg-text-primary bg-clip-text pt-1 text-center text-3xl text-transparent sm:max-w-[650px] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
          "px-4 leading-tight",
          titleClassName,
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-[650px] text-center text-sm px-4 sm:text-base md:text-lg",
          descriptionClassName,
        )}
      >
        {description}
      </p>
      {children}
    </div>
  );
};
import React from "react";
import Lottie from "react-lottie";
import { twMerge } from "tailwind-merge";
import hamburgerAnimation from "../assets/lotties/hamburger.json";

const animationOptions = {
  loop: false,
  autoplay: false,
  animationData: hamburgerAnimation,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

interface Props {
  open: boolean;
  className?: string;
  onClick?: () => void;
}

export const HamburgerIcon = ({ open = false, className, onClick }: Props) => {
  return (
    <div
      className={twMerge(
        "z-50 flex h-9 w-9 cursor-pointer items-center rounded-md bg-base-900 transition-colors hover:bg-base-800 lg:h-[38px] lg:w-[38px] ",
        className
      )}
      onClick={onClick}
    >
      <Lottie
        isPaused={open}
        direction={open ? 1 : -1}
        options={animationOptions}
        height={80}
        width={80}
      />
    </div>
  );
};

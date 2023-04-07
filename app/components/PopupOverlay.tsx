import React from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

const PopupOverlay = ({ children, onClose }: Props) => {
  return (
    <button
      className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center overflow-hidden bg-base-1200/90 pt-[100px] backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </button>
  );
};

export default PopupOverlay;

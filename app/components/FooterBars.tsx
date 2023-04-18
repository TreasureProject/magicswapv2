import React from "react";
import { Button } from "./ui/Button";
import { DiscordIcon } from "./Icons";
import chatMessageImage from "../assets/chat_messages.png";

export const DiscordSupportBar = () => {
  return (
    <div className="relative flex w-full flex-col items-center justify-between gap-6 overflow-hidden rounded-lg border border-night-900 bg-night-1100 p-6 md:flex-row">
      <div className="relative z-10 flex flex-col md:gap-1">
        <h1 className="text-center text-lg font-medium md:text-start">
          Still have Questions?
        </h1>
        <p className="text-center text-sm text-night-400 md:text-start">
          Join our community on Discord and find out more!
        </p>
      </div>
      <img
        src={chatMessageImage}
        alt="Messages of discord users helping each other"
        className="absolute left-[55%] top-1/2 w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-25 lg:opacity-100 "
      />
      <Button className="relative z-10 w-full px-4 md:w-max">
        <DiscordIcon className="w-6" />
        Join Server
      </Button>
    </div>
  );
};

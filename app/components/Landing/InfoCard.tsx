import { ChevronRight as ChevronRightIcon } from "lucide-react";
import React from "react";

interface Props {
  Icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
  className?: string;
}

const InfoCard = ({ Icon, title, description, link, className }: Props) => {
  return (
    <div className="flex w-full flex-col rounded-xl bg-night-1100">
      <div className="flex flex-col gap-4 p-8 md:min-h-[264px]">
        <Icon className="w-[42px]" />
        <h1 className="text-xl font-bold leading-[160%] text-night-100">
          {title}
        </h1>
        <p className="leading-[160%] text-night-400">{description}</p>
      </div>
      {!!link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="flex cursor-pointer items-center justify-between border-t border-t-night-1200 p-4 text-night-400 transition-colors hover:text-night-100"
        >
          <p className="leading-[160%]">Read More</p>
          <ChevronRightIcon className="w-4" />
        </a>
      )}
    </div>
  );
};

export default InfoCard;

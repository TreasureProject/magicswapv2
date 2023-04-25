import React from "react";

import { cn } from "~/lib/utils";

interface Props {
  Icon?: React.ElementType;
  iconClass?: string;
  Background?: React.ElementType;
  value: string;
  title: string;
}

const StatisticCard = ({
  Icon,
  iconClass,
  Background,
  value,
  title,
}: Props) => {
  return (
    <div className="relative flex h-[88px] w-full flex-col justify-center overflow-hidden rounded-lg border-t border-t-night-800 bg-night-1000 px-6 shadow-xl md:h-[110px] md:px-8">
      <div className="relative z-10 flex items-center gap-2 md:gap-3">
        {!!Icon && <Icon className={cn("w-5 md:w-6", iconClass)} />}
        <p className="text-xl font-bold leading-[160%] text-night-100 md:text-2xl">
          {value}
        </p>
      </div>
      <p className="relative z-10 text-sm uppercase leading-[130%] text-night-400">
        {title}
      </p>
      {!!Background && (
        <Background className="absolute -bottom-[100px] -right-[80px] h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 text-night-1100" />
      )}
    </div>
  );
};

export default StatisticCard;

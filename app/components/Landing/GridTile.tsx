import React from "react";

import { cn } from "~/lib/utils";

interface GridTileProps {
  state: "empty" | "filled" | "image";
  src?: string;
}

export const GridTile = ({ state, src }: GridTileProps) => {
  return (
    <div
      className={cn(
        "h-24 w-24 rounded-2xl border border-night-800",
        state === "filled" && "bg-night-1000"
      )}
    >
      {!!src && <img src={src} alt="a nft" className="h-full w-full" />}
    </div>
  );
};

// interface FullGridProps {

// }

// export const FullGrid = () => {
//     return (
//         <div className="grid w-screen h-screen grid-cols-18 rotate-90">

//         </div>
//     )
//     }

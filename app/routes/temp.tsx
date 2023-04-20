import React from "react";

import { CloseButton } from "~/components/ui/Button";
import type { PoolToken } from "~/lib/tokens.server";

const Temp = ({ token }: { token: PoolToken }) => {
  return (
    <div className="flex h-[90vh] w-full items-center justify-center">
      <div className="max-w-6xl">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <p className="text-md text-night-400">Withdraw</p>
            {token.image ? (
              <img
                className="h-6 w-6 rounded-full"
                src={token.image}
                alt={token.name}
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-night-900" />
            )}
            <p className="text-md font-medium capitalize text-night-100">
              {token.name}
            </p>
          </div>
          <CloseButton />
        </div>
      </div>
    </div>
  );
};

export default Temp;

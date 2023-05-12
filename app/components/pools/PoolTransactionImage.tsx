import { PoolTokenImage } from "./PoolTokenImage";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";

type Props = {
  token: PoolToken;
  items: Pool["transactions"][number]["baseItems"];
};

export const PoolTransactionImage = ({ token, items }: Props) => {
  if (items.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {items.slice(0, 4).map((item) => (
          <div
            key={item.tokenId}
            className="h-4 w-4 overflow-hidden rounded-sm"
          >
            <img src={item.image} title={item.name} alt="" />
          </div>
        ))}
      </div>
    );
  }

  if (items[0]) {
    return (
      <div className="h-9 w-9 overflow-hidden rounded">
        <img src={items[0].image} title={items[0].name} alt="" />
      </div>
    );
  }

  return <PoolTokenImage className="h-9 w-9" token={token} />;
};
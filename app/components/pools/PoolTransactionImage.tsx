import type { PoolTransactionItem } from "~/api/pools.server";
import type { Token } from "~/types";
import { PoolTokenImage } from "./PoolTokenImage";

type Props = {
  token: Token;
  items: PoolTransactionItem[];
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
            {item.image ? (
              <img src={item.image} title={item.name} alt="" />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (items[0]) {
    return (
      <div className="h-9 w-9 overflow-hidden rounded">
        {items[0].image ? (
          <img src={items[0].image} title={items[0].name} alt="" />
        ) : null}
      </div>
    );
  }

  return <PoolTokenImage className="h-9 w-9" token={token} />;
};

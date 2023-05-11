import { parseUnits } from "@ethersproject/units";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";

import Table from "../Table";
import { SelectionPopup } from "../item_selection/SelectionPopup";
import { Button } from "../ui/Button";
import { LabeledCheckbox } from "../ui/Checkbox";
import { Dialog } from "../ui/Dialog";
import { PoolNftTokenInput } from "./PoolNftTokenInput";
import { PoolTokenInput } from "./PoolTokenInput";
import { useSettings } from "~/contexts/settings";
import { useAddLiquidity } from "~/hooks/useAddLiquidity";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { formatBalance } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { getAmountMin, getLpCountForTokens, quote } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString, Optional, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  onSuccess?: () => void;
};

export const PoolDepositTab = ({ pool, onSuccess }: Props) => {
  const { address } = useAccount();
  const { slippage } = useSettings();
  const [{ amount, baseNfts, quoteNfts, isExactQuote }, setTrade] = useState({
    amount: "0",
    baseNfts: [] as TroveTokenWithQuantity[],
    quoteNfts: [] as TroveTokenWithQuantity[],
    isExactQuote: false,
  });
  const [selectingToken, setSelectingToken] = useState<Optional<PoolToken>>({
    id: "0xffd45937af2ad9f06aa3d8c093c5f68984be6fe9",
    name: "Smol Brains",
    symbol: "SMOL",
    decimals: "18",
    derivedMAGIC: "500.6012634662040955768",
    vaultCollections: [
      {
        collection: {
          id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
          type: "ERC721",
        },
        tokenIds: null,
      },
    ],
    vaultReserveItems: [
      {
        id: "0xffd45937af2ad9f06aa3d8c093c5f68984be6fe9c831f372b4342824eb533c486bf0aafc1cf0521f10000000",
        collection: {
          id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        },
        tokenId: "16",
        amount: 1,
      },
      {
        id: "0xffd45937af2ad9f06aa3d8c093c5f68984be6fe9c831f372b4342824eb533c486bf0aafc1cf0521f3a050000",
        collection: {
          id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        },
        tokenId: "1338",
        amount: 1,
      },
      {
        id: "0xffd45937af2ad9f06aa3d8c093c5f68984be6fe9c831f372b4342824eb533c486bf0aafc1cf0521fb80b0000",
        collection: {
          id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        },
        tokenId: "3000",
        amount: 1,
      },
      {
        id: "0xffd45937af2ad9f06aa3d8c093c5f68984be6fe9c831f372b4342824eb533c486bf0aafc1cf0521fb90b0000",
        collection: {
          id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        },
        tokenId: "3001",
        amount: 1,
      },
      {
        id: "0xffd45937af2ad9f06aa3d8c093c5f68984be6fe9c831f372b4342824eb533c486bf0aafc1cf0521fba0b0000",
        collection: {
          id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        },
        tokenId: "3002",
        amount: 1,
      },
    ],
    image: "https://djmahssgw62sw.cloudfront.net/0/SmolBrainsV2.png",
    collections: [
      {
        id: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        urlSlug: "smol-brains-ag",
        name: "Smol Brains",
        symbol: "Smol",
        type: "ERC721",
        image: "https://djmahssgw62sw.cloudfront.net/0/SmolBrainsV2.png",
      },
    ],
    urlSlug: "smol-brains-ag",
    type: "ERC721",
    isNft: true,
    collectionId: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
    priceUSD: 3233.173668630466,
    reserve: 5,
    reserveItems: [
      {
        collectionId: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        tokenId: "16",
        amount: 1,
        name: "Smol #16",
        image:
          "https://d382590x7sfjta.cloudfront.net/general/0x3562d57093fb812192b3a4b9268ecefe1c869d0d484e525d369548dcb450e9c9.svg",
        attributes: [
          {
            value: 0,
            traitType: "IQ",
            displayType: "numeric",
          },
          {
            value: 0,
            traitType: "Head Size",
            displayType: "numeric",
          },
          {
            value: "purple",
            traitType: "Background",
            displayType: null,
          },
          {
            value: "light-orange",
            traitType: "Body",
            displayType: null,
          },
          {
            value: "prisoner",
            traitType: "Clothes",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Glasses",
            displayType: null,
          },
          {
            value: "cap-black",
            traitType: "Hat",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Hair",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Mouth",
            displayType: null,
          },
          {
            value: "male",
            traitType: "Gender",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Staked",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Naked",
            displayType: null,
          },
          {
            value: "Smol Corpse Bride",
            traitType: "Skin",
            displayType: null,
          },
          {
            value: "Pennysmol",
            traitType: "Skin",
            displayType: null,
          },
          {
            value: "9",
            traitType: "Trait Count",
            displayType: "default",
          },
        ],
      },
      {
        collectionId: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        tokenId: "1338",
        amount: 1,
        name: "Smol #1338",
        image:
          "https://d382590x7sfjta.cloudfront.net/general/0xe369c9fcc9dc38b2a3a9aa1472948102a0f80591fd1e6d446eed5b75ce0ea6d5.svg",
        attributes: [
          {
            value: 0,
            traitType: "IQ",
            displayType: "numeric",
          },
          {
            value: 0,
            traitType: "Head Size",
            displayType: "numeric",
          },
          {
            value: "cyan",
            traitType: "Background",
            displayType: null,
          },
          {
            value: "black",
            traitType: "Body",
            displayType: null,
          },
          {
            value: "jacket",
            traitType: "Clothes",
            displayType: null,
          },
          {
            value: "sunglasses",
            traitType: "Glasses",
            displayType: null,
          },
          {
            value: "cap-black",
            traitType: "Hat",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Hair",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Mouth",
            displayType: null,
          },
          {
            value: "male",
            traitType: "Gender",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Staked",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Naked",
            displayType: null,
          },
          {
            value: "10",
            traitType: "Trait Count",
            displayType: "default",
          },
        ],
      },
      {
        collectionId: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        tokenId: "3000",
        amount: 1,
        name: "Smol #3000",
        image:
          "https://d382590x7sfjta.cloudfront.net/general/0x58dea1e8c383e02e0c7a2cfcc84269bb9d72964ed462f130e1cf0d6dfa54fbcd.svg",
        attributes: [
          {
            value: 2797,
            traitType: "IQ",
            displayType: "numeric",
          },
          {
            value: 0,
            traitType: "Head Size",
            displayType: "numeric",
          },
          {
            value: "green",
            traitType: "Background",
            displayType: null,
          },
          {
            value: "brown",
            traitType: "Body",
            displayType: null,
          },
          {
            value: "prisoner",
            traitType: "Clothes",
            displayType: null,
          },
          {
            value: "glasses",
            traitType: "Glasses",
            displayType: null,
          },
          {
            value: "cap-purple",
            traitType: "Hat",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Hair",
            displayType: null,
          },
          {
            value: "mask",
            traitType: "Mouth",
            displayType: null,
          },
          {
            value: "male",
            traitType: "Gender",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Staked",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Naked",
            displayType: null,
          },
          {
            value: "11",
            traitType: "Trait Count",
            displayType: "default",
          },
        ],
      },
      {
        collectionId: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        tokenId: "3001",
        amount: 1,
        name: "Smol #3001",
        image:
          "https://d382590x7sfjta.cloudfront.net/general/0x6ab14f644cdda5f284514b9240406cf82306a2e9e1a8cfae5bc593a7a037fcfe.svg",
        attributes: [
          {
            value: 2033,
            traitType: "IQ",
            displayType: "numeric",
          },
          {
            value: 0,
            traitType: "Head Size",
            displayType: "numeric",
          },
          {
            value: "gray",
            traitType: "Background",
            displayType: null,
          },
          {
            value: "purple",
            traitType: "Body",
            displayType: null,
          },
          {
            value: "suit",
            traitType: "Clothes",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Glasses",
            displayType: null,
          },
          {
            value: "cap-blue",
            traitType: "Hat",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Hair",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Mouth",
            displayType: null,
          },
          {
            value: "male",
            traitType: "Gender",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Staked",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Naked",
            displayType: null,
          },
          {
            value: "9",
            traitType: "Trait Count",
            displayType: "default",
          },
        ],
      },
      {
        collectionId: "0xc831f372b4342824eb533c486bf0aafc1cf0521f",
        tokenId: "3002",
        amount: 1,
        name: "Smol #3002",
        image:
          "https://d382590x7sfjta.cloudfront.net/general/0x96b3d7e463b3e87df9e796242f80b1dc75b8af6c8ff8482b3f511e99f2d7a57d.svg",
        attributes: [
          {
            value: 2818,
            traitType: "IQ",
            displayType: "numeric",
          },
          {
            value: 0,
            traitType: "Head Size",
            displayType: "numeric",
          },
          {
            value: "red",
            traitType: "Background",
            displayType: null,
          },
          {
            value: "black",
            traitType: "Body",
            displayType: null,
          },
          {
            value: "jacket",
            traitType: "Clothes",
            displayType: null,
          },
          {
            value: "glasses",
            traitType: "Glasses",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Hat",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Hair",
            displayType: null,
          },
          {
            value: "none",
            traitType: "Mouth",
            displayType: null,
          },
          {
            value: "male",
            traitType: "Gender",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Staked",
            displayType: null,
          },
          {
            value: "false",
            traitType: "Naked",
            displayType: null,
          },
          {
            value: "9",
            traitType: "Trait Count",
            displayType: "default",
          },
        ],
      },
    ],
  });
  const [checkedTerms, setCheckedTerms] = useState(false);

  const amountBase = isExactQuote
    ? quote(amount, pool.quoteToken.reserve, pool.baseToken.reserve)
    : amount;
  const amountQuote = isExactQuote
    ? amount
    : quote(amount, pool.baseToken.reserve, pool.quoteToken.reserve);

  const amountBaseBN = parseUnits(amountBase, pool.baseToken.decimals);
  const amountQuoteBN = parseUnits(amountQuote, pool.quoteToken.decimals);

  const hasAmount = amountBaseBN.gt(0);

  const { data: baseTokenBalance, refetch: refetchBaseTokenBalance } =
    useBalance({
      address,
      token: pool.baseToken.id as AddressString,
      enabled: !!address && !pool.baseToken.isNft,
    });
  const { data: quoteTokenBalance, refetch: refetchQuoteTokenBalance } =
    useBalance({
      address,
      token: pool.quoteToken.id as AddressString,
      enabled: !!address && !pool.quoteToken.isNft,
    });

  const { isApproved: isBaseTokenApproved, refetch: refetchBaseTokenApproval } =
    useIsApproved({
      token: pool.baseToken,
      amount: amountBaseBN,
      enabled: hasAmount,
    });
  const {
    isApproved: isQuoteTokenApproved,
    refetch: refetchQuoteTokenApproval,
  } = useIsApproved({
    token: pool.quoteToken,
    amount: amountQuoteBN,
    enabled: hasAmount,
  });

  const { approve: approveBaseToken, isSuccess: isApproveBaseTokenSuccess } =
    useApprove({
      token: pool.baseToken,
      amount: amountBaseBN,
      enabled: !isBaseTokenApproved,
    });
  const { approve: approveQuoteToken, isSuccess: isApproveQuoteTokenSuccess } =
    useApprove({
      token: pool.quoteToken,
      amount: amountQuoteBN,
      enabled: !isQuoteTokenApproved,
    });

  const { addLiquidity, isSuccess: isAddLiquiditySuccess } = useAddLiquidity({
    pool,
    amountBase: amountBaseBN,
    amountQuote: amountQuoteBN,
    amountBaseMin: isExactQuote
      ? parseUnits(
          getAmountMin(amountBase, slippage).toString(),
          pool.baseToken.decimals
        )
      : amountBaseBN,
    amountQuoteMin: isExactQuote
      ? amountQuoteBN
      : parseUnits(
          getAmountMin(amountQuote, slippage).toString(),
          pool.quoteToken.decimals
        ),
    nfts: baseNfts,
    enabled: isBaseTokenApproved && isQuoteTokenApproved && hasAmount,
  });

  const estimatedLp = getLpCountForTokens(
    amount,
    pool.baseToken.reserve,
    pool.totalSupply
  );

  const requiresTerms = pool.baseToken.isNft || pool.quoteToken.isNft;

  useEffect(() => {
    if (isApproveBaseTokenSuccess) {
      refetchBaseTokenApproval();
    }
  }, [isApproveBaseTokenSuccess, refetchBaseTokenApproval]);

  useEffect(() => {
    if (isApproveQuoteTokenSuccess) {
      refetchQuoteTokenApproval();
    }
  }, [isApproveQuoteTokenSuccess, refetchQuoteTokenApproval]);

  useEffect(() => {
    if (isAddLiquiditySuccess) {
      setTrade({
        amount: "0",
        baseNfts: [],
        quoteNfts: [],
        isExactQuote: false,
      });
      refetchBaseTokenBalance();
      refetchQuoteTokenBalance();
      onSuccess?.();
    }
  }, [
    isAddLiquiditySuccess,
    refetchBaseTokenBalance,
    refetchQuoteTokenBalance,
    onSuccess,
  ]);

  return (
    <div className="space-y-4">
      <Dialog open>
        <SelectionPopup
          type="inventory"
          token={selectingToken}
          selectedTokens={
            selectingToken?.id === pool.baseToken.id ? baseNfts : quoteNfts
          }
          onSubmit={(tokens) =>
            setTrade({
              amount: tokens.length.toString(),
              baseNfts: selectingToken?.id === pool.baseToken.id ? tokens : [],
              quoteNfts:
                selectingToken?.id === pool.quoteToken.id ? tokens : [],
              isExactQuote: false,
            })
          }
        />
        {pool.baseToken.isNft ? (
          <PoolNftTokenInput
            token={pool.baseToken}
            balance="0"
            selectedNfts={baseNfts}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.baseToken}
            balance={baseTokenBalance?.formatted}
            amount={amountBase}
            onUpdateAmount={(amount) =>
              setTrade({
                amount,
                baseNfts: [],
                quoteNfts: [],
                isExactQuote: false,
              })
            }
          />
        )}
        {pool.quoteToken.isNft ? (
          <PoolNftTokenInput
            token={pool.quoteToken}
            balance="0"
            selectedNfts={quoteNfts}
            onOpenSelect={setSelectingToken}
          />
        ) : (
          <PoolTokenInput
            token={pool.quoteToken}
            balance={quoteTokenBalance?.formatted}
            amount={amountQuote}
            onUpdateAmount={(amount) =>
              setTrade({
                amount,
                baseNfts: [],
                quoteNfts: [],
                isExactQuote: true,
              })
            }
          />
        )}
      </Dialog>
      <Table
        items={[
          {
            label: "Estimated LP Tokens",
            icon: {
              token0: pool.baseToken.image,
              token1: pool.quoteToken.image,
            },
            value: formatBalance(estimatedLp),
          },
          {
            label: "Share of Pool",
            value: formatPercent(
              pool.totalSupply > 0
                ? Number(estimatedLp) / (pool.totalSupply + Number(estimatedLp))
                : 0
            ),
          },
        ]}
      />
      {requiresTerms && (
        <LabeledCheckbox
          onCheckedChange={(checked) => setCheckedTerms(Boolean(checked))}
          checked={checkedTerms}
          className="sm:p-4"
          id="terms"
          description="I understand there is a chance I am not be able to withdrawal and
          receive the asset I deposited. If the asset deposited in the pool is
          no longer available, I am ok receiving another asset from the
          collection."
        >
          Accept terms and conditions
        </LabeledCheckbox>
      )}
      {!isBaseTokenApproved && (
        <Button className="w-full" onClick={() => approveBaseToken?.()}>
          Approve {pool.baseToken.name}
        </Button>
      )}
      {!isQuoteTokenApproved && (
        <Button className="w-full" onClick={() => approveQuoteToken?.()}>
          Approve {pool.quoteToken.name}
        </Button>
      )}
      <Button
        className="w-full"
        disabled={
          !address ||
          !hasAmount ||
          !isBaseTokenApproved ||
          !isQuoteTokenApproved ||
          (requiresTerms && !checkedTerms)
        }
        onClick={() => addLiquidity?.()}
      >
        Add Liquidity
      </Button>
    </div>
  );
};

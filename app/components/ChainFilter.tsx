import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useChains } from "wagmi";

import { Button } from "~/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/Dropdown";
import { ChainIcon } from "./ChainIcon";

type Props = {
  selectedChainId?: number;
  onChange: (chainId: number) => void;
  onClear: () => void;
};

export const ChainFilter = ({ selectedChainId, onChange, onClear }: Props) => {
  const chains = useChains();
  const selectedChain = selectedChainId
    ? chains.find((chain) => chain.id === selectedChainId)
    : undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="flex items-center gap-1.5 border border-night-900 bg-night-1100"
        >
          {selectedChain ? (
            <>
              <ChainIcon chainId={selectedChain.id} />
              {selectedChain.name}
            </>
          ) : (
            "All Networks"
          )}
          <ChevronDownIcon className="h-3.5 w-3.5 text-night-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 font-medium text-white"
            onClick={onClear}
          >
            All Networks
            {!selectedChain ? <CheckIcon className="h-4 w-4" /> : null}
          </button>
        </DropdownMenuItem>
        {chains.map((chain) => (
          <DropdownMenuItem key={chain.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 font-medium text-white"
              onClick={() => onChange(chain.id)}
            >
              <span className="flex items-center gap-2">
                <ChainIcon chainId={chain.id} />
                {chain.name}
              </span>
              {chain.id === selectedChainId ? (
                <CheckIcon className="h-4 w-4" />
              ) : null}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

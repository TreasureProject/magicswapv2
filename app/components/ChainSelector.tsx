import { ChainIcon } from "connectkit";
import { useChainId, useSwitchChain } from "wagmi";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/Dropdown";

export const ChainSelector = () => {
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const selectedChain = chains.find((chain) => chain.id === chainId);

  if (!selectedChain) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="bg-transparent">
          <ChainIcon id={selectedChain.id} unsupported={false} size="20px" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {chains.map((chain) => (
          <DropdownMenuItem key={chain.id}>
            <Button
              variant="ghost"
              size="xs"
              className="space-x-2"
              onClick={() => switchChain({ chainId: chain.id })}
            >
              <ChainIcon id={chain.id} size="20px" unsupported={false} />
              <span>{chain.name}</span>
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

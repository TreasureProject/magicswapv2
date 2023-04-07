import { ArrowDown, Settings } from "lucide-react";
import { Container } from "~/components/Container";
import { formatUSD } from "~/lib/currency";
import { Button } from "~/components/Button";

export default function SwapPage() {
  return (
    <Container>
      <div className="mx-auto mt-48 flex max-w-2xl flex-col">
        <div className="flex justify-between px-1">
          <p className="text-xl font-bold text-honey-25">Swap</p>
          <Settings className="h-6 w-6 text-night-700" />
        </div>
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-md bg-[#131D2E]">
            <div className="p-2 sm:p-4 2xl:p-6">
              <label htmlFor="token" className="sr-only">
                Token
              </label>
              <div className="relative focus-within:border-ruby-600">
                <div className="absolute bottom-0 left-0 flex items-center space-x-3 pr-3">
                  <img
                    src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/network/arbitrum/0x539bdE0d7Dbd336b79148AA742883198BBF60342.jpg"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="relative flex items-center space-x-1">
                      <p className="font-semibold text-honey-25 sm:text-xl">
                        Magic
                      </p>
                    </div>
                    <span
                      className="cursor-pointer text-sm text-night-400"
                      // onClick={() => onChange(balance)}
                    >
                      {/* Balance: {formatNumber(balance)} */}
                      MAGIC
                    </span>
                  </div>
                </div>
                <input
                  id="token"
                  type="text"
                  className="block w-full border-0 border-transparent bg-transparent pb-6 pl-32 text-right text-honey-25 focus:ring-0 sm:text-lg lg:text-2xl"
                  placeholder="0.00"
                  // value={inputValue}
                  // onChange={handleChange}
                />
                <div className="pointer-events-none absolute bottom-1 right-0 flex flex-col items-end pl-3">
                  <span className="text-sm text-night-400">
                    ~ {formatUSD(100000)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4 bg-night-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs text-night-400 sm:text-sm">
                    Balance
                  </span>
                  <span className="text-sm font-semibold text-honey-25 sm:text-sm">
                    24,233
                  </span>
                </div>
                <Button mode="secondary">Max</Button>
              </div>
            </div>
          </div>
          <div className="relative z-10 -my-2 mx-auto w-max rounded-lg border-4 border-night-1000 bg-night-900 p-2">
            <ArrowDown className="h-6 w-6" />
          </div>
          <div className="relative overflow-hidden rounded-md bg-[#131D2E]">
            <div className="p-2 sm:p-4 2xl:p-6">
              <label htmlFor="token" className="sr-only">
                Token
              </label>
              <div className="relative focus-within:border-ruby-600">
                <div className="absolute bottom-0 left-0 flex items-center space-x-3 pr-3">
                  <img
                    src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/network/arbitrum/0x539bdE0d7Dbd336b79148AA742883198BBF60342.jpg"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="relative flex items-center space-x-1">
                      <p className="font-semibold text-honey-25 sm:text-xl">
                        Magic
                      </p>
                    </div>
                    <span
                      className="cursor-pointer text-sm text-night-400"
                      // onClick={() => onChange(balance)}
                    >
                      {/* Balance: {formatNumber(balance)} */}
                      MAGIC
                    </span>
                  </div>
                </div>
                <input
                  id="token"
                  type="text"
                  className="block w-full border-0 border-transparent bg-transparent pb-6 pl-32 text-right text-honey-25 focus:ring-0 sm:text-lg lg:text-2xl"
                  placeholder="0.00"
                  // value={inputValue}
                  // onChange={handleChange}
                />
                <div className="pointer-events-none absolute bottom-1 right-0 flex flex-col items-end pl-3">
                  <span className="text-sm text-night-400">
                    ~ {formatUSD(100000)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4 bg-night-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs text-night-400 sm:text-sm">
                    Balance
                  </span>
                  <span className="text-sm font-semibold text-honey-25 sm:text-sm">
                    24,233
                  </span>
                </div>
                <Button mode="secondary">Max</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

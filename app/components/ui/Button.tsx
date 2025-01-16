import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { ConnectKitButton, useIsMounted, useModal } from "connectkit";
import { XIcon } from "lucide-react";
import * as React from "react";
import { useSwitchChain } from "wagmi";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        dark: "bg-accent text-accent-foreground hover:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost:
          "hover:bg-accent text-accent-foreground hover:text-accent-foreground/90",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        default: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const CloseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-night-900 text-night-600 transition-colors hover:bg-ruby-800 hover:text-night-100"
        {...props}
      >
        <XIcon className="w-4" />
      </button>
    );
  },
);

CloseButton.displayName = "CloseButton";

export const TransactionButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    chainId?: number;
  }
>(({ chainId, children, disabled, onClick, ...props }, ref) => {
  const isMounted = useIsMounted();
  const { openSwitchNetworks } = useModal();

  const { switchChainAsync } = useSwitchChain();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, chain, show }) => {
        const unsupportedChain = chain?.unsupported ?? false;
        const wrongChain = !!chainId && chain?.id !== chainId;
        const isDisabled = disabled && isConnected;

        const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (
          e,
        ) => {
          if (isConnected) {
            if (wrongChain) {
              await switchChainAsync({ chainId });
              onClick?.(e);
            } else if (unsupportedChain) {
              openSwitchNetworks();
            } else {
              onClick?.(e);
            }
          } else {
            show?.();
          }
        };

        return isMounted ? (
          <Button
            ref={ref}
            disabled={isDisabled}
            onClick={handleClick}
            {...props}
          >
            {isConnected
              ? unsupportedChain
                ? "Switch Network"
                : children
              : "Connect Wallet"}
          </Button>
        ) : null;
      }}
    </ConnectKitButton.Custom>
  );
});

TransactionButton.displayName = "TransactionButton";

export { Button };

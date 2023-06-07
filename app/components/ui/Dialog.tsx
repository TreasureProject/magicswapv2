import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { MotionProps } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "./Button";
import { cn } from "~/lib/utils";

const DialogMotionContent = motion(DialogPrimitive.Content);

const DialogMotionOverlay = motion(DialogPrimitive.Overlay);

const DialogContext = React.createContext<{ open: boolean }>({
  open: false,
});

const Dialog = ({
  onOpenChange,
  children,
  ...props
}: DialogPrimitive.DialogProps) => {
  const [open, setOpen] = React.useState(props.defaultOpen ?? false);
  return (
    <DialogPrimitive.Root onOpenChange={setOpen} {...props}>
      <DialogContext.Provider value={{ open }}>
        {children}
      </DialogContext.Provider>
    </DialogPrimitive.Root>
  );
};

const DialogTrigger = DialogPrimitive.Trigger;

export const DialogPortal = ({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center sm:items-center",
        className
      )}
    >
      {children}
    </div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & MotionProps
>(({ className, ...props }, ref) => (
  <DialogMotionOverlay
    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
    animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
    exit={{
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: { duration: 0.1 },
    }}
    transition={{ duration: 0.2 }}
    className={cn("fixed inset-0 z-50 bg-background/80", className)}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & MotionProps
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(DialogContext);

  return (
    <AnimatePresence>
      {open ? (
        <DialogPortal forceMount>
          <DialogOverlay />
          <DialogMotionContent
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 grid w-full gap-4 rounded-none rounded-b-lg border border-none bg-background bg-transparent p-6 shadow-none sm:max-w-lg sm:rounded-lg",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                className="absolute right-6 top-6 h-8 rounded-full px-2"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          </DialogMotionContent>
        </DialogPortal>
      ) : null}
    </AnimatePresence>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-honey-25",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

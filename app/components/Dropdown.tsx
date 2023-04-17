import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "~/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HamburgerIcon } from "~/components/HamburgerIcon";
import { cn } from "~/lib/utils";

// Dropdowns tabs can be used as both navigatio link and buttons
// Navigation links need href defined
// Buttons need onClick defined

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
  tabs: {
    name: string;
    href?: string;
    content: string | React.ReactNode;
    onClick?: () => void;
  }[];
}

interface AnimatedDropdownProps {
  children: React.ReactNode;
  className?: string;
  show: boolean;
}

interface HamburgerProps {
  children: React.ReactNode;
  className?: string;
}

interface IconDropdownProps {
  children: React.ReactNode;
  className?: string;
  Icon: React.ElementType;
}

export const AnimatedDropdown = ({
  children,
  show,
  className,
}: AnimatedDropdownProps) => (
  <AnimatePresence>
    {show && (
      <div className="absolute right-0 z-40 min-w-full pt-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "w-full rounded-lg border border-night-800 bg-night-1100 p-2 text-night-400",
            className && className
          )}
        >
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const Dropdown = ({ children, className, tabs }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        className={twMerge(
          "text-md flex cursor-pointer items-center gap-3 rounded-md bg-night-900 p-2 font-medium leading-[160%] transition-colors hover:bg-night-800",
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2"> {children}</div>
        <ChevronDownIcon
          className={twMerge(
            "w-6 text-night-400 transition-all",
            open && "-rotate-180"
          )}
        />
      </button>
      <AnimatedDropdown show={open}>
        {tabs.map((tab) => (
          <div key={tab.name}>
            {!!tab.onClick && (
              <button
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-night-900"
                onClick={tab.onClick}
              >
                {tab.content}
              </button>
            )}
            {!!tab.href && (
              <Link
                className="flex items-center gap-2 rounded-lg p-2 hover:bg-night-900"
                to={tab.href}
              >
                {tab.content}
              </Link>
            )}
          </div>
        ))}
      </AnimatedDropdown>
    </div>
  );
};

export const HamburgerDropdown = ({ children, className }: HamburgerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <button
      className={twMerge(
        "text-md relative flex cursor-pointer items-center gap-3 font-medium leading-[160%]",
        className
      )}
      onClick={() => setOpen(!open)}
      onMouseLeave={() => setOpen(false)}
    >
      <HamburgerIcon open={open} />
      <AnimatedDropdown show={open} className="p-0">
        {children}
      </AnimatedDropdown>
    </button>
  );
};

export const IconDropdown = ({
  children,
  Icon,
  className,
}: IconDropdownProps) => {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="relative"
      onClick={() => setOpen(!open)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="group cursor-pointer rounded-md p-2 transition-colors hover:bg-night-1000">
        <Icon className="h-5 w-5 text-night-600 group-hover:text-night-100" />
      </div>
      <AnimatedDropdown show={open}>{children}</AnimatedDropdown>
    </button>
  );
};

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "~/assets/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HamburgerIcon } from "~/components/HamburgerIcon";

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

export const Dropdown = ({ children, className, tabs }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        className={twMerge(
          "text-md flex cursor-pointer items-center gap-3 rounded-md bg-base-900 p-2 font-medium leading-[160%] transition-colors hover:bg-base-800",
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2"> {children}</div>
        <ChevronDownIcon
          className={twMerge(
            "w-6 text-base-400 transition-all",
            open && "-rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <div className="absolute right-0 z-40 w-full pt-3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full rounded-lg border border-base-800 bg-base-1100 p-2 text-base-400"
            >
              {tabs.map((tab) => (
                <div key={tab.name}>
                  {!!tab.onClick && (
                    <button
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
                      onClick={tab.onClick}
                    >
                      {tab.content}
                    </button>
                  )}
                  {!!tab.href && (
                    <Link
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-base-900"
                      to={tab.href}
                    >
                      {tab.content}
                    </Link>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface HamburgerProps {
  children: React.ReactNode;
  className?: string;
}

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
      <AnimatePresence>
        {open && (
          <div className="absolute right-0 z-40 pt-3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-base-800 bg-base-1100 text-base-400"
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </button>
  );
};

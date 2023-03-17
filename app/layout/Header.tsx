import Logo from "~/assets/logo.webp";
import { toast } from "sonner";
import { NavLink } from "@remix-run/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "~/utils/lib";

export const Header = () => {
  return (
    <nav className="bg-steel-1000 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <NavLink to="/">
              <img className="h-8 w-auto shrink-0" src={Logo} alt="MagicSwap" />
            </NavLink>
            <div className="hidden sm:flex sm:gap-4">
              {[
                { name: "Swap", href: "/" },
                { name: "Pools", href: "/pools" },
              ].map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center rounded-md px-2.5 py-2 text-sm font-medium text-steel-100 transition-colors hover:bg-steel-800 hover:text-steel-50",
                      isActive && "bg-steel-800 text-white hover:text-white"
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          <ConnectButton
            showBalance={{ smallScreen: false, largeScreen: false }}
          />
          <div className="-mr-2 flex items-center text-white sm:hidden">
            Mobile menu here
            <button onClick={() => toast.success("success")}>toats</button>
          </div>
        </div>
      </div>
    </nav>
  );
};
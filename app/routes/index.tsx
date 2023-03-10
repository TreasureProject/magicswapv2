import Logo from "~/assets/logo.webp";
import { toast } from "sonner";

export default function Example() {
  return (
    <>
      <div className="flex min-h-full flex-col">
        <nav className="bg-[#0D1420] shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <img className="h-8 w-auto" src={Logo} alt="Your Company" />
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {[
                    { name: "test", href: "#" },
                    { name: "navigation", href: "#" },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button type="button" className="rounded-full p-1 text-white">
                  Chains
                </button>
                <button
                  type="button"
                  className="ml-3 rounded-full p-1 text-white"
                >
                  Profile
                </button>
              </div>
              <div className="-mr-2 flex items-center text-white sm:hidden">
                Mobile menu here
                <button onClick={() => toast.success("success")}>toats</button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex flex-1 pt-28 pb-10">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Your content */}
            <button
              className="border border-white font-bold text-white"
              onClick={() => toast.success("testing123")}
            >
              testing 123
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

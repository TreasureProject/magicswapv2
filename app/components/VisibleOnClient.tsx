import { ClientOnly } from "remix-utils";

import { LoaderIcon } from "./Icons";

export const VisibleOnClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ClientOnly fallback={<LoaderIcon className="inline-block h-3.5 w-3.5" />}>
      {() => children}
    </ClientOnly>
  );
};

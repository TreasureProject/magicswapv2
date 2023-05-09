import { LoaderIcon } from "lucide-react";
import { ClientOnly } from "remix-utils";

export const VisibleOnClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ClientOnly fallback={<LoaderIcon className="h-3.5 w-3.5" />}>
      {() => children}
    </ClientOnly>
  );
};

import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import "~/polyfills";

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      // <StrictMode>
      <HydratedRouter />,
      {
        /* </StrictMode>, */
      },
    );
  });
}

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1);
}

import { useEffect, useState } from "react";

// custom hook to bypass hydration errors when using synchronous storage like localStorage
// https://github.com/pmndrs/zustand/issues/938#issuecomment-1481801942
export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

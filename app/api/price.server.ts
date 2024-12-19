export const fetchMagicUsd = async () => {
  const response = await fetch("https://api.treasure.lol/magic/price");
  const result = (await response.json()) as {
    magicUsd: number;
  };
  return result.magicUsd;
};

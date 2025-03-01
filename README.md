# Magicswap v2 UI

> A novel permissionless AMM with universal token compatibility tailored for games.

[Magicswap](https://magicswap.lol) is a permissionless AMM that provides universal token compatibility and allows users to pool any kind of NFT together and trade them like you would on AMMs like Uniswap. Users never touch underlying vault tokens, and handle only NFTs directly, simplifying the whole experience. Users can create pools for any combination of ERC-20s, ERC-721s, and ERC-1155s. Pools can include multiple vault token types and are compatible with new token standards in the future.

Built for and governed by the [Treasure ecosystem](https://treasure.lol).

Supporting repositories:

- [Smart Contracts](https://github.com/TreasureProject/magicswapv2-contracts)
- [Backend API](https://github.com/TreasureProject/magicswap-api)

## Local Development

Check out the repo and install dependencies in the root folder:

```sh
pnpm install
```

Create environment variable file:

```sh
cp .env.sample .env
```

Fill in relevant environment variables and run code generation:

```sh
pnpm generate
```

Start application:

```sh
pnpm dev
```

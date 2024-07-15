# Magicswap v2 UI

[Magicswap](https://magicswap.lol) is the automated market maker of the [Treasure ecosystem](https://treasure.lol).

Supporting repositories:

- [Smart contracts](https://github.com/TreasureProject/magicswapv2-contracts)
- [Subgraph](https://github.com/TreasureProject/treasure-subgraphs/tree/master/subgraphs/magicswapv2)

## Tech Stack

- [Remix](https://remix.run)
- [Tailwind CSS](https://tailwindcss.com)
- [Graph Client Tools](https://github.com/graphprotocol/graph-client)
- [wagmi](https://wagmi.sh)
- [shadcdn/ui](https://ui.shadcn.com/docs)
- Deployment on [fly.io](https://fly.io)

## Local Development

Check out the repo and install dependencies in the root folder:

```sh
npm install
```

Create environment variable file:

```sh
cp .env.sample .env
```

Fill in relevant environment variables and run code generation:

```sh
npm run generate
```

Start application:

```sh
npm run dev
```

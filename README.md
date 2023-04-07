# MagicSwap

Automated market maker with universal token compatibility

## Tech Stack

- [Remix](https://remix.run)
- [Tailwind CSS](https://tailwindcss.com)
- [Graph Client Tools](https://github.com/graphprotocol/graph-client)
- [wagmi](https://wagmi.sh)
- Deployment on [fly.io](https://fly.io)
- UI Components by https://ui.shadcn.com/docs

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
npm run codegen
```

Start application:

```sh
npm run dev
```

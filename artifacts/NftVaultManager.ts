export const nftVaultManagerAbi = [
  {
    type: "function",
    name: "depositBatch",
    inputs: [
      { name: "_vault", type: "address", internalType: "address" },
      { name: "_collections", type: "address[]", internalType: "address[]" },
      { name: "_tokenIds", type: "uint256[]", internalType: "uint256[]" },
      { name: "_amounts", type: "uint256[]", internalType: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawBatch",
    inputs: [
      { name: "_vault", type: "address", internalType: "address" },
      { name: "_collections", type: "address[]", internalType: "address[]" },
      { name: "_tokenIds", type: "uint256[]", internalType: "uint256[]" },
      { name: "_amounts", type: "uint256[]", internalType: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

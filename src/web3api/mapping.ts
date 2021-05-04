import {
  Pair as UniPair,
  TokenAmount as UniTokenAmount
} from "@uniswap/sdk";
import {
  Pair as W3Pair,
  TokenAmount as W3TokenAmount
} from "./types";

export function mapPairs(input: UniPair[]): W3Pair[] {
  return input.map(mapPair);
}

export function mapPair(input: UniPair): W3Pair {
  return {
    tokenAmount0: mapTokenAmount(input.reserve0),
    tokenAmount1: mapTokenAmount(input.reserve1)
  };
}

export function mapTokenAmount(input: UniTokenAmount): W3TokenAmount {
  return {
    token: mapToken(input.token),
    amount: input.toExact()
  };
}

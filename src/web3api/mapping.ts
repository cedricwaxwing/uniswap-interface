import {
  Pair as UniPair,
  TokenAmount as UniTokenAmount,
  Token as UniToken,
  Currency as UniCurrency
} from '@uniswap/sdk'
import { Pair as W3Pair, TokenAmount as W3TokenAmount, Token as W3Token, Currency as W3Currency } from './types'

export function mapCurrency(input: UniCurrency): W3Currency {
  return {
    decimals: input.decimals,
    symbol: input.symbol,
    name: input.name
  }
}

export function mapToken(input: UniToken): W3Token {
  return {
    chainId: input.chainId,
    address: input.address,
    currency: mapCurrency(input)
  }
}

export function mapTokenAmount(input: UniTokenAmount): W3TokenAmount {
  return {
    token: mapToken(input.token),
    amount: input.toExact()
  }
}

export function mapPair(input: UniPair): W3Pair {
  return {
    tokenAmount0: mapTokenAmount(input.reserve0),
    tokenAmount1: mapTokenAmount(input.reserve1)
  }
}

export function mapPairs(input: UniPair[]): W3Pair[] {
  return input.map(mapPair)
}

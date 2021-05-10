import {
  ChainId as UniChainId,
  Currency as UniCurrency,
  CurrencyAmount as UniCurrencyAmount,
  Pair as UniPair,
  Route as UniRoute,
  Token as UniToken,
  TokenAmount as UniTokenAmount,
  Trade as UniTrade,
  TradeType as UniTradeType
} from '@uniswap/sdk'
import { W3ChainId, W3Currency, W3Pair, W3Route, W3Token, W3TokenAmount, W3Trade, W3TradeType } from './types'
import { isEther } from './utils'

export function mapChainId(input: UniChainId): W3ChainId {
  switch (input) {
    case UniChainId.MAINNET:
      return W3ChainId.MAINNET
    case UniChainId.ROPSTEN:
      return W3ChainId.ROPSTEN
    case UniChainId.RINKEBY:
      return W3ChainId.RINKEBY
    case UniChainId.GÖRLI:
      return W3ChainId.GÖRLI
    case UniChainId.KOVAN:
      return W3ChainId.KOVAN
    default:
      throw new Error('Unknown chain ID. This should never happen.')
  }
}

export function mapCurrency(input: UniCurrency): W3Currency {
  return {
    decimals: input.decimals,
    symbol: input.symbol,
    name: input.name
  }
}

export function mapCurrencyAmount(input: UniCurrencyAmount): W3TokenAmount {
  return {
    token: {
      chainId: undefined,
      address: '',
      currency: mapCurrency(input.currency)
    },
    amount: input.numerator.toString()
  }
}

export function mapToken(input: UniToken | UniCurrency): W3Token {
  if (input instanceof UniToken) {
    return {
      chainId: mapChainId(input.chainId),
      address: input.address,
      currency: mapCurrency(input)
    }
  }
  return {
    chainId: W3ChainId.MAINNET,
    address: '',
    currency: mapCurrency(input)
  }
}

export function mapTokenAmount(input?: UniTokenAmount | UniCurrencyAmount): W3TokenAmount | undefined {
  if (!input) return undefined
  if (input instanceof UniTokenAmount) {
    return {
      token: mapToken(input.token),
      amount: input.numerator.toString()
    }
  }
  return {
    token: mapToken(input.currency),
    amount: input.numerator.toString()
  }
}

export function mapPair(input: UniPair): W3Pair {
  return {
    tokenAmount0: mapTokenAmount(input.reserve0)!,
    tokenAmount1: mapTokenAmount(input.reserve1)!
  }
}

export function mapPairs(input: UniPair[]): W3Pair[] {
  return input.map(mapPair)
}

export function mapRoute(input: UniRoute): W3Route {
  return {
    path: input.path.map(mapToken),
    pairs: input.pairs.map(mapPair),
    input: mapToken(input.input),
    output: mapToken(input.output)
  }
}

export function mapTradeType(input: UniTradeType): W3TradeType {
  if (input === UniTradeType.EXACT_OUTPUT) {
    return W3TradeType.EXACT_OUTPUT
  }
  return W3TradeType.EXACT_INPUT
}

export function mapTrade(input?: UniTrade): W3Trade | undefined {
  if (!input) return undefined
  return {
    route: mapRoute(input.route),
    inputAmount: mapTokenAmount(input.inputAmount)!,
    outputAmount: mapTokenAmount(input.outputAmount)!,
    tradeType: mapTradeType(input.tradeType)
  }
}

export function reverseMapChainId(input: W3ChainId): UniChainId {
  switch (input) {
    case W3ChainId.MAINNET:
      return UniChainId.MAINNET
    case W3ChainId.ROPSTEN:
      return UniChainId.ROPSTEN
    case W3ChainId.RINKEBY:
      return UniChainId.RINKEBY
    case W3ChainId.GÖRLI:
      return UniChainId.GÖRLI
    case W3ChainId.KOVAN:
      return UniChainId.KOVAN
    default:
      throw new Error('Unknown chain ID. This should never happen.')
  }
}

export function reverseMapToken(input?: W3Token): UniToken | undefined {
  if (!input) return undefined
  if (isEther(input)) return undefined
  return new UniToken(
    reverseMapChainId(input.chainId!),
    input.address,
    input.currency.decimals,
    input.currency.symbol,
    input.currency.name
  )
}

export function reverseMapTokenAmount(input?: W3TokenAmount): UniTokenAmount | undefined {
  if (!input) return undefined
  return new UniTokenAmount(reverseMapToken(input.token)!, input.amount)
}

export function reverseMapPair(input: W3Pair): UniPair {
  return new UniPair(reverseMapTokenAmount(input.tokenAmount0)!, reverseMapTokenAmount(input.tokenAmount1)!)
}

export function reverseMapPairs(input: W3Pair[]): UniPair[] {
  return input.map(reverseMapPair)
}

export function reverseMapRoute(input: W3Route): UniRoute {
  return new UniRoute(reverseMapPairs(input.pairs), reverseMapToken(input.input)!, reverseMapToken(input.output))
}

export function reverseMapTradeType(input: W3TradeType): UniTradeType {
  if (input === W3TradeType.EXACT_OUTPUT) {
    return UniTradeType.EXACT_OUTPUT
  }
  return UniTradeType.EXACT_INPUT
}

export function reverseMapTrade(input: W3Trade): UniTrade {
  return new UniTrade(
    reverseMapRoute(input.route),
    reverseMapTokenAmount(input.inputAmount)!,
    reverseMapTradeType(input.tradeType)
  )
}

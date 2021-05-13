import { W3BestTradeOptions, W3Pair, W3SwapParameters, W3Token, W3TokenAmount, W3Trade, W3TradeOptions } from './types'
import { ipfsUri } from './constants'
import Decimal from 'decimal.js'
import { Web3ApiClient } from '@web3api/client-js'
import { Web3ApiClientManager } from './Web3ApiClientManager'

export async function w3TradeExecutionPrice(trade: W3Trade): Promise<Decimal> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    tradeExecutionPrice: W3TokenAmount
  }>({
    uri: ipfsUri,
    query: `query {
        tradeExecutionPrice(
          trade: $trade
         )
       }`,
    variables: {
      trade: trade
    }
  })
  const result: string | undefined = query.data?.tradeExecutionPrice.amount
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return new Decimal(result)
}

export async function w3bestTradeExactIn(
  allowedPairs: W3Pair[],
  currencyAmountIn: W3TokenAmount,
  currencyOut: W3Token,
  bestTradeOptions: W3BestTradeOptions
): Promise<W3Trade[]> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    bestTradeExactIn: W3Trade[]
  }>({
    uri: ipfsUri,
    query: `query {
        bestTradeExactIn(
          pairs: $pairs
          amountIn: $amountIn
          tokenOut: $tokenOut
          options: $options
         )
       }`,
    variables: {
      pairs: allowedPairs,
      amountIn: currencyAmountIn,
      tokenOut: currencyOut,
      options: bestTradeOptions
    }
  })
  const result: W3Trade[] | undefined = query.data?.bestTradeExactIn
  if (result === undefined) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3bestTradeExactOut(
  allowedPairs: W3Pair[],
  currencyIn: W3Token,
  currencyAmountOut: W3TokenAmount,
  bestTradeOptions: W3BestTradeOptions
): Promise<W3Trade[]> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    bestTradeExactOut: W3Trade[]
  }>({
    uri: ipfsUri,
    query: `query {
        bestTradeExactOut(
          pairs: $pairs
          tokenIn: $tokenIn
          amountOut: $amountOut
          options: $options
         )
       }`,
    variables: {
      pairs: allowedPairs,
      tokenIn: currencyIn,
      amountOut: currencyAmountOut,
      options: bestTradeOptions
    }
  })
  const result: W3Trade[] | undefined = query.data?.bestTradeExactOut
  if (result === undefined) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3TradeMaximumAmountIn(trade: W3Trade, slippageTolerance: string): Promise<W3TokenAmount> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    tradeMaximumAmountIn: W3TokenAmount
  }>({
    uri: ipfsUri,
    query: `query {
        tradeMaximumAmountIn(
          trade: $trade
          slippageTolerance: $slippageTolerance
         )
       }`,
    variables: {
      trade: trade,
      slippageTolerance: slippageTolerance
    }
  })
  const result: W3TokenAmount | undefined = query.data?.tradeMaximumAmountIn
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3TradeMinimumAmountOut(trade: W3Trade, slippageTolerance: string): Promise<W3TokenAmount> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    tradeMinimumAmountOut: W3TokenAmount
  }>({
    uri: ipfsUri,
    query: `query {
        tradeMinimumAmountOut(
          trade: $trade
          slippageTolerance: $slippageTolerance
         )
       }`,
    variables: {
      trade: trade,
      slippageTolerance: slippageTolerance
    }
  })
  const result: W3TokenAmount | undefined = query.data?.tradeMinimumAmountOut
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3SwapCallParameters(trade: W3Trade, tradeOptions: W3TradeOptions): Promise<W3SwapParameters> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    swapCallParameters: W3SwapParameters
  }>({
    uri: ipfsUri,
    query: `query {
        swapCallParameters(
          trade: $trade
          tradeOptions: tradeOptions
         )
       }`,
    variables: {
      trade: trade,
      tradeOptions: tradeOptions
    }
  })
  const result: W3SwapParameters | undefined = query.data?.swapCallParameters
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3TradeSlippage(trade: W3Trade): Promise<Decimal> {
  const client: Web3ApiClient = Web3ApiClientManager.client
  const query = await client.query<{
    tradeSlippage: string
  }>({
    uri: ipfsUri,
    query: `query {
        tradeSlippage(
          trade: $trade
         )
       }`,
    variables: {
      trade: trade
    }
  })
  const result: string | undefined = query.data?.tradeSlippage
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return new Decimal(result)
}

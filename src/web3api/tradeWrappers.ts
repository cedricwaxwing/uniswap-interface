import {
  W3BestTradeOptions,
  W3ChainId,
  W3Pair,
  W3StaticTxResult,
  W3SwapParameters,
  W3Token,
  W3TokenAmount,
  W3Trade,
  W3TradeOptions,
  W3TxOverrides,
  W3TxResponse
} from './types'
import { ensUri } from './constants'
import Decimal from 'decimal.js'
import { Web3ApiClient } from '@web3api/client-js'
import { chainIdToName } from './utils'
// import { useCallback } from 'react'
import { useWeb3ApiQuery } from '@web3api/react'

export async function w3TradeExecutionPrice(client: Web3ApiClient, trade: W3Trade): Promise<Decimal> {
  const query = await client.query<{
    tradeExecutionPrice: string
  }>({
    uri: ensUri,
    query: `query {
        tradeExecutionPrice(
          trade: $trade
         )
       }`,
    variables: {
      trade: trade
    }
  })
  const result: string | undefined = query.data?.tradeExecutionPrice
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
  client: Web3ApiClient,
  allowedPairs: W3Pair[],
  currencyAmountIn: W3TokenAmount,
  currencyOut: W3Token,
  bestTradeOptions: W3BestTradeOptions
): Promise<W3Trade[]> {
  const query = await client.query<{
    bestTradeExactIn: W3Trade[]
  }>({
    uri: ensUri,
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
  client: Web3ApiClient,
  allowedPairs: W3Pair[],
  currencyIn: W3Token,
  currencyAmountOut: W3TokenAmount,
  bestTradeOptions: W3BestTradeOptions
): Promise<W3Trade[]> {
  const query = await client.query<{
    bestTradeExactOut: W3Trade[]
  }>({
    uri: ensUri,
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

export async function w3TradeMaximumAmountIn(
  client: Web3ApiClient,
  trade: W3Trade,
  slippageTolerance: string
): Promise<W3TokenAmount> {
  const query = await client.query<{
    tradeMaximumAmountIn: W3TokenAmount
  }>({
    uri: ensUri,
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

export async function w3TradeMinimumAmountOut(
  client: Web3ApiClient,
  trade: W3Trade,
  slippageTolerance: string
): Promise<W3TokenAmount> {
  const query = await client.query<{
    tradeMinimumAmountOut: W3TokenAmount
  }>({
    uri: ensUri,
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

export async function w3SwapCallParameters(
  client: Web3ApiClient,
  trade: W3Trade,
  tradeOptions: W3TradeOptions
): Promise<W3SwapParameters> {
  const query = await client.query<{
    swapCallParameters: W3SwapParameters
  }>({
    uri: ensUri,
    query: `query {
      swapCallParameters(
        trade: $trade
        tradeOptions: $tradeOptions
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

export async function w3TradeSlippage(client: Web3ApiClient, trade: W3Trade): Promise<Decimal> {
  const query = await client.query<{
    tradeSlippage: string
  }>({
    uri: ensUri,
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

export async function w3ExecCall(
  client: Web3ApiClient,
  parameters: W3SwapParameters,
  chainId: W3ChainId,
  txOverrides?: W3TxOverrides
): Promise<W3TxResponse> {
  console.log('This is being triggered!')
  const query = await client.query<{
    execCall: W3TxResponse
  }>({
    uri: ensUri,
    query: `mutation {
      execCall(
        parameters: $parameters
        chainId: $chainId
        txOverrides: $txOverrides
       )
     }`,
    variables: {
      parameters: parameters,
      chainId: chainIdToName(chainId),
      txOverrides: txOverrides ?? {}
    }
  })
  console.log('Si llega hasta aqui se abre metamask por Dios')
  const result: W3TxResponse | undefined = query.data?.execCall
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export const useEstimateGas = () => {
  const { execute } = useWeb3ApiQuery({
    uri: ensUri,
    query: `query {
      estimateGas(
        parameters: $parameters
        chainId: $chainId
       )
     }`
  })
  const estimateGas = async ({
    parameters,
    chainId
  }: {
    parameters: W3SwapParameters
    chainId: W3ChainId
  }): Promise<string> => {
    console.log({ parameters })
    console.log({ chainId })
    const { data, errors } = await execute({
      parameters,
      chainId: chainIdToName(chainId)
    })
    if (errors) {
      console.log('Error :( -> ', errors)
      throw Error('Error on useEstimateGas')
    }
    console.log('Success!: ', data)

    return data?.estimateGas as string
  }

  return estimateGas
}

export async function w3EstimateGas(
  client: Web3ApiClient,
  parameters: W3SwapParameters,
  chainId: W3ChainId
): Promise<string> {
  console.log('trigerring estimateGas: ')
  const query = await client.query<{
    estimateGas: string
  }>({
    uri: ensUri,
    query: `query {
      estimateGas(
        parameters: $parameters
        chainId: $chainId
       )
     }`,
    variables: {
      parameters: parameters,
      chainId: chainIdToName(chainId)
    }
  })
  const result: string | undefined = query.data?.estimateGas
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3ExecCallStatic(
  client: Web3ApiClient,
  parameters: W3SwapParameters,
  chainId: W3ChainId
): Promise<string> {
  const query = await client.query<{
    execCallStatic: W3StaticTxResult
  }>({
    uri: ensUri,
    query: `query {
        execCallStatic(
          parameters: $parameters
          chainId: $chainId
         )
       }`,
    variables: {
      parameters: parameters,
      chainId: chainIdToName(chainId)
    }
  })
  const result: W3StaticTxResult | undefined = query.data?.execCallStatic
  if (result === undefined) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result.error ? result.result : ''
}

export async function w3Approve(
  client: Web3ApiClient,
  token: W3Token,
  amountToApprove?: string,
  txOverrides?: W3TxOverrides
): Promise<W3TxResponse> {
  const query = await client.query<{
    approve: W3TxResponse
  }>({
    uri: ensUri,
    query: `mutation {
        approve(
          token: $token
          amount: $amount
          txOverrides: $overrides
         )
       }`,
    variables: {
      token: token,
      amount: amountToApprove ?? '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      overrides: txOverrides ?? {}
    }
  })
  const result: W3TxResponse | undefined = query.data?.approve
  if (result === undefined) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

export async function w3PairAddress(client: Web3ApiClient, token0: W3Token, token1: W3Token): Promise<string> {
  const query = await client.query<{
    pairAddress: string
  }>({
    uri: ensUri,
    query: `
      query {
        pairAddress(
          token0: $token0
          token1: $token1
        )
      }
    `,
    variables: {
      token0: token0,
      token1: token1
    }
  })
  const result: string | undefined = query.data?.pairAddress
  if (result === undefined) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return result
}

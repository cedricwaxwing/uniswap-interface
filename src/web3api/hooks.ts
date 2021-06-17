import { W3TokenAmount, W3Trade } from './types'
import Decimal from 'decimal.js'
import { ensUri } from './constants'
import { useWeb3ApiQuery } from '@web3api/react'

export async function useTradeExecutionPrice(trade: W3Trade | undefined): Promise<Decimal | undefined> {
  const { execute } = useWeb3ApiQuery<{
    tradeExecutionPrice: W3TokenAmount
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
  if (!trade) {
    return undefined
  }
  const query = await execute()
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

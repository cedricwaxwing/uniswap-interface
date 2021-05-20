import { W3_ZERO_PERCENT, W3_ONE_HUNDRED_PERCENT, ZERO_PERCENT, ONE_HUNDRED_PERCENT } from '../constants'
import { Trade, Percent, currencyEquals } from '@uniswap/sdk'
import { W3Trade } from '../web3api/types'
import Decimal from 'decimal.js'
import { w3TradeExecutionPrice } from '../web3api/tradeWrappers'
import { currencyEquals as w3currencyEquals } from '../web3api/utils'
import { Web3ApiClient } from '@web3api/client-js'

// TODO: remove
// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export function isTradeBetter(
  tradeA: Trade | undefined | null,
  tradeB: Trade | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error('Trades are not comparable')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  } else {
    return tradeA.executionPrice.raw.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT)).lessThan(tradeB.executionPrice)
  }
}

export async function w3IsTradeBetter(
  client: Web3ApiClient,
  tradeA: W3Trade | undefined | null,
  tradeB: W3Trade | undefined | null,
  minimumDelta: Decimal = W3_ZERO_PERCENT
): Promise<boolean | undefined> {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !w3currencyEquals(tradeA.inputAmount.token.currency, tradeB.inputAmount.token.currency) ||
    !w3currencyEquals(tradeB.outputAmount.token.currency, tradeB.outputAmount.token.currency)
  ) {
    throw new Error('Trades are not comparable')
  }

  const executionPriceA: Decimal = await w3TradeExecutionPrice(client, tradeA)
  const executionPriceB: Decimal = await w3TradeExecutionPrice(client, tradeB)

  if (minimumDelta.equals(W3_ZERO_PERCENT)) {
    return executionPriceA.lessThan(executionPriceB)
  } else {
    return executionPriceA.mul(minimumDelta.add(W3_ONE_HUNDRED_PERCENT)).lessThan(executionPriceB)
  }
}

import {
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  W3ALLOWED_PRICE_IMPACT_HIGH,
  W3ALLOWED_PRICE_IMPACT_LOW,
  W3ALLOWED_PRICE_IMPACT_MEDIUM,
  W3BLOCKED_PRICE_IMPACT_NON_EXPERT
} from '../constants'
import { CurrencyAmount, Fraction, JSBI, Percent, TokenAmount, Trade } from '@uniswap/sdk'
import { ALLOWED_PRICE_IMPACT_HIGH, ALLOWED_PRICE_IMPACT_LOW, ALLOWED_PRICE_IMPACT_MEDIUM } from '../constants'
import { Field } from '../state/swap/actions'
import { basisPointsToPercent, w3BasisPointsToPercent } from './index'
import { W3TokenAmount, W3Trade } from '../web3api/types'
import {
  w3TradeExecutionPrice,
  w3TradeMaximumAmountIn,
  w3TradeMinimumAmountOut,
  w3TradeSlippage
} from '../web3api/tradeWrappers'
import Decimal from 'decimal.js'
import { isEther } from '../web3api/utils'
import { ETHER } from '../web3api/constants'

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

const W3BASE_FEE = new Decimal(30).div(10000)
const W3ONE_HUNDRED_PERCENT = new Decimal(10000).div(10000)
const W3INPUT_FRACTION_AFTER_FEE = W3ONE_HUNDRED_PERCENT.sub(W3BASE_FEE)

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: Trade | null
): { priceImpactWithoutFee: Percent | undefined; realizedLPFee: CurrencyAmount | undefined | null } {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
          ONE_HUNDRED_PERCENT
        )
      )

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient))

  return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

export async function w3computeTradePriceBreakdown(
  trade?: W3Trade | null
): Promise<{ priceImpactWithoutFee: Decimal | undefined; realizedLPFee: W3TokenAmount | undefined | null }> {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : W3ONE_HUNDRED_PERCENT.sub(
        trade.route.pairs.reduce<Decimal>(
          (currentFee: Decimal): Decimal => currentFee.mul(W3INPUT_FRACTION_AFTER_FEE),
          W3ONE_HUNDRED_PERCENT
        )
      )

  // remove lp fees from price impact
  // the x*y=k impact
  const priceImpactWithoutFee = trade && realizedLPFee ? (await w3TradeSlippage(trade)).sub(realizedLPFee) : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (!isEther(trade.inputAmount.token)
      ? {
          token: trade.inputAmount.token,
          amount: realizedLPFee.mul(trade.inputAmount.amount).toFixed(0)
        }
      : {
          token: {
            chainId: trade.inputAmount.token.chainId,
            address: '',
            currency: ETHER
          },
          amount: realizedLPFee.mul(trade.inputAmount.amount).toFixed(0)
        })

  return { priceImpactWithoutFee, realizedLPFee: realizedLPFeeAmount }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct)
  }
}

export async function w3ComputeSlippageAdjustedAmounts(
  trade: W3Trade | undefined,
  allowedSlippage: number
): Promise<{ [field in Field]?: W3TokenAmount }> {
  const pct = w3BasisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade ? await w3TradeMaximumAmountIn(trade, pct.toString()) : undefined,
    [Field.OUTPUT]: trade ? await w3TradeMinimumAmountOut(trade, pct.toString()) : undefined
  }
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

export function w3warningSeverity(priceImpact: Decimal | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(W3BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(W3ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(W3ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(W3ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

export function formatExecutionPrice(trade?: Trade, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
        trade.outputAmount.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
        trade.inputAmount.currency.symbol
      }`
}

export async function w3formatExecutionPrice(trade?: W3Trade, inverted?: boolean): Promise<string> {
  if (!trade) {
    return ''
  }
  const executionPrice = await w3TradeExecutionPrice(trade)
  return inverted
    ? `${new Decimal(1).div(executionPrice).toSignificantDigits(6)} ${trade.inputAmount.token.currency.symbol} / ${
        trade.outputAmount.token.currency.symbol
      }`
    : `${executionPrice.toSignificantDigits(6)} ${trade.outputAmount.token.currency.symbol} / ${
        trade.inputAmount.token.currency.symbol
      }`
}

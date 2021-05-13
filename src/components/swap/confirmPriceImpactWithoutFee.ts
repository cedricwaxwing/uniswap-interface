import Decimal from 'decimal.js'
import { W3ALLOWED_PRICE_IMPACT_HIGH, W3PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '../../constants'

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 */
export default function confirmPriceImpactWithoutFee(priceImpactWithoutFee: Decimal): boolean {
  if (!priceImpactWithoutFee.lessThan(W3PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return (
      window.prompt(
        `This swap has a price impact of at least ${W3PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.mul(100).toFixed(
          0
        )}%. Please type the word "confirm" to continue with this swap.`
      ) === 'confirm'
    )
  } else if (!priceImpactWithoutFee.lessThan(W3ALLOWED_PRICE_IMPACT_HIGH)) {
    return window.confirm(
      `This swap has a price impact of at least ${W3ALLOWED_PRICE_IMPACT_HIGH.mul(100).toFixed(
        0
      )}%. Please confirm that you would like to continue with this swap.`
    )
  }
  return true
}

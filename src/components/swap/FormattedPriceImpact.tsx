import Decimal from 'decimal.js'
import React from 'react'
import { W3ONE_BIPS } from '../../constants'
import { w3warningSeverity } from '../../utils/prices'
import { ErrorText } from './styleds'

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Decimal }) {
  return (
    <ErrorText fontWeight={500} fontSize={14} severity={w3warningSeverity(priceImpact)}>
      {priceImpact ? (priceImpact.lessThan(W3ONE_BIPS) ? '<0.01%' : `${priceImpact.mul(100).toFixed(2)}%`) : '-'}
    </ErrorText>
  )
}

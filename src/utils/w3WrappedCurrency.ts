import { W3ChainId, W3Token, W3TokenAmount } from '../web3api/types'
import { isEther, tokenEquals, WETH } from '../web3api/utils'
import { ETHER } from '../web3api/constants'

export function wrappedCurrency(currency: W3Token | undefined, chainId: W3ChainId | undefined): W3Token | undefined {
  return chainId && isEther(currency) ? WETH(chainId) : currency
}

export function wrappedCurrencyAmount(
  currencyAmount: W3TokenAmount | undefined,
  chainId: W3ChainId | undefined
): W3TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.token, chainId) : undefined
  return token && currencyAmount ? { token, amount: currencyAmount.amount } : undefined
}

export function unwrappedToken(token: W3Token): W3Token {
  if (isEther(token) || tokenEquals(token, WETH(token.chainId!))) {
    return {
      chainId: token.chainId,
      address: '',
      currency: ETHER
    }
  }
  return token
}

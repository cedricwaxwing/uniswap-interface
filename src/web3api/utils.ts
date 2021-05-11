import { W3ChainId, W3Currency, W3Token } from './types'
import { ETHER } from './constants'

export function isEther(token: W3Token | undefined): boolean {
  if (!token) return false
  return (
    token.currency.symbol === ETHER.symbol &&
    token.currency.name === ETHER.name &&
    token.currency.decimals === ETHER.decimals
  )
}

export function tokenEquals(tokenA: W3Token, tokenB: W3Token): boolean {
  return tokenA.chainId === tokenB.chainId && tokenA.address === tokenB.address
}

export function currencyEquals(currencyA: W3Currency, currencyB: W3Currency): boolean {
  return (
    currencyA.symbol === currencyB.symbol &&
    currencyA.name === currencyB.name &&
    currencyA.decimals === currencyB.decimals
  )
}

export function WETH(chainId: W3ChainId): W3Token {
  switch (chainId) {
    case W3ChainId.MAINNET:
      return {
        chainId: W3ChainId.MAINNET,
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        currency: {
          decimals: 18,
          symbol: 'WETH9',
          name: 'Wrapped Ether'
        }
      }
    case W3ChainId.ROPSTEN:
      return {
        chainId: W3ChainId.ROPSTEN,
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        currency: {
          decimals: 18,
          symbol: 'WETH9',
          name: 'Wrapped Ether'
        }
      }
    case W3ChainId.RINKEBY:
      return {
        chainId: W3ChainId.RINKEBY,
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        currency: {
          decimals: 18,
          symbol: 'WETH9',
          name: 'Wrapped Ether'
        }
      }
    case W3ChainId.GÖRLI:
      return {
        chainId: W3ChainId.GÖRLI,
        address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        currency: {
          decimals: 18,
          symbol: 'WETH9',
          name: 'Wrapped Ether'
        }
      }
    case W3ChainId.KOVAN:
      return {
        chainId: W3ChainId.KOVAN,
        address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
        currency: {
          decimals: 18,
          symbol: 'WETH9',
          name: 'Wrapped Ether'
        }
      }
    default:
      throw new Error('Unknown chain ID. This should never happen.')
  }
}

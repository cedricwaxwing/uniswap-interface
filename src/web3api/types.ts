// NOTE: this should be auto-generated in the future

export interface Query {
  bestTradeExactIn(pairs: W3Pair[], amountIn: W3TokenAmount, tokenOut: W3Token, options: W3BestTradeOptions): W3Trade[]
}

export enum W3ChainId {
  MAINNET = 'MAINNET',
  ROPSTEN = 'ROPSTEN',
  RINKEBY = 'RINKEBY',
  GÖRLI = 'GOERLI',
  KOVAN = 'KOVAN'
}

export enum W3TradeType {
  EXACT_INPUT = 'EXACT_INPUT',
  EXACT_OUTPUT = 'EXACT_OUTPUT'
}

export interface W3Pair {
  tokenAmount0: W3TokenAmount
  tokenAmount1: W3TokenAmount
}

export interface W3TokenAmount {
  token: W3Token
  amount: string
}

export interface W3Token {
  chainId?: W3ChainId
  address: string
  currency: W3Currency
}

export interface W3Trade {
  route: W3Route
  inputAmount: W3TokenAmount
  outputAmount: W3TokenAmount
  tradeType: W3TradeType
}

export interface W3Currency {
  decimals: number
  symbol?: string
  name?: string
}

export interface W3Route {
  path: W3Token[]
  pairs: W3Pair[]
  input: W3Token
  output: W3Token
}

export interface W3BestTradeOptions {
  maxNumResults?: number
  maxHops?: number
}

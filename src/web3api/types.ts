// NOTE: this should be auto-generated in the future

export interface Query {
  bestTradeExactIn(
    pairs: Pair[],
    amountIn: TokenAmount,
    tokenOut: Token,
    options: BestTradeOptions
  ): Trade[];
}

export enum ChainId {
  MAINNET,
  ROPSTEN,
  RINKEBY,
  GOERLI,
  KOVAN,
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export interface Pair {
  tokenAmount0: TokenAmount;
  tokenAmount1: TokenAmount;
}

export interface TokenAmount {
  token: Token;
  amount: string;
}

export interface Token {
  chainId: ChainId;
  address: string;
  currency: Currency;
}

export interface BestTradeOptions {

}

export interface Trade {
  route: Route;
  inputAmount: TokenAmount;
  outputAmount: TokenAmount;
  tradeType: TradeType;
}

export interface Currency {
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface Route {
  path: Token[];
  pairs: Pair[];
  input: Token;
  output: Token;
}

export interface BestTradeOptions {
  maxNumResults?: number;
  maxHops?: number;
}

import { useMemo } from 'react'
import { INITIAL_ALLOWED_SLIPPAGE, W3BIPS_BASE } from '../constants'
import { useW3TransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin, isAddress, shortenAddress } from '../utils'
import { useActiveWeb3React } from './index'
import useTransactionDeadline from './useTransactionDeadline'
import useENS from './useENS'
import { W3ChainId, W3SwapParameters, W3Trade, W3TradeType /* W3TxResponse */ } from '../web3api/types'
import {
  /* w3EstimateGas, */
  w3ExecCall,
  w3ExecCallStatic,
  w3SwapCallParameters,
  useEstimateGas
} from '../web3api/tradeWrappers'
import Decimal from 'decimal.js'
import { toSignificant } from '../web3api/utils'
import { Web3ApiClient } from '@web3api/client-js'
import { mapChainId } from '../web3api/mapping'
import { BigNumber } from 'ethers'
import { useWeb3ApiClient } from '@web3api/react'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

interface SwapCallAsync {
  chainId: W3ChainId
  parameters: Promise<W3SwapParameters>
}

interface SwapCall {
  chainId: W3ChainId
  parameters: W3SwapParameters
}

interface SuccessfulCall {
  call: SwapCall
  gasEstimate: string
}

interface FailedCall {
  call: SwapCall
  error: Error
}

type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: W3Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCallAsync[] {
  const { account, chainId, library } = useActiveWeb3React()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress
  const deadline = useTransactionDeadline()

  // get web3api client
  const client: Web3ApiClient = useWeb3ApiClient()

  return useMemo(() => {
    if (!trade || !recipient || !library || !account || !chainId || !deadline) return []

    const w3ChainId: W3ChainId = mapChainId(chainId)
    const swapMethods = []

    swapMethods.push(
      w3SwapCallParameters(client, trade, {
        feeOnTransfer: false,
        allowedSlippage: new Decimal(allowedSlippage).div(W3BIPS_BASE).toString(),
        recipient,
        deadline: deadline.toNumber(),
        unixTimestamp: Math.floor(Date.now() / 1000)
      })
    )

    if (trade.tradeType === W3TradeType.EXACT_INPUT) {
      swapMethods.push(
        w3SwapCallParameters(client, trade, {
          feeOnTransfer: true,
          allowedSlippage: new Decimal(allowedSlippage).div(W3BIPS_BASE).toString(),
          recipient,
          deadline: deadline.toNumber(),
          unixTimestamp: Math.floor(Date.now() / 1000)
        })
      )
    }
    return swapMethods.map(parameters => ({ parameters, chainId: w3ChainId }))
  }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, client])
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: W3Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): {
  callParameters?: Promise<W3SwapParameters>
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useActiveWeb3React()
  const estimateG = useEstimateGas()
  const client: Web3ApiClient = useWeb3ApiClient()

  const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipientAddressOrName)

  const addTransaction = useW3TransactionAdder()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      callParameters: swapCalls.length > 0 ? swapCalls[0].parameters : undefined,
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        console.log('callback from use swap callback has been triggered')
        console.log('These are the swap calls: ', swapCalls)

        const getSwapGas = async (callAsync: SwapCallAsync) => {
          const call: SwapCall = {
            parameters: await callAsync.parameters,
            chainId: callAsync.chainId
          }

          console.log('Call: ', call)
          const { parameters, chainId } = call

          try {
            const gasEstimate = await estimateG({ parameters, chainId })
            return {
              call,
              gasEstimate
            }
          } catch (gasError) {
            const callErr = await w3ExecCallStatic(client, parameters, chainId)
            if (!callErr) {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError)
              return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
            }
            console.debug('Call threw error', call, callErr)
            let errorMessage: string
            switch (callErr) {
              case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
              case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
                errorMessage =
                  'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
                break
              default:
                errorMessage = `The transaction cannot succeed due to error: ${callErr}. This is probably an issue with one of the tokens you are swapping.`
            }
            return { call, error: new Error(errorMessage) }
          }

          // return w3EstimateGas(client, parameters, chainId)
          //   .then(gasEstimate => {
          //     console.log('On gas estimation', gasEstimate)
          //     return {
          //       call,
          //       gasEstimate
          //     }
          //   })
          //   .catch(gasError => {
          //     console.debug('Gas estimate failed, trying eth_call to extract error', call)

          //     return w3ExecCallStatic(client, parameters, chainId).then(callError => {
          //       if (!callError) {
          //         console.debug('Unexpected successful call after failed estimate gas', call, gasError)
          //         return { call, error: new Error('Unexpected issue with estimating the gas. Please try again.') }
          //       }
          //       console.debug('Call threw error', call, callError)
          //       let errorMessage: string
          //       switch (callError) {
          //         case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
          //         case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
          //           errorMessage =
          //             'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'
          //           break
          //         default:
          //           errorMessage = `The transaction cannot succeed due to error: ${callError}. This is probably an issue with one of the tokens you are swapping.`
          //       }
          //       return { call, error: new Error(errorMessage) }
          //     })
          //   })
        }
        const estimatedCallsPromises = swapCalls.map(getSwapGas)
        console.log('Estimated promises: ', estimatedCallsPromises)
        const estimatedCalls: EstimatedSwapCall[] = await Promise.all(estimatedCallsPromises)

        console.log('After the estimation of calls: ', estimatedCalls)

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        )

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
          if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
          throw new Error('Unexpected error. Please contact support: none of the calls threw an error')
        }

        const {
          call: { parameters, chainId },
          gasEstimate
        } = successfulEstimation

        const gasMargin = calculateGasMargin(BigNumber.from(gasEstimate))
        console.log('before exec call')

        try {
          const respon = await w3ExecCall(client, parameters, chainId, { gasLimit: gasMargin.toString() })
          const inputSymbol = trade.inputAmount.token.currency.symbol
          const outputSymbol = trade.outputAmount.token.currency.symbol
          const inputAmount = toSignificant(trade.inputAmount, 3)
          const outputAmount = toSignificant(trade.outputAmount, 3)

          const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
          const withRecipient =
            recipient === account
              ? base
              : `${base} to ${
                  recipientAddressOrName && isAddress(recipientAddressOrName)
                    ? shortenAddress(recipientAddressOrName)
                    : recipientAddressOrName
                }`

          addTransaction(respon, {
            summary: withRecipient
          })

          return respon.hash
        } catch (error) {
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.')
          } else {
            // otherwise, the error was unexpected and we need to convey that
            console.error(`Swap failed`, error, parameters.methodName, parameters.args, parameters.value)
            throw new Error(`Swap failed: ${error.message}`)
          }
        }

        //   return w3ExecCall(client, parameters, chainId, { gasLimit: gasMargin.toString() })
        //     .then((response: W3TxResponse) => {
        //       console.log('swap has been achieved')
        //       const inputSymbol = trade.inputAmount.token.currency.symbol
        //       const outputSymbol = trade.outputAmount.token.currency.symbol
        //       const inputAmount = toSignificant(trade.inputAmount, 3)
        //       const outputAmount = toSignificant(trade.outputAmount, 3)

        //       const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
        //       const withRecipient =
        //         recipient === account
        //           ? base
        //           : `${base} to ${
        //               recipientAddressOrName && isAddress(recipientAddressOrName)
        //                 ? shortenAddress(recipientAddressOrName)
        //                 : recipientAddressOrName
        //             }`

        //       addTransaction(response, {
        //         summary: withRecipient
        //       })

        //       return response.hash
        //     })
        //     .catch((error: any) => {
        //       // if the user rejected the tx, pass this along
        //       if (error?.code === 4001) {
        //         throw new Error('Transaction rejected.')
        //       } else {
        //         // otherwise, the error was unexpected and we need to convey that
        //         console.error(`Swap failed`, error, parameters.methodName, parameters.args, parameters.value)
        //         throw new Error(`Swap failed: ${error.message}`)
        //       }
        //     })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, recipientAddressOrName, swapCalls, addTransaction, client])
}

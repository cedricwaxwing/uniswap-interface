import { MaxUint256 } from '@ethersproject/constants'
import { useCallback, useMemo } from 'react'
import { ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { useHasPendingApproval, useW3TransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import { useActiveWeb3React } from './index'
import { W3TokenAmount, W3Trade, W3TxReceipt } from '../web3api/types'
import { isEther } from '../web3api/utils'
import Decimal from 'decimal.js'
import { Web3ApiClient } from '@web3api/client-js'
import { useWeb3ApiClient } from '../web3api/hooks'
import { w3Approve } from '../web3api/tradeWrappers'
import { BigNumber } from 'ethers'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: W3TokenAmount,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  const token = !isEther(amountToApprove?.token) ? amountToApprove?.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // TODO: replace with new client hook
  const client: Web3ApiClient = useWeb3ApiClient()

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (isEther(amountToApprove.token)) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return new Decimal(currentAllowance.amount).lessThan(amountToApprove.amount)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useW3TransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.amount)
    })

    const gasMargin = calculateGasMargin(BigNumber.from(estimatedGas))

    return w3Approve(client, token, useExact ? amountToApprove.amount : undefined, {
      gasLimit: gasMargin.toString(),
      gasPrice: null
    })
      .then((receipt: W3TxReceipt) => {
        addTransaction(receipt, {
          summary: 'Approve ' + amountToApprove.token.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender }
        })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction, client])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: W3Trade, amountToApprove?: W3TokenAmount) {
  return useApproveCallback(amountToApprove, ROUTER_ADDRESS)
}

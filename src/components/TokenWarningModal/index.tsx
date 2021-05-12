import React from 'react'
import Modal from '../Modal'
import { ImportToken } from 'components/SearchModal/ImportToken'
import { W3Token } from '../../web3api/types'

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
  onDismiss
}: {
  isOpen: boolean
  tokens: W3Token[]
  onConfirm: () => void
  onDismiss: () => void
}) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ImportToken tokens={tokens} handleCurrencySelect={onConfirm} />
    </Modal>
  )
}

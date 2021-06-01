import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { network } from '../../connectors'
import { useEagerConnect, useInactiveListener } from '../../hooks'
import { NetworkContextName } from '../../constants'
import Loader from '../Loader'
import { UriRedirect } from '@web3api/client-js'
import { ipfsPlugin } from '@web3api/ipfs-plugin-js'
import { Web3ApiProvider } from '@web3api/react'
import { ethereumPlugin } from '@web3api/ethereum-plugin-js'
import { sha3Plugin } from '@web3api/sha3-plugin-js'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { getSigner } from '../../utils'

const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
`

const Message = styled.h2`
  color: ${({ theme }) => theme.secondary1};
`

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { t } = useTranslation()
  const { active, account, library } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName)

  // Web3API integration.
  const [ethConfig, setEthConfig] = useState<{ provider: Web3Provider; signer: JsonRpcSigner | undefined }>({
    provider: library as Web3Provider,
    signer: account ? getSigner(library, account) : undefined
  })
  const redirects: UriRedirect[] = [
    {
      from: 'ens/ethereum.web3api.eth',
      to: ethereumPlugin({
        networks: {
          MAINNET: {
            provider: ethConfig.provider,
            signer: ethConfig.signer
          },
          RINKEBY: {
            provider: ethConfig.provider,
            signer: ethConfig.signer
          },
          ROPSTEN: {
            provider: ethConfig.provider,
            signer: ethConfig.signer
          },
          KOVAN: {
            provider: ethConfig.provider,
            signer: ethConfig.signer
          },
          GOERLI: {
            provider: ethConfig.provider,
            signer: ethConfig.signer
          }
        },
        defaultNetwork: 'MAINNET'
      })
    },
    {
      from: 'w3://ens/ipfs.web3api.eth',
      to: ipfsPlugin({
        provider: 'https://ipfs.io'
      })
    },
    {
      from: 'w3://ens/sha3.web3api.eth',
      to: sha3Plugin()
    }
  ]

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate it
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network)
    }
    setEthConfig({
      provider: library as Web3Provider,
      signer: account ? getSigner(library, account) : undefined
    })
  }, [triedEager, networkActive, networkError, activateNetwork, active, account, library])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true)
    }, 600)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    return (
      <MessageWrapper>
        <Message>{t('unknownError')}</Message>
      </MessageWrapper>
    )
  }

  // if neither context is active, spin
  if (!active && !networkActive) {
    return showLoader ? (
      <MessageWrapper>
        <Loader />
      </MessageWrapper>
    ) : null
  }

  return <Web3ApiProvider redirects={redirects}>{children}</Web3ApiProvider>
}

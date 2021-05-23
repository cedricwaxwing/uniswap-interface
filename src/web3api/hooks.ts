import { W3TokenAmount, W3Trade } from './types'
import Decimal from 'decimal.js'
import { ipfsUri } from './constants'
import { useWeb3ApiQuery } from '@web3api/react'
import { useState } from 'react'
import { network } from '../connectors'
import { UriRedirect, Web3ApiClient } from '@web3api/client-js'
import { ethereumPlugin } from '@web3api/ethereum-plugin-js'
import { ipfsPlugin } from '@web3api/ipfs-plugin-js'

let client: Web3ApiClient = new Web3ApiClient()

export function useWeb3ApiClient(): Web3ApiClient {
  const [provider, setProvider] = useState<string>(network.provider.url)
  if (provider !== network.provider.url) {
    setProvider(network.provider.url)
    const redirects: UriRedirect[] = [
      {
        from: 'ens/ethereum.web3api.eth',
        to: ethereumPlugin({
          networks: {
            MAINNET: {
              provider: provider
            },
            RINKEBY: {
              provider: provider
            },
            ROPSTEN: {
              provider: provider
            },
            KOVAN: {
              provider: provider
            },
            GOERLI: {
              provider: provider
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
      }
    ]
    client = new Web3ApiClient({ redirects })
  }
  return client
}

export async function useTradeExecutionPrice(trade: W3Trade | undefined): Promise<Decimal | undefined> {
  const { execute } = useWeb3ApiQuery<{
    tradeExecutionPrice: W3TokenAmount
  }>({
    uri: ipfsUri,
    query: `query {
        tradeExecutionPrice(
          trade: $trade
         )
       }`,
    variables: {
      trade: trade
    }
  })
  if (!trade) {
    return undefined
  }
  const query = await execute()
  const result: string | undefined = query.data?.tradeExecutionPrice.amount
  if (!result) {
    if (query.errors) {
      throw Error(query.errors.map(e => e.message).toString())
    } else {
      throw Error('Unknown Web3API query error; query result data is undefined')
    }
  }
  return new Decimal(result)
}

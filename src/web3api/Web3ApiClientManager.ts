import { UriRedirect, Web3ApiClient } from '@web3api/client-js'
import { ethereumPlugin } from '@web3api/ethereum-plugin-js'
import { ipfsPlugin } from '@web3api/ipfs-plugin-js'
import { EthereumProvider } from '@web3api/client-js/build/pluginConfigs/Ethereum'

export class Web3ApiClientManager {
  private static _client: Web3ApiClient
  private static _provider: EthereumProvider

  static get client() {
    if (!this._client) {
      this._client = new Web3ApiClient()
    }
    return this._client
  }

  static get provider(): EthereumProvider {
    return this._provider
  }

  static setProvider(ethereum: EthereumProvider): UriRedirect[] {
    const redirects: UriRedirect[] = [
      {
        from: 'ens/ethereum.web3api.eth',
        to: ethereumPlugin({
          networks: {
            MAINNET: {
              provider: ethereum
            },
            RINKEBY: {
              provider: ethereum
            },
            ROPSTEN: {
              provider: ethereum
            },
            KOVAN: {
              provider: ethereum
            },
            GOERLI: {
              provider: ethereum
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
    if (ethereum === this._provider) {
      return redirects
    }
    this._provider = ethereum
    this._client = new Web3ApiClient({ redirects })
    return redirects
  }
}

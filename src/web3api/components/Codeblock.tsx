import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import Prism from 'prismjs'
import CodeToggle from './CodeToggle'
import { W3Token } from '../types'
import './prism.css'

// Styling for Codeblock component.
export const CodeWrapper = styled.div`
  background: transparent;
  width: 40rem;
  margin-left: 2rem;
  position: relative;
  border-radius: 10px;
  /* padding: 1rem; */
`

interface Props {
  input: string
  currencies: { INPUT?: W3Token | undefined; OUTPUT?: W3Token | undefined }
}

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
const Codeblock = (props: React.PropsWithChildren<Props>) => {
  const { input, currencies } = props
  const [toggle, setToggle] = useState<boolean>(true)

  useEffect(() => {
    setTimeout(() => Prism.highlightAll(), 0)
  })

  const query = `
  Web3Api.query({
      uri: ipfsUri,
      query: \`query {
          bestTradeExactIn(
            pairs: $pairs
            amountIn: $amountIn
            tokenOut: $tokenOut
            options: $options
           )
         }\`,
      variables: {
        pairs: allowedPairs,
        amountIn: currencyAmountIn,
        tokenOut: currencyOut,
        options: bestTradeOptions
      }
    })
  })`.trim()
  const variables = `
  const currencyAmountIn = {
    token: {
      chainId: ${currencies.INPUT?.chainId ? currencies.INPUT.chainId : ''},
      address: '${currencies.INPUT?.address ? currencies.INPUT.address : ''}',
      currency: {
        decimals: ${currencies.INPUT?.currency.decimals},
        symbol: '${currencies.INPUT?.currency.symbol}',
        name: '${currencies.INPUT?.currency.name}'
      }
    },
    amount: ${input}
  }

  const currencyOut = {
    chainId: ${currencies.OUTPUT?.chainId ? currencies.OUTPUT.chainId : ''},
    address: '${currencies.OUTPUT?.address ? currencies.OUTPUT.address : ''}',
    currency: {
        decimals: ${currencies.OUTPUT?.currency.decimals},
        symbol: '${currencies.OUTPUT?.currency.symbol}',
        name: '${currencies.OUTPUT?.currency.name}'
    }
  }
`.trim()

  return (
    <>
      <Flex className="codeBlock">
        <Flex className="codeBlock__toggle">
          <CodeToggle id="toggle-expert-mode-button" isActive={toggle} toggle={() => setToggle(!toggle)} />
        </Flex>
        <CodeWrapper className="codeBlock__code">
          <pre className="line-numbers">
            <code className="language-js">{toggle ? query : variables}</code>
          </pre>
        </CodeWrapper>
      </Flex>
    </>
  )
}

export default Codeblock

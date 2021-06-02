import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import Prism from 'prismjs'
import CodeToggle from './CodeToggle'
import { ButtonLight } from '../../components/Button'
import { W3Token } from '../types'
import './prism.css'
import W3ToolTip from './W3ToolTip'

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
  slippage: number
  recipient: string | null
  output: string
}

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
const Codeblock = (props: React.PropsWithChildren<Props>) => {
  const { input, currencies, slippage, recipient, output } = props
  const [toggle, setToggle] = useState<boolean>(true)

  useEffect(() => {
    setTimeout(() => Prism.highlightAll(), 0)
  })

  const queryA = `
Web3Api.query({
    uri: ipfsUri,
    query: \`query {
      bestTradeExactIn(
        pairs: $pairs,
        amountIn: $amountIn,
        tokenOut: $tokenOut,
        options: $options
      )
    }\`,
    variables
  })`.trim()

  const variablesA = `
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

  const queryB = `
Web3Api.query({
    uri: ipfsUri,
    query: \`query {
      swapCallParameters(
        trade: $trade,
        tradeOptions: $tradeOptions,
      )
    }\`,
    variables
  })`.trim()

  const variablesB = `const trade = {
    route: Route,
    inputAmount: ${input}
    outputAmount: ${output}
  }

  const tradeOptions = {
    allowedSlippage: ${slippage}
    recipient: ${recipient}
    unixTimestamp: ${Date.now()}
  }
  `

  const queryC = `
Web3Api.query({
    uri: ipfsUri,
    query: \`mutation {
      execCall(
        parameters: $parameters,
        chainId: $chainId,
      )
    }\`,
    variables
  })`.trim()

  const variablesC = `
  const parameters = ${slippage}
  const chainId: ${currencies.INPUT?.chainId}
  `

  const [query, setQuery] = useState<String | null>(null)
  const [variables, setVariables] = useState<String | null>(null)

  const queryAHandler = () => {
    setQuery(queryA)
    setVariables(variablesA)
    setToggle(true)
  }

  const queryBHandler = () => {
    setQuery(queryB)
    setVariables(variablesB)
    setToggle(true)
  }

  const queryCHandler = () => {
    setQuery(queryC)
    setVariables(variablesC)
    setToggle(true)
  }

  return (
    <>
      <Flex className="codeBlock">
        <Flex className="codeBlock__select">
          <Flex className="codeBlock__btnContainer">
            <ButtonLight onClick={queryAHandler} className="codeBlock__btn">
              bestTradeExactIn
            </ButtonLight>
            <W3ToolTip text="Given a list of pairs, a fixed amount in, and token amount out, this method returns the best maxNumResults trades that swap an input token amount to an output token, making at most maxHops hops. The returned trades are sorted by output amount, in decreasing order, and all share the given input amount. " />
          </Flex>
          <Flex className="codeBlock__btnContainer">
            <ButtonLight onClick={queryBHandler} className="codeBlock__btn">
              swapCallParameters
            </ButtonLight>
            <W3ToolTip text="" />
          </Flex>
          <Flex className="codeBlock__btnContainer">
            <ButtonLight onClick={queryCHandler} className="codeBlock__btn">
              execCall
            </ButtonLight>
            <W3ToolTip text="" />
          </Flex>
        </Flex>
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

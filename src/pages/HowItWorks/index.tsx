import React, { useEffect } from 'react'
import Prism from 'prismjs'
import W3Logo from '../../assets/images/web3api-logo.png'
import IpfsDiagram from '../../assets/images/ipfs-diagram.png'
import WasmLogo from '../../assets/images/wasm-logo.png'
import ArrowDown from '../../assets/images/arrow-down-green.svg'
import { W3LogoAnimated } from '../../theme'
import { Image, Flex, Text } from 'rebass'
import Background from '../../web3api/components/Background'
import '../../web3api/components/howItWorks.css'
import '../../components/Card/index'
import { OutlineCard } from '../../components/Card/index'

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
      })
  })`.trim()

export default function HowItWorks() {
  useEffect(() => {
    setTimeout(() => Prism.highlightAll(), 0)
  })

  return (
    <>
      <Background />
      <W3LogoAnimated className="intro__logo" width={'100px'} src={W3Logo} />
      <Flex className="intro">
        <Text className="intro__h1"></Text>
        <Text className="intro__text">
          While this demo may seem to work like the original Uniswap Swap page, what happens behind the scenes is quite
          different:
        </Text>
        <Text className="intro__h2">
          Our team has replaced all the Swap functionality from the Uniswap JavaScript SDK with ones from our own Uni v2
          Web3API!
        </Text>
        <Text className="intro__text"> Scroll down to see how this all works!</Text>

        <Image style={{ width: '15px', paddingTop: '2rem' }} src={ArrowDown} />
      </Flex>
      <Flex className="steps">
        <Text className="steps__intro" style={{ paddingBottom: '2rem' }}>
          How It Works
        </Text>
        <Flex className="steps__container">
          <Flex className="steps__textContainer">
            <Text className="steps__heading">At vero eos et accusamus et iusto odio dignissimos</Text>
            <Text className="steps__text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </Text>
          </Flex>
          <OutlineCard className="steps__visual">
            <Image width={'20rem'} src={IpfsDiagram} />
          </OutlineCard>
        </Flex>
        <Flex className="steps__container">
          <Flex className="steps__textContainer">
            <Text className="steps__heading">At vero eos et accusamus et iusto odio dignissimos</Text>
            <Text className="steps__text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </Text>
          </Flex>
          <OutlineCard className="steps__code">
            <pre className="line-numbers">
              <code className="language-js">{query}</code>
            </pre>
          </OutlineCard>
        </Flex>
        <Flex className="steps__container">
          <Flex className="steps__textContainer">
            <Text className="steps__heading">At vero eos et accusamus et iusto odio dignissimos</Text>
            <Text className="steps__text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </Text>
          </Flex>
          <OutlineCard className="steps__visual">
            <Image src={WasmLogo} style={{ maxWidth: '7rem' }} />
          </OutlineCard>
        </Flex>
      </Flex>
    </>
  )
}

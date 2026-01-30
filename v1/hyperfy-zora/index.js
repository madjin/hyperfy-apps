import React, { useState } from 'react'
import { useWorld, useEth, useFields } from 'hyperfy'

/**
 * 721 example: https://zora.co/collect/eth:0x9aefd6d4fef5b70119fc194d81ebad761a3269c4
 * 1155 example: https://zora.co/collect/eth:0x49ee82df94eb7733e2c673b87cd5c824c7ad45c9/2/mint
 *
 * 721 docs: https://docs.zora.co/docs/smart-contracts/creator-tools/ERC721Drop
 * 1155 docs: https://docs.zora.co/docs/smart-contracts/creator-tools/Minting1155
 *
 * 721 contracts: https://github.com/ourzora/zora-721-contracts/blob/main/addresses/1.json
 * 1155 contracts: https://github.com/ourzora/zora-1155-contracts/blob/main/addresses/1.json
 *
 */

const FIXED_PRICE_1155_CONTRACT = '0x8A1DBE9b1CeB1d17f92Bebf10216FCFAb5C3fbA7'
const MERKLE_MINT_1155_CONTRACT = '0x5c895Cc296e334CA11DF751aA72135807D4057d4'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const eth = useEth()
  const [msg, setMsg] = useState()

  const type = fields.type
  const strategy = fields.strategy
  const merkleProof = fields.merkleProof
  const contractId = fields.contractId
  const tokenId = fields.tokenId

  const label = fields.label || 'Mint'
  const color = fields.color
  const bg = fields.bg
  const scale = fields.scale

  const is721 = type === '721'
  const is1155 = type === '1155'
  const isMerkleProof = strategy === 'merkle_proof'
  const isFixedPrice = strategy === 'fixed_price'

  async function mint() {
    const { address } = world.getAvatar()
    if (!contractId) return setMsg('Missing contract')
    if (is1155 && !tokenId) return setMsg('Missing token id')

    if (!address) {
      return setMsg('Connect your wallet')
    }
    const chain = await eth.getChain()
    if (chain?.name !== 'ethereum') {
      return setMsg(`Please switch to Ethereum`)
    }

    if (is721) {
      try {
        const quantity = 1
        const contract = eth.contract(contractId, abi721)
        const [x1, x2, pricePerToken] = await contract.read('saleDetails')
        console.log(`price: ${eth.toEth(pricePerToken)} eth`)
        const [x3, fee] = await contract.read('zoraFeeForAmount', quantity)
        console.log(`fee: ${eth.toEth(fee)} eth`)
        const extras = {
          value: eth.num(pricePerToken).plus(fee).toFixed(),
          // gasLimit: eth.toWei('0.01'),
        }
        const tx = await contract.write('purchase', quantity, extras)
        await tx.wait()
        setMsg(`Minted!`)
        world.trigger('mint')
      } catch (err) {
        console.error(err)
        return setMsg('Mint failed')
      }
    }

    if (is1155) {
      if (isMerkleProof) {
        return setMsg('Merkle support coming soon')
      }
      try {
        const minterId = isMerkleProof ? MERKLE_MINT_1155_CONTRACT : FIXED_PRICE_1155_CONTRACT // prettier-ignore
        const minter = eth.contract(minterId)
        const [
          saleStart,
          saleEnd,
          maxTokensPerAddress,
          pricePerToken,
          fundsReceipt,
        ] = await minter.read('sale', contractId, tokenId)
        console.log({
          saleStart,
          saleEnd,
          maxTokensPerAddress,
          pricePerToken,
          fundsReceipt,
        })
        console.log(`price: ${eth.toEth(pricePerToken)} eth`)
        const contract = eth.contract(contractId, abi1155)
        const fee = await contract.read('mintFee')
        console.log(`fee: ${eth.toEth(fee)} eth`)
        const quantity = 1
        let minterArguments
        let extras
        if (isFixedPrice) {
          minterArguments = eth.encode(['address'], [address])
          // const gasLimit = 21000
          // console.log('gasLimit', eth.toEth(gasLimit))
          extras = {
            value: eth.num(pricePerToken).plus(fee).toFixed(),
            // gasLimit: gasLimit,
          }
        }
        console.log(minterArguments)
        console.log(extras)
        if (isMerkleProof) {
          // ...
        }
        console.log([
          'mint',
          minterId,
          parseInt(tokenId),
          quantity,
          minterArguments,
          extras,
        ])
        const tx = await contract.write(
          'mint',
          minterId,
          tokenId,
          quantity,
          minterArguments,
          extras
        )
        await tx.wait()
        setMsg(`Minted!`)
        world.trigger('mint')
      } catch (err) {
        console.error(err)
        return setMsg('Mint failed')
      }
    }
  }

  return (
    <app>
      <group scale={scale}>
        {msg && (
          <>
            <text
              value={msg}
              color={color}
              bgColor={bg}
              padding={[0.05, 0.1]}
              bgRadius={0.08}
              position={[0, 0.26, 0]}
              fontSize={0.05}
            />
            <trigger size={7.5} onLeave={() => setStatus(null)} />
          </>
        )}
        <text
          value={label}
          position={[0, 0, 0]}
          anchorY="middle"
          color={color}
          bgColor={bg}
          padding={[0.1, 0.2]}
          bgRadius={0.1}
          scale={0.8}
          onPointerDown={mint}
          hitDistance={Infinity}
        />
      </group>
    </app>
  )
}

const initialState = {
  // ...
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'type',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Edition', value: '721' },
          { label: 'Multi-edition', value: '1155' },
        ],
        initial: '721',
      },
      {
        key: 'strategy',
        label: 'Strategy',
        type: 'switch',
        options: [
          {
            label: 'Fixed Price',
            value: 'fixed_price',
          },
          {
            label: 'Merkle Proof',
            value: 'merkle_proof',
          },
        ],
        initial: 'fixed_price',
        conditions: [{ field: 'type', op: 'eq', value: '1155' }],
      },
      {
        key: 'merkeProof',
        label: 'Merkle Proof',
        type: 'text',
        placeholder: '',
        conditions: [{ field: 'stategy', op: 'eq', value: 'merkle_proof' }],
      },
      {
        key: 'contractId',
        label: 'Contract',
        type: 'text',
        placeholder: '0x...',
      },
      {
        key: 'tokenId',
        label: 'Token ID',
        type: 'text',
        conditions: [{ field: 'type', op: 'eq', value: '1155' }],
      },
      {
        type: 'trigger',
        label: 'On Mint',
        name: 'mint',
      },
      {
        type: 'section',
        label: 'Button',
      },
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        initial: 'Mint',
        placeholder: 'Mint',
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        initial: '#ffffff',
      },
      {
        key: 'bg',
        label: 'Background',
        type: 'color',
        initial: '#000000',
      },
      {
        key: 'scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
        placeholder: '1',
      },
    ],
  }
}

const abi721 = [
  // saleDetails
  {
    name: 'saleDetails',
    inputs: [],
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'publicSaleActive',
            type: 'bool',
          },
          { internalType: 'bool', name: 'presaleActive', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'publicSalePrice',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'publicSaleStart',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'publicSaleEnd',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'presaleStart',
            type: 'uint64',
          },
          { internalType: 'uint64', name: 'presaleEnd', type: 'uint64' },
          {
            internalType: 'bytes32',
            name: 'presaleMerkleRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'maxSalePurchasePerAddress',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalMinted',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'maxSupply', type: 'uint256' },
        ],
        internalType: 'struct IERC721Drop.SaleDetails',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // zoraFeeForAmount
  {
    name: 'zoraFeeForAmount',
    inputs: [{ internalType: 'uint256', name: 'quantity', type: 'uint256' }],
    outputs: [
      {
        internalType: 'address payable',
        name: 'recipient',
        type: 'address',
      },
      { internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // purchase
  {
    name: 'purchase',
    inputs: [{ internalType: 'uint256', name: 'quantity', type: 'uint256' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
]

const abi1155 = [
  {
    name: 'mint',
    inputs: [
      {
        internalType: 'contract IMinter1155',
        name: 'minter',
        type: 'address',
      },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
      { internalType: 'bytes', name: 'minterArguments', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    name: 'mintFee',
    inputs: [],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

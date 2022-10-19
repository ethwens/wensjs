/**
 * @jest-environment node
 */
import WENS, {
  getWensAddress,
} from '../index.js'
import '../testing-utils/extendExpect'
import Web3 from 'web3'

let provider
let wens
let ensContract
let signer

describe('Blockchain tests', () => {
  beforeAll(async () => {
    provider = new Web3.providers.HttpProvider('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
    const wensAddress = getWensAddress(5);
    wens = new WENS({ provider, wensAddress })
  }, 1000000)


  describe('Registry', () => {
    test('should get address by name', async () => {
      const address = await wens.name('ablll.ape').getAddress()
      expect(address).toEqual('0xaEAbD4022bC6C1e7EB1389E9A47ECc28182db55a')
    })

    test('should getResolver', async () => {
      const resolver = await wens.name('ablll.ape').getResolver()
      expect(resolver).toBeHex()
      expect(resolver).toBeEthAddress()
      expect(resolver).toBe('0xA14553f48184d12a92b11f8CaBA813754E7Ec685')
    })

    test('should getResolver when not set', async () => {
      const resolver = await wens.name('n.ape').getResolver()
      expect(resolver).toBeHex()
      expect(resolver).toBeEthAddress()
      expect(resolver).toBe('0x0000000000000000000000000000000000000000')
    })
  })


  describe('Resolver', () => {
    test('should get name by address', async () => {
      const {name} = await wens.getName('0xaEAbD4022bC6C1e7EB1389E9A47ECc28182db55a')
      expect(name).toEqual('ablll.ethw')
    })
  })
})
// 0xaEAbD4022bC6C1e7EB1389E9A47ECc28182db55a
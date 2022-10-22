/**
 * @jest-environment node
 */
import WENS from '../index.js'
import '../testing-utils/extendExpect'

let wens

describe('Blockchain tests', () => {
  beforeAll(async () => {
    wens = new WENS({ networkId: 5 })
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
      expect(name).toEqual('abcd.ethw')
    })
  })
})
// 0xaEAbD4022bC6C1e7EB1389E9A47ECc28182db55a
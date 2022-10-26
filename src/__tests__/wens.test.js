/**
 * @jest-environment node
 */
import WENS from '../index.js'
import '../testing-utils/extendExpect'

let wens

describe('Blockchain tests', () => {
  beforeAll(async () => {
    wens = new WENS({ networkId: 10001 })
  }, 1000000)


  describe('Registry', () => {
    test('should get address by name', async () => {
      const address = await wens.name('wagmi33.ethw').getAddress()
      expect(address).toEqual('0x7B2353c81a98bC0a09d47D22ef7AcaE558986CFa')
    })

    test('should getResolver', async () => {
      const resolver = await wens.name('wagmi33.ethw').getResolver()
      expect(resolver).toBeHex()
      expect(resolver).toBeEthAddress()
      expect(resolver).toBe('0x74fC211a8bd0Cb6ad57a2DD2a47ffC5b6417a822')
    })

    test('should getResolver when not set', async () => {
      const resolver = await wens.name('0.ethw').getResolver()
      expect(resolver).toBeHex()
      expect(resolver).toBeEthAddress()
      expect(resolver).toBe('0x0000000000000000000000000000000000000000')
    })

    test('should getOwner from name', async () => {
      const owner = await wens.name('wagmi33.ethw').getOwner()
      expect(owner).toBeHex()
      expect(owner).toBeEthAddress()
      expect(owner).toBe('0x7B2353c81a98bC0a09d47D22ef7AcaE558986CFa')
    })
  })


  describe('Resolver', () => {
    test('should get name by address', async () => {
      const {name} = await wens.getName('0x7B2353c81a98bC0a09d47D22ef7AcaE558986CFa')
      expect(name).toEqual('wagmi33.ethw')
    })
  })
})
// 0xaEAbD4022bC6C1e7EB1389E9A47ECc28182db55a
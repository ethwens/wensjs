import { ethers } from 'ethers'
const Provider = ethers.providers.Provider
import { formatsByName } from '@ensdomains/address-encoder'
import wensABI from '../abis/WENS.json'
import resolverABI from '../abis/Resolver.json'
import reverseRegistrarABI from '../abis/ReverseRegistrar.json'

import { emptyAddress, namehash, labelhash } from './utils'

const GOERLI_CHAIN_ID = 5
const ETHW_CHAIN_ID = 10001

function getWensAddress(networkId) {
  return {
    [GOERLI_CHAIN_ID]: '0x66dB8F7D8eeB8657B1422aB9FDbC501D13f10ef2',
    [ETHW_CHAIN_ID]: ''
  }[networkId]
}

function getResolverContract({ address, provider }) {
  return new ethers.Contract(address, resolverABI, provider)
}

function getWensContract({ address, provider }) {
  return new ethers.Contract(address, wensABI, provider)
}

function getReverseRegistrarContract({ address, provider }) {
  return new ethers.Contract(address, reverseRegistrarABI, provider)
}

async function getAddrWithResolver({ name, key, resolverAddr, provider }) {
  const nh = namehash(name)
  try {
    const Resolver = getResolverContract({
      address: resolverAddr,
      provider,
    })
    const { coinType, encoder } = formatsByName[key]
    const addr = await Resolver['addr(bytes32,uint256)'](nh, coinType)
    if (addr === '0x') return emptyAddress

    return encoder(Buffer.from(addr.slice(2), 'hex'))
  } catch (e) {
    console.log(e)
    console.warn(
      'Error getting addr on the resolver contract, are you sure the resolver address is a resolver contract?'
    )
    return emptyAddress
  }
}

async function setAddrWithResolver({
  name,
  key,
  address,
  resolverAddr,
  signer,
}) {
  const nh = namehash(name)
  const Resolver = getResolverContract({
    address: resolverAddr,
    provider: signer,
  })
  const { decoder, coinType } = formatsByName[key]
  let addressAsBytes
  if (!address || address === '') {
    addressAsBytes = Buffer.from('')
  } else {
    addressAsBytes = decoder(address)
  }
  return Resolver['setAddr(bytes32,uint256,bytes)'](
    nh,
    coinType,
    addressAsBytes
  )
}

async function getTextWithResolver({ name, key, resolverAddr, provider }) {
  const nh = namehash(name)
  if (parseInt(resolverAddr, 16) === 0) {
    return ''
  }
  try {
    const Resolver = getResolverContract({
      address: resolverAddr,
      provider,
    })
    const addr = await Resolver.text(nh, key)
    return addr
  } catch (e) {
    console.warn(
      'Error getting text record on the resolver contract, are you sure the resolver address is a resolver contract?'
    )
    return ''
  }
}

async function setTextWithResolver({
  name,
  key,
  recordValue,
  resolverAddr,
  signer,
}) {
  const nh = namehash(name)
  return getResolverContract({
    address: resolverAddr,
    provider: signer,
  }).setText(nh, key, recordValue)
}

class Resolver {
  //TODO
  constructor({ address, wens }) {
    this.address = address
    this.wens = wens
  }
  name(name) {
    return new Name({
      name,
      wens: this.wens,
      provider: this.provider,
      signer: this.signer,
      resolver: this.address,
    })
  }
}

class Name {
  constructor(options) {
    const { name, wens, provider, signer, namehash: nh, resolver } = options
    if (options.namehash) {
      this.namehash = nh
    }
    this.wens = wens
    this.wensWithSigner = this.wens.connect(signer)
    this.name = name
    this.namehash = namehash(name)
    this.provider = provider
    this.signer = signer
    this.resolver = resolver
  }

  async getOwner() {
    return this.wens.owner(this.namehash)
  }

  async setOwner(address) {
    if (!address) throw new Error('No newOwner address provided!')
    return this.wensWithSigner.setOwner(this.namehash, address)
  }

  async getResolver() {
    return this.wens.resolver(this.namehash)
  }

  async setResolver(address) {
    if (!address) throw new Error('No resolver address provided!')
    return this.wensWithSigner.setResolver(this.namehash, address)
  }

  async getTTL() {
    return this.wens.ttl(this.namehash)
  }

  async getResolverAddr() {
    if (this.resolver) {
      return this.resolver // hardcoded for old resolvers or specific resolvers
    } else {
      return this.getResolver()
    }
  }

  async getAddress(coinId) {
    const resolverAddr = await this.getResolverAddr()
    if (parseInt(resolverAddr, 16) === 0) return emptyAddress
    const Resolver = getResolverContract({
      address: resolverAddr,
      provider: this.provider,
    })
    if (!coinId) {
      return Resolver['addr(bytes32)'](this.namehash)
    }
    //TODO add coinID

    return getAddrWithResolver({
      name: this.name,
      key: coinId,
      resolverAddr,
      provider: this.provider,
    })
  }

  async setAddress(key, address) {
    if (!key) {
      throw new Error('No coinId provided')
    }

    if (!address) {
      throw new Error('No address provided')
    }
    const resolverAddr = await this.getResolverAddr()
    return setAddrWithResolver({
      name: this.name,
      key,
      address,
      resolverAddr,
      signer: this.signer,
    })
  }

  async getText(key) {
    const resolverAddr = await this.getResolverAddr()
    return getTextWithResolver({
      name: this.name,
      key,
      resolverAddr,
      provider: this.provider,
    })
  }

  async setText(key, recordValue) {
    const resolverAddr = await this.getResolverAddr()
    return setTextWithResolver({
      name: this.name,
      key,
      recordValue,
      resolverAddr,
      signer: this.signer,
    })
  }

  async setSubnodeOwner(label, newOwner) {
    const lh = labelhash(label)
    return this.wensWithSigner.setSubnodeOwner(this.namehash, lh, newOwner)
  }

  async setSubnodeRecord(label, newOwner, resolver, ttl = 0) {
    const lh = labelhash(label)
    return this.wensWithSigner.setSubnodeRecord(
      this.namehash,
      lh,
      newOwner,
      resolver,
      ttl
    )
  }

  async createSubdomain(label) {
    const resolverPromise = this.getResolver()
    const ownerPromise = this.getOwner()
    const [resolver, owner] = await Promise.all([resolverPromise, ownerPromise])
    return this.setSubnodeRecord(label, owner, resolver)
  }

  async deleteSubdomain(label) {
    return this.setSubnodeRecord(label, emptyAddress, emptyAddress)
  }
}

export default class WENS {
  constructor(options) {
    const { networkId, provider, wensAddress } = options
    let ethersProvider
    if (Provider.isProvider(provider)) {
      //detect ethersProvider
      ethersProvider = provider
    } else {
      ethersProvider = new ethers.providers.Web3Provider(provider)
    }
    this.provider = ethersProvider
    this.signer = ethersProvider.getSigner()
    this.wens = getWensContract({
      address: wensAddress ? wensAddress : getWensAddress(networkId),
      provider: ethersProvider,
    })
  }

  name(name) {
    return new Name({
      name,
      wens: this.wens,
      provider: this.provider,
      signer: this.signer,
    })
  }

  resolver(address) {
    return new Resolver({
      wens: this.wens,
      provider: this.provider,
      address: address,
    })
  }

  async getName(address) {
    const reverseNode = `${address.slice(2)}.addr.reverse`
    const resolverAddr = await this.wens.resolver(namehash(reverseNode))
    return this.getNameWithResolver(address, resolverAddr)
  }

  async getNameWithResolver(address, resolverAddr) {
    const reverseNode = `${address.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    if (parseInt(resolverAddr, 16) === 0) {
      return {
        name: null,
      }
    }

    try {
      const Resolver = getResolverContract({
        address: resolverAddr,
        provider: this.provider,
      })
      const name = await Resolver.name(reverseNamehash)
      return {
        name,
      }
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
    }
  }

  async setReverseRecord(name, overrides) {
    const reverseRegistrarAddr = await this.name('addr.reverse').getOwner(
      'addr.reverse'
    )
    const reverseRegistrar = getReverseRegistrarContract({
      address: reverseRegistrarAddr,
      provider: this.signer,
    })
    return reverseRegistrar.setName(name)
  }
}

export {
  namehash,
  labelhash,
  getWensContract,
  getResolverContract,
  getWensAddress,
}

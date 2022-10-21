# WENS.js V1


## Overview of the API

### Setup

```
import WENS, { getWensAddress } from 'wens'


const chainID = 5
const wens = new WENS({ provider, WENSAddress: getWensAddress(chainID) })

wens.name('resolver.ethw').getAddress() // 0x123
```

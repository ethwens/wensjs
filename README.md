# WENS.js V1


## Overview of the API

### Setup

```
import WENS, { getWensAddress } from 'wens'


const networkId = 5
const wens = new WENS({ networkId })

wens.name('resolver.ethw').getAddress() // 0x123

wens.getName('0x111')  //xxx.ethw
```

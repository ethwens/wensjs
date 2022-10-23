# WENS.js V1


## Overview of the API

### Setup

```
import WENS, { getWensAddress } from 'wens'


const networkId = 10001
const wens = new WENS({ networkId })

wens.name('wens.ethw').getAddress() // 0x123

wens.getName('0x111')  //xxx.ethw
```

### Test

https://github.com/ethwens/wensjs/blob/master/src/__tests__/wens.test.js

# ArrayVectorProps.hyp

## Metadata
- **Author**: ~/MayD524/Hyperfy
- **Channel**: #🎨│showcase
- **Date**: 2025-03-13
- **Size**: 388,702 bytes

## Discord Context
> Requires https://github.com/Bitmato-Studio/hyperfy/tree/bm/ArrayProps mod

## Blueprint
- **Name**: ArrayVectorProps
- **Version**: 118
- **Model**: `asset://382183e74d046349d1f9b411f27cfccaa814db4e95590c3e0aab5d7597f83fe8.glb`
- **Script**: `asset://192c6be0a480a18c3d3de50adc3dd143047906ceeb94bd3e74be213ec6a5c0e1.js`

## Props
- `test`: list = `[{'type': 'emote', 'name': 'sit_idle_emote.glb', 'url': 'asset://036b786f142de68cefe0da2fa27725b92d71f7298035acd49944175c49507ede.glb'}, {'type': 'emote', 'name': 'hunter.glb', 'url': 'asset://2afc9d0e43e9bd2c529f763db9a61510d86378d0f89f201494cbd78105d00fea.glb'}, None]`
- `test2`: list = `['test', 'test2', 'test23', '']`
- `testv3`: object
- `test3`: list = `[3, 4, 0]`
- `test4`: list = `[50.05, 88.2, 17.35, 1]`

## Assets
- `[model]` 382183e74d046349d1f9b411f27cfccaa814db4e95590c3e0aab5d7597f83fe8.glb (386,464 bytes)
- `[script]` 192c6be0a480a18c3d3de50adc3dd143047906ceeb94bd3e74be213ec6a5c0e1.js (1,056 bytes)

## Script Analysis
**App Methods**: `app.configure()`
**World Methods**: `world.getPlayer()`

## Keywords (for Discord search)
array, arrayFile, arrayNumber, arrayRange, configure, console, emote, getPlayer, initial, isClient, isServer, kind, label, props, strict, test, test2, test3, test4, testt

## Script Source
```javascript
props;
(function () {
    'use strict';

    var config_props = [
        {
            "type": "arrayFile",
            "label": "test",
            "key": "test",
            "kind": "emote"
        },
        {
            "type": "array",
            "label": "testt",
            "key": "test2"
        },
        {
            "type": "arrayNumber",
            "label": "tn",
            "key": "test3"
        },
        {
            "type": "arrayRange",
            "label": "tn",
            "key": "test4",
            "min": 1,
            "max": 100,
            "initial": 10
        },
        {
            "type": "vector3",
            "label": "testv3",
            "key": "testv3"
        }
    ];

    app.configure(config_props);

    if (world.isClient) {
        /** @type {PlayerProxy} Player */
        world.getPlayer();
        console.log(props.test)
        console.log(props.test2)
        console.log(props.test3)
        console.log(props.test4)
        console.log(props.testv3)
    } 

    if (world.isServer) ;

})();

```

---
*Extracted from ArrayVectorProps.hyp. Attachment ID: 1349553928139968597*
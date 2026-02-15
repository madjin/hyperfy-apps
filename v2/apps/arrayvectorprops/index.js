export default function main(world, app, fetch, props, setTimeout) {
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

}

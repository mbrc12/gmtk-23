// import tree from "./gmtlart/tree.png?url"
// import defaultPNG from "./fonts/minogram_6x10.png?url"
// import defaultXML from "./fonts/minogram_6x10.xml?url"
import defaultPNG from "./fonts/minogram_6x10.png?url"
import defaultXML from "./fonts/minogram_6x10.xml?url"
// "
// import click from "./audio/click.mp3?url"

// import pick from './gmtk/art/pick.png?url'
// import grab from './gmtk/art/grabbed.png?url'
// import forbidden from './gmtk/art/forbidden.png?url'
// import tile from './gmtk/art/rope.png?url'
// import ball from './gmtk/art/ball.png?url'

import progress from './gmtk/art/progress.png?url'
import pick from './gmtk/art/pick.png?url'

import sky1 from './gmtk/art/sky-1.png?url'
import sky2 from './gmtk/art/sky-2.png?url'

import covid from './gmtk/art/covid.png?url'

import current from './gmtk/art/current.png?url'
import banned from './gmtk/art/banned.png?url'
import chaos from './gmtk/art/chaos.png?url'

import skull from './gmtk/art/skull-2.png?url'

import road from './gmtk/art/road.png?url'

import body from './gmtk/art/body.png?url'
import head from './gmtk/art/head.png?url'
import headMask from './gmtk/art/head-mask.png?url'

import headInfected from './gmtk/art/head-infected.png?url'
import headMaskInfected from './gmtk/art/head-mask-infected.png?url'

import legs from './gmtk/art/legs.png?url'
import rip from './gmtk/art/rip.png?url'


import buildingBody from './gmtk/art/building-body.png?url'
import buildingBody2 from './gmtk/art/building-body-2.png?url'
import buildingTop1 from './gmtk/art/building-top-1.png?url'
import buildingTop2 from './gmtk/art/building-top-2.png?url'
import buildingTop3 from './gmtk/art/building-top-3.png?url'
import buildingTop4 from './gmtk/art/building-top-4.png?url'
import buildingTop5 from './gmtk/art/building-top-5.png?url'
import hospital from './gmtk/art/hospital-2.png?url'


// Background music from https://opengameart.org/content/filtered-space
import bgm from './gmtk/music/filteredspace.mp3?url' 
// https://opengameart.org/content/music-box-game-over-iii
import gameOver from './gmtk/music/game-over.mp3?url' 

// SFX of transfer from https://opengameart.org/content/sound-effects-sfx015, edited by me.
import transfer from './gmtk/sfx/transfer.mp3?url'
// https://opengameart.org/content/4-door-closes
import doorClose from './gmtk/sfx/door-close.mp3?url'
import doorCloseMuted from './gmtk/sfx/door-close-muted.mp3?url'
import ripSFX from './gmtk/sfx/rip.mp3?url'
import ripSFXMuted from './gmtk/sfx/rip-muted.mp3?url'

export const Assets = {
    art: {
        progress: progress,
        pick: pick,

        sky1: sky1,
        sky2: sky2,

        road: road,

        covid: covid,
        current: current,
        banned: banned,
        chaos: chaos,
        skull: skull,
        rip: rip,

        legs: legs,
        body: body,
        head: head,
        headMask: headMask,
        headInfected: headInfected,
        headMaskInfected: headMaskInfected,

        buildingBody: buildingBody,
        buildingBody2: buildingBody2,

        buildingTop1: buildingTop1,
        buildingTop2: buildingTop2,
        buildingTop3: buildingTop3,
        buildingTop4: buildingTop4,
        buildingTop5: buildingTop5,
        hospital: hospital
    },

    music: {
        bgm: bgm,
        gameOver: gameOver
    },

    sfx: {
        transfer: transfer,
        doorClose: doorClose,
        doorCloseMuted: doorCloseMuted,
        rip: ripSFX,
        ripMuted: ripSFXMuted
    },

    fonts: {
        default: {
            png: defaultPNG,
            xml: defaultXML
        }
    }
    // audio: {
    //     click: click
    // }
}

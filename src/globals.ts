export const LAST_SCENE_KEY = "last-scene"
export const MAIN_SCENE = "game"

export const WIDTH = 480
export const HEIGHT = 120

export const POINTER_SPEED = 0.5
export const POINTER_THRESHOLD = 1

export const HEAD_SIZE = 15
export const BODY_SIZE = 16
export const LEGS_SIZE = 16

export const BG_COLOR = 0x1c1c1c //0x0ccddff
// export const BG_COLOR = 0xe3e3e3

export const UI_DEPTH = 999

export const HUMAN_DEPTH = 0

export const SKY_DEPTH = -100
export const BUILDING_DEPTH = -80
export const ROAD_DEPTH = -20

export const PROGRESS_DEPTH = 0

export const PERSON_Y = HEIGHT / 2
export const SKULL_Y = 4 * HEIGHT / 5
export const SKULL_X_OFFSET = 4
export const SKULL_DEPTH = -2

export const COVID_OFFSET_X = 8
export const COVID_OFFSET_Y = -4

export const CHAOS_OFFSET_X = 2
export const CHAOS_OFFSET_Y = 1

export const SELECT_WIDTH = 24
export const SELECT_HEIGHT = 50

export const WAVE_SPEED = 80
export const WAVE_AMP = 2

export const TRANSITION_DURATION = 300

export const STATUS_SIZE = 10
export const STATUS_COLOR = 0xdff6f5
export const STATUS_CLEAR_DELAY = 3000

export const POTENCY_COLOR = 0xcfc6b8
export const POTENCY_WIDTH = 64
export const POTENCY_HEIGHT = 8
export const POTENCY_LOW = 0.3
export const POTENCY_CRIT = 0.1
// Layers and masks 

export const PADDED = 13

export const AUDIO_DISTANCE = WIDTH * 2 / 3

export const HEALTH_COLOR = 0xb6d53c
export const LOW_HEALTH_COLOR = 0xe6482e
export const INFECT_COLOR = 0x397b44ff

export const MIN_INITIAL_HEALTH = 0.25
export const STARTING_HUMAN_MIN_HEALTH = 0.9

export const HEALTH_THRESHOLD = 0.1
export const HEALTH_NONE = 0.04

export const DESTINATION_CLOSENESS = 0.7
export const HOME_WAIT_TIME = 1500


export const VELOCITY_MULTIPLIER = 1.5
export const MIN_VELOCITY = 0.2
export const TIME_TO_HOME_MULTIPLIER = 200

export const PALETTE = [0xd1b187, 0xc77b58, 0xae5d40, 0x79444a, 0x4b3d44, 0xba9158, 0x927441, 0x4d4539, 0x77743b,
    0xb3a555, 0xd2c9a5, 0x8caba1, 0x4b726e, 0x574852, 0x847875, 0xab9b8e]

export const TOP_COLORS = PALETTE
export const BOT_COLORS = PALETTE


export const GAME_OVER_DELAY = 3000



export const TIPS = [
    "those you infect will always lose health",
    "infected but masked people lose health slowly",
    "passing through regions with death is not good",
    "do not forget the distance counter",
    "if the host is too healthy, you lose potency",
    "weak hosts slowly increase your potency",
    "healthy people generally walk faster",
    "you may press q to pause",
    "you cannot reinfect a host"
]



// step is in seconds!
export const PHYSICS_STEP = 1/120.0 
export const GRAVITY = 300

export const DEBUG_STROKE_COLOR = 0x35778F
export const DEBUG_STROKE_COLOR_ASLEEP = 0xCF7735
export const DEBUG_STROKE_WIDTH = 1
export const DEBUG_STROKE_ALPHA = 0.8
export const DEBUG_DEPTH = 999
export const DIAGNOSTICS_DEPTH = 1000









export const TILE_LAYER = 0x0001
export const TILE_MASK = 0x0010

export const PLAYER_LAYER = 0x0010
export const PLAYER_MASK = 0x0001

export const TREE_LAYER = 0x1000
export const TREE_MASK = 0x1100

export const WALL_LAYER = 0x0100
export const WALL_MASK = 0x1000

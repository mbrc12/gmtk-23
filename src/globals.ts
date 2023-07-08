export const LAST_SCENE_KEY = "last-scene"
export const MAIN_SCENE = "game"

export const WIDTH = 480
export const HEIGHT = 120

export const POINTER_SPEED = 0.5
export const POINTER_THRESHOLD = 1

export const HEAD_SIZE = 16
export const BODY_SIZE = 16
export const LEGS_SIZE = 16

export const BG_COLOR = 0x1c1c1c //0x0ccddff
// export const BG_COLOR = 0xe3e3e3


// step is in seconds!
export const PHYSICS_STEP = 1/120.0 
export const GRAVITY = 300

export const DEBUG_STROKE_COLOR = 0x35778F
export const DEBUG_STROKE_COLOR_ASLEEP = 0xCF7735
export const DEBUG_STROKE_WIDTH = 1
export const DEBUG_STROKE_ALPHA = 0.8
export const DEBUG_DEPTH = 999
export const DIAGNOSTICS_DEPTH = 1000

export const UI_DEPTH = 999

export const HUMAN_DEPTH = 500

export const SKY_DEPTH = 1
export const BUILDING_DEPTH = 100
export const ROAD_DEPTH = 200

export const PROGRESS_DEPTH = 500

export const COVID_OFFSET_X = 8
export const COVID_OFFSET_Y = -8

export const SELECT_WIDTH = 24
export const SELECT_HEIGHT = 50

export const WAVE_SPEED = 80
export const WAVE_AMP = 2

// Layers and masks 

export const TILE_LAYER = 0x0001
export const TILE_MASK = 0x0010

export const PLAYER_LAYER = 0x0010
export const PLAYER_MASK = 0x0001

export const TREE_LAYER = 0x1000
export const TREE_MASK = 0x1100

export const WALL_LAYER = 0x0100
export const WALL_MASK = 0x1000

export const HEALTH_COLOR = 0xb6d53c
export const LOW_HEALTH_COLOR = 0xe6482e

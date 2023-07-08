import random from "random"

const SEED = performance.now()
random.use(SEED as any)

export default random;

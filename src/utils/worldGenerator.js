import { createNoise3D } from 'three-noise'

export function generateWorld(seed) {
  const noise3D = createNoise3D(() => seed)
  const worldSize = 32
  const blocks = []

  for (let x = 0; x < worldSize; x++) {
    for (let z = 0; z < worldSize; z++) {
      const height = Math.floor(noise3D(x/10, 0, z/10) * 10) + 10
      
      for (let y = 0; y < height; y++) {
        blocks.push({
          position: [x, y, z],
          type: y === height - 1 ? 'grass' : y > height - 4 ? 'dirt' : 'stone'
        })
      }
    }
  }

  return { seed, blocks }
}
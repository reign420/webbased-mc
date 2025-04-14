import { TextureLoader } from 'three'

export const texturePaths = {
  grass: '/textures/grass.png',
  dirt: '/textures/dirt.png',
  stone: '/textures/stone.png'
}

export function loadTextures() {
  const loader = new TextureLoader()
  return Object.fromEntries(
    Object.entries(texturePaths).map(([key, path]) => [
      key,
      loader.load(path)
    ])
  )
}
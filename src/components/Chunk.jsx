import { memo, useEffect, useState } from 'react'
import { useBox } from '@react-three/cannon'
import { Noise } from 'noisejs'

const Chunk = memo(({ position, seed, blocks = [], onBlockUpdate }) => {
  const [generatedBlocks, setGeneratedBlocks] = useState([])
  const noise = new Noise(seed)

  // Generate terrain on mount
  useEffect(() => {
    const generateTerrain = () => {
      const newBlocks = []
      const [cx, cy, cz] = position
      
      for(let x = 0; x < CHUNK_SIZE; x++) {
        for(let z = 0; z < CHUNK_SIZE; z++) {
          const wx = cx + x
          const wz = cz + z
          const height = Math.floor(noise.simplex2(wx/50, wz/50) * 10 + 50

          for(let y = 0; y < height; y++) {
            const type = y === height - 1 ? 'grass' : 
                        y > height - 4 ? 'dirt' : 'stone'
            newBlocks.push({
              position: [wx, y, wz],
              type: type
            })
          }
        }
      }
      setGeneratedBlocks([...newBlocks, ...blocks])
    }

    generateTerrain()
  }, [position, seed])

  return (
    <group position={position}>
      {generatedBlocks.map((block, i) => (
        <Block
          key={`${block.position.join('-')}`}
          position={block.position}
          type={block.type}
          onBlockUpdate={onBlockUpdate}
        />
      ))}
    </group>
  )
})

function Block({ position, type, onBlockUpdate }) {
  const [ref] = useBox(() => ({
    mass: 0,
    position,
    args: [1, 1, 1],
    material: { friction: 0.4 }
  }))

  const textures = useTexture({
    map: `textures/${type}.png`
  })

  return (
    <mesh 
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        onBlockUpdate(position, 'air')
      }}
      onContextMenu={(e) => {
        e.stopPropagation()
        onBlockUpdate(position, type)
      }}
    >
      <boxGeometry />
      <meshStandardMaterial {...textures} />
    </mesh>
  )
}

export default Chunk
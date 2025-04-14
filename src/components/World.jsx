import { useEffect, useMemo, useState, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Physics, useBox, useCylinder } from '@react-three/cannon'
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { supabase } from '../utils/supabaseClient'
import Chunk from './Chunk'
import Inventory from './Inventory'

// World constants
const VIEW_DISTANCE = 3 // Chunks in each direction
const CHUNK_SIZE = 16
const WORLD_SEED = 12345

export default function World() {
  const [chunks, setChunks] = useState({})
  const [playerPosition, setPlayerPosition] = useState([0, 20, 0])
  const [inventory, setInventory] = useState([
    { type: 'grass', count: 99 },
    { type: 'dirt', count: 99 },
    { type: 'stone', count: 99 }
  ])
  const [selectedSlot, setSelectedSlot] = useState(0)

  // Load/save world data
  useEffect(() => {
    const loadWorld = async () => {
      const { data } = await supabase
        .from('worlds')
        .select('data')
        .eq('user_id', supabase.auth.user?.id)
        .single()

      if (data) {
        setChunks(data.chunks)
      } else {
        generateInitialChunks()
      }
    }
    
    loadWorld()
  }, [])

  // Generate initial chunks around player
  const generateInitialChunks = () => {
    const newChunks = {}
    for(let x = -VIEW_DISTANCE; x <= VIEW_DISTANCE; x++) {
      for(let z = -VIEW_DISTANCE; z <= VIEW_DISTANCE; z++) {
        const chunkKey = `${x},${z}`
        newChunks[chunkKey] = { position: [x * CHUNK_SIZE, 0, z * CHUNK_SIZE] }
      }
    }
    setChunks(newChunks)
  }

  // Handle block updates
  const handleBlockUpdate = (chunkKey, blockPosition, newType) => {
    setChunks(prev => {
      const updated = { ...prev }
      if(!updated[chunkKey].blocks) updated[chunkKey].blocks = []
      const existing = updated[chunkKey].blocks.find(b => 
        b.position.join() === blockPosition.join()
      )
      
      if(newType === 'air') {
        updated[chunkKey].blocks = updated[chunkKey].blocks.filter(b => b !== existing)
      } else if(existing) {
        existing.type = newType
      } else {
        updated[chunkKey].blocks.push({ position: blockPosition, type: newType })
      }
      return updated
    })

    // Sync with Supabase
    supabase.from('worlds').upsert({
      user_id: supabase.auth.user?.id,
      data: { chunks },
      updated_at: new Date()
    })
  }

  return (
    <div className="world-container">
      <Canvas camera={{ position: [0, 20, 0], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[100, 100, 100]} />
        
        <Physics gravity={[0, -30, 0]}>
          {/* Render chunks */}
          {Object.entries(chunks).map(([key, chunk]) => (
            <Chunk
              key={key}
              position={chunk.position}
              seed={WORLD_SEED}
              blocks={chunk.blocks}
              onBlockUpdate={(pos, type) => handleBlockUpdate(key, pos, type)}
            />
          ))}

          {/* Player controller */}
          <Player 
            position={playerPosition}
            onPositionUpdate={setPlayerPosition}
            selectedBlock={inventory[selectedSlot]?.type}
          />
        </Physics>
        
        <OrbitControls />
      </Canvas>

      <Inventory
        items={inventory}
        selected={selectedSlot}
        onSelect={setSelectedSlot}
      />
    </div>
  )
}

function Player({ position, onPositionUpdate, selectedBlock }) {
  const { camera } = useThree()
  const [ref, api] = useCylinder({
    mass: 1,
    args: [0.5, 1.8],
    position: position,
    fixedRotation: true
  })

  const velocity = useRef([0, 0, 0])
  const isGrounded = useRef(false)
  const raycaster = new useThree().Raycaster()

  // Physics updates
  useFrame(() => {
    // Movement logic
    const [x, y, z] = position
    api.velocity.set(velocity.current[0], velocity.current[1], velocity.current[2])
    
    // Block interaction
    raycaster.setFromCamera({ x: 0, y: 0 }, camera)
    const intersects = raycaster.intersectObjects(
      scene.children.filter(obj => obj.type === 'Mesh')
    )

    if(intersects.length > 0) {
      const { point, face, object } = intersects[0]
      const breakPos = object.position
      const placePos = breakPos.clone().add(face.normal).floor()

      // Handle block breaking/placing
      if(mouseDown.left) {
        object.parent.onBlockUpdate(breakPos.toArray(), 'air')
      }
      if(mouseDown.right) {
        object.parent.onBlockUpdate(placePos.toArray(), selectedBlock)
      }
    }
  })

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Movement logic here
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <mesh ref={ref}>
      <capsuleGeometry args={[0.5, 1.8]} />
      <meshPhongMaterial color="blue" visible={false} />
    </mesh>
  )
}
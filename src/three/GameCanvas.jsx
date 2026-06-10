// Cena 3D principal de Bellyport
import { Canvas } from '@react-three/fiber'
import Lighting from './Lighting'
import City from './City'
import Restaurants from './Restaurants'
import Player from './Player'
import Kraken from './Kraken'
import NPCs from './NPCs'
import Pickups from './Pickups'

export default function GameCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 50, near: 0.5, far: 400, position: [0, 14, 44] }}
      gl={{ antialias: true }}
    >
      <Lighting />
      <City />
      <Restaurants />
      <Pickups />
      <NPCs />
      <Kraken />
      <Player />
    </Canvas>
  )
}

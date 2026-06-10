// MobDyck — bolota baleia-chef com avental xadrez e boné torto (GDD §3.1, §13.3)
import { useMemo, forwardRef } from 'react'
import { checkerTexture } from './textures'

const MobDyckModel = forwardRef(function MobDyckModel({ refs = {}, tint = '#7fb3d5' }, ref) {
  const checker = useMemo(() => checkerTexture('#dc2626', '#ffffff', 6), [])
  return (
    <group ref={ref}>
      {/* corpo rechonchudo */}
      <group ref={refs.body}>
        <mesh castShadow position={[0, 0.95, 0]} scale={[1, 0.95, 0.92]}>
          <sphereGeometry args={[0.85, 18, 14]} />
          <meshStandardMaterial color={tint} roughness={0.65} />
        </mesh>
        {/* barriga clara */}
        <mesh position={[0, 0.78, 0.42]} scale={[0.78, 0.7, 0.55]}>
          <sphereGeometry args={[0.85, 14, 12]} />
          <meshStandardMaterial color="#f2e8d5" roughness={0.8} />
        </mesh>
        {/* avental xadrez pequeno demais */}
        <mesh position={[0, 0.62, 0.78]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.72, 0.62, 0.06]} />
          <meshStandardMaterial map={checker} />
        </mesh>
        {/* olhos com brilho de estrela */}
        <mesh position={[-0.27, 1.38, 0.62]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.27, 1.38, 0.62]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.25, 1.39, 0.75]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.29, 1.39, 0.75]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-0.22, 1.44, 0.8]}>
          <octahedronGeometry args={[0.035]} />
          <meshBasicMaterial color="#fff7c0" toneMapped={false} />
        </mesh>
        <mesh position={[0.32, 1.44, 0.8]}>
          <octahedronGeometry args={[0.035]} />
          <meshBasicMaterial color="#fff7c0" toneMapped={false} />
        </mesh>
        {/* boca enorme */}
        <mesh ref={refs.mouth} position={[0, 1.08, 0.72]} scale={[1, 0.45, 0.5]}>
          <sphereGeometry args={[0.34, 12, 10]} />
          <meshStandardMaterial color="#7c1d2e" roughness={0.5} />
        </mesh>
        {/* boné de chef torto */}
        <group position={[0.12, 1.78, 0]} rotation={[0, 0, -0.22]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.34, 0.42, 0.22, 12]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <sphereGeometry args={[0.36, 12, 10]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
        </group>
        {/* braços curtos */}
        <mesh ref={refs.armL} position={[-0.82, 0.95, 0.1]} rotation={[0, 0, 0.7]}>
          <capsuleGeometry args={[0.13, 0.4, 4, 8]} />
          <meshStandardMaterial color={tint} />
        </mesh>
        <mesh ref={refs.armR} position={[0.82, 0.95, 0.1]} rotation={[0, 0, -0.7]}>
          <capsuleGeometry args={[0.13, 0.4, 4, 8]} />
          <meshStandardMaterial color={tint} />
        </mesh>
        {/* caudinha de baleia */}
        <group position={[0, 0.9, -0.85]} rotation={[0.5, 0, 0]}>
          <mesh rotation={[0, 0, 0.6]}>
            <coneGeometry args={[0.18, 0.5, 8]} />
            <meshStandardMaterial color={tint} />
          </mesh>
          <mesh rotation={[0, 0, -0.6]}>
            <coneGeometry args={[0.18, 0.5, 8]} />
            <meshStandardMaterial color={tint} />
          </mesh>
        </group>
      </group>
      {/* perninhas ágeis */}
      <mesh ref={refs.legL} position={[-0.3, 0.22, 0]}>
        <capsuleGeometry args={[0.14, 0.3, 4, 8]} />
        <meshStandardMaterial color="#46627a" />
      </mesh>
      <mesh ref={refs.legR} position={[0.3, 0.22, 0]}>
        <capsuleGeometry args={[0.14, 0.3, 4, 8]} />
        <meshStandardMaterial color="#46627a" />
      </mesh>
    </group>
  )
})

export default MobDyckModel

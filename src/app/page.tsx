"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import styles from "./page.module.css";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Button, DialogActions } from '@mui/material'


function STLModel({ url, position, color }: { url: string, position: [number, number, number], color: string }) {
  const modelRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.x += delta * 0.5
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  useEffect(() => {
    const loader = new STLLoader()

    loader.load(url, (geometry: any) => {
      if (modelRef.current) {
        modelRef.current.geometry = geometry
      }
    }, undefined, (error: any) => {
      console.error('An error occurred while loading the STL model:', error)
    })
  }, [url])

  const material = new THREE.MeshStandardMaterial({
    color, // Color plateado
    metalness: 0.8,
    roughness: 0.2,
  })

  return (
    <mesh
      ref={modelRef}
      material={material}
      position={position}
      scale={0.2}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    />
  )
}



function RingCanvas({ url, color }: { url: string, color: string }) {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <Environment preset="studio" />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <STLModel url={url} position={[0, 0, 0]} color={color} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}

export default function RingViewer() {
  const modelUrl = './cat.stl'

  const rings = [
    { id: 1, name: "Silver Ring", color: "silver", price: "$50" },
    { id: 2, name: "Gold Ring", color: "gold", price: "$100" },
    { id: 3, name: "Rose Gold Ring", color: "#b76e79", price: "$75" },
    { id: 4, name: "Platinum Ring", color: "#e5e4e2", price: "$120" },
    { id: 5, name: "Bronze Ring", color: "#cd7f32", price: "$60" },
    { id: 6, name: "Copper Ring", color: "#b87333", price: "$40" },
  ]

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ring Collection</h1>
      <div className={styles.grid}>
        {rings.map((ring) => (
          <div key={ring.id} className={styles.card}>
            <div className={styles.canvasWrapper}>

              <RingCanvas url={modelUrl} color={ring.color} />
            </div>
            <div className={styles.content}>
              <h2 className={styles.cardTitle}>{ring.name}</h2>
              <h1 className={styles.price}>{ring.price}</h1>
            </div>
            <DialogActions>
              <Button onClick={() => { }}>Preview</Button>
              <Button variant="contained" className={styles.btn} onClick={() => {

              }}>
                Add to Cart
              </Button>
            </DialogActions>
          </div>
        ))}
      </div>
    </div>
  )
}
 
"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import styles from "./page.module.css";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Button, DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import IconButton from '@mui/material/IconButton'

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
    color,
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

interface RingType {
  id: number;
  name: string;
  color: string;
  price: number;
  description: string;
}

interface CartItem extends RingType {
  quantity: number;
}

function RingPreview({ ring, onAddToCart, onClose }: { ring: RingType; onAddToCart: (ring: RingType) => void; onClose: () => void }) {
  return (
    <>
      <DialogTitle>{ring.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {ring.description}
        </DialogContentText>
        <div className={styles.canvasWrapper}>
          <RingCanvas url='./cat.stl' color={ring.color} />
        </div>
        <DialogContentText>
          Price: ${ring.price.toFixed(2)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => {
          onAddToCart(ring)
          onClose()
        }}>
          Add to Cart
        </Button>
      </DialogActions>
    </>
  )
}

function CartView({ cart, onUpdateCart, onClose, onCheckout }: { cart: CartItem[]; onUpdateCart: (updatedCart: CartItem[]) => void; onClose: () => void; onCheckout: () => void }) {
  const updateQuantity = (id: number, change: number) => {
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ).filter(item => item.quantity > 0);
    onUpdateCart(updatedCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <DialogTitle>Your Cart</DialogTitle>
      <DialogContent>
        {cart.length === 0 ? (
          <DialogContentText>Your cart is empty.</DialogContentText>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className={`${styles.card} flex items-center justify-between py-2 border-b`}>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center">
                  <IconButton onClick={() => updateQuantity(item.id, -1)} size="small">
                  </IconButton>
                  <span className="mx-2">{item.quantity}</span>
                  <IconButton onClick={() => updateQuantity(item.id, 1)} size="small">
                  </IconButton>
                  <IconButton onClick={() => updateQuantity(item.id, -item.quantity)} size="small" className="ml-2">
                  </IconButton>
                </div>
              </div>
            ))}
            <div className="mt-4 text-right">
              <p className="font-semibold">Total: ${totalPrice.toFixed(2)}</p>
            </div>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onCheckout} disabled={cart.length === 0}>Checkout</Button>
      </DialogActions>
    </>
  )
}

export default function RingViewer() {
  const modelUrl = './cat.stl'
  const rings: RingType[] = [
    { id: 1, name: "Silver Ring", color: "#C0C0C0", price: 99.99, description: "A classic silver ring that never goes out of style." },
    { id: 2, name: "Gold Ring", color: "#FFD700", price: 299.99, description: "A luxurious gold ring that adds a touch of elegance to any outfit." },
    { id: 3, name: "Rose Gold Ring", color: "#B76E79", price: 249.99, description: "A trendy rose gold ring that combines style and sophistication." },
    { id: 4, name: "Platinum Ring", color: "#E5E4E2", price: 499.99, description: "A premium platinum ring known for its durability and shine." },
    { id: 5, name: "Bronze Ring", color: "#CD7F32", price: 79.99, description: "A rustic bronze ring with a unique, antique appeal." },
    { id: 6, name: "Copper Ring", color: "#B87333", price: 59.99, description: "An affordable copper ring with a warm, earthy tone." },
  ]

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedRing, setSelectedRing] = useState<RingType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const addToCart = (ring: RingType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === ring.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === ring.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...prevCart, { ...ring, quantity: 1 }]
      }
    })
  }

  const updateCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart)
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handlePlaceOrder = (formData: any) => {
    console.log('Order placed:', { formData, cart })
    setIsCheckoutOpen(false)
    setCart([])
    alert('Thank you for your order!')
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className="text-xl font-bold">Ring Collection</h1>
        <IconButton onClick={() => setIsCartOpen(true)}>
          {totalItems > 0 && (
            <span className="ml-2">{totalItems} items - ${totalPrice.toFixed(2)}</span>
          )}
        </IconButton>
      </div>
      <div className={styles.grid}>
        {rings.map(ring => (
          <div key={ring.id} className={`${styles.card} p-4 text-center`} >
            <div className={styles.canvasWrapper}>
              <RingCanvas url={modelUrl} color={ring.color} />
            </div>
            <h3 className="font-semibold mt-2">{ring.name}</h3>
            <h1 className="text-gray-500">${ring.price.toFixed(2)}</h1>
            <div className={styles.flex}>
            
              <Button
                variant="outline"
                className={styles.btn2}
                onClick={() => setSelectedRing(ring)}
              >
                Preview
              </Button>
               &nbsp;
              <Button
                onClick={() => addToCart(ring)}
                className={styles.btn}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
      {selectedRing && (
        <Dialog open={Boolean(selectedRing)} onClose={() => setSelectedRing(null)}>
          <RingPreview ring={selectedRing} onAddToCart={addToCart} onClose={() => setSelectedRing(null)} />
        </Dialog>
      )}
      <Dialog open={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <CartView cart={cart} onUpdateCart={updateCart} onClose={() => setIsCartOpen(false)} onCheckout={handleCheckout} />
      </Dialog>
      <Dialog open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}>
        <form onSubmit={handlePlaceOrder}>
          <DialogTitle>Checkout</DialogTitle>
          <DialogContent>
            <DialogContentText>Please enter your details to complete the purchase.</DialogContentText>
            <input type="text" placeholder="Name" className={styles.input} required />
            <input type="email" placeholder="Email" className={styles.input} required />
            <input type="text" placeholder="Address" className={styles.input} required />
            <input type="text" placeholder="City" className={styles.input} required />
            <input type="text" placeholder="ZIP Code" className={styles.input} required />
            <input type="text" placeholder="Credit Card Number" className={styles.input} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCheckoutOpen(false)}>Cancel</Button>
            <Button type="submit">Place Order</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

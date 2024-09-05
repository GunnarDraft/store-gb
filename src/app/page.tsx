"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import styles from "./page.module.css";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Button, DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle, Badge, TextField, Slider, AppBar, Toolbar, Typography, Icon } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useForm } from 'react-hook-form';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGLTF } from '@react-three/drei';


// Catalogs for each input type
const woodTypes = ['Cocobolo Knot', 'Ebony', 'Rosewood', 'Maple Burl', 'Walnut']
const tangTypes = ['Short', 'Full']
const bladeTypes = ['Dagger', 'Chef', 'Hunting', 'Tanto', 'Bowie']
const steelTypes = ['Damascus', 'High Carbon', 'Stainless', 'Pattern Welded', 'Tool Steel']
const lengthOptions = Array.from({ length: 20 }, (_, i) => (i + 1) * 5) // 5cm to 100cm in 5cm increments



type BladeSpecs = {
  id: number;
  wood: string;
  tang: string;
  bladeType: string;
  steel: string;
  length: number;
  // Agrega otras propiedades que tengas en BladeSpecs
};
function Sword(props: any) {
  const group = useRef<THREE.Group>(null);
  const guard = useRef<THREE.Mesh>(null);
  const handle = useRef<THREE.Mesh>(null);
  const blade = useRef<THREE.Mesh>(null);

  const { nodes, materials } = useGLTF('./sax.glb') as any;

  // Animación de rotación simple para el modelo de espada
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) { 
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.cos(t / 1) / 20 + 0.25, 0.1);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(t / 2) / 20, 0.1);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.sin(t / 4) / 20, 0.1);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, (-2 + Math.sin(t / 2)) / 2, 0.1);
    }
  });

  // Mostrar/ocultar partes de la espada basado en los props
  useEffect(() => { 
    if (handle.current) handle.current.visible = props.selectedHandle === 'handle';
    if (blade.current) blade.current.visible = props.selectedBlade === 'blade';
  }, [props.selectedHandle, props.selectedBlade]);

  return (
    <group ref={group} {...props} dispose={null} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.2}>
      {/* blade */}
      <mesh ref={blade} material={materials['Material.002']} geometry={nodes.blade.geometry} position={[0, 0, 0]} />

      {/* handle */}
      <mesh ref={handle} material={materials['Material.001']} geometry={nodes.handle.geometry} position={[0, -8, 0]} />
 
    </group>
  );
}

function BladeDesigner() {
  const [specs, setSpecs] = useState<BladeSpecs>({
    id: 1,
    wood: woodTypes[0],
    tang: tangTypes[0],
    bladeType: bladeTypes[0],
    steel: steelTypes[0],
    length: lengthOptions[2] // Default to 15cm
  })

  const [selectedGuard, setSelectedGuard] = useState('Guard1');
  const [selectedHandle, setSelectedHandle] = useState('handle');
  const [selectedBlade, setSelectedBlade] = useState('blade');

  const handleChange = (event: Event, newValue: number | number[]) => {
    setSpecs(prev => ({ ...prev, length: newValue as number }));
  };


  const handleSelectChange = (name: keyof BladeSpecs, value: string | number, options: (string | number)[]) => {
    const currentIndex = options.indexOf(specs[name]);
    const newIndex = (currentIndex + 1) % options.length
    setSpecs(prev => ({ ...prev, [name]: options[newIndex] }))
  }

  const handleSelectChangeReverse = (name: keyof BladeSpecs, value: string | number, options: (string | number)[]) => {
    const currentIndex = options.indexOf(specs[name])
    const newIndex = (currentIndex - 1 + options.length) % options.length
    setSpecs(prev => ({ ...prev, [name]: options[newIndex] }))
  }

 
  const [cart, setCart] = useState<CartItem[]>([])

  interface KnifeType {
    id: number;
    name: string;
    color: string;
    price: number;
    description: string;
  }



  const SelectWithArrows = ({ name, options, value }: { name: keyof BladeSpecs, options: (string | number)[], value: string | number }) => (
    <div className={styles.flex}>
      <Button
        size="icon"
        variant="outline"
        onClick={() => handleSelectChangeReverse(name, value, options)}
      >
        <KeyboardArrowLeftIcon />
      </Button>
      <div className="flex-grow text-center p-2 border rounded-md">
        {value}
      </div>
      <Button
        size="icon"
        variant="outline"
        onClick={() => handleSelectChange(name, value, options)}
      >
        <KeyboardArrowRightIcon />
      </Button>
    </div>
  )

  return (
    <div className={styles.flex}>
      <div className={styles.flex}>

        <div className={styles.knife}> 
          <Canvas>
            <ambientLight intensity={0.5} />
            <Environment preset="studio" />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <OrbitControls enableZoom={false} enablePan={false}  />
            <Sword selectedGuard={selectedGuard} selectedHandle={selectedHandle} selectedBlade={selectedBlade} />
          </Canvas>
        </div>

      </div>

      <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Custom Blade Designer</h2>
        <div>
          <label className={styles.label}>Wood</label>
          <SelectWithArrows name="wood" options={woodTypes} value={specs.wood} />
        </div>
        <div>
          <label className={styles.label}>Tang</label>
          <SelectWithArrows name="tang" options={tangTypes} value={specs.tang} />
        </div>
        <div>
          <label className={styles.label}>Blade Type</label>
          <SelectWithArrows name="bladeType" options={bladeTypes} value={specs.bladeType} />
        </div>
        <div>
          <label className={styles.label}>Steel</label>
          <SelectWithArrows name="steel" options={steelTypes} value={specs.steel} />
        </div>
        <div>
          <label className={styles.label}>Length (cm)</label>
          <SelectWithArrows name="length" options={lengthOptions} value={specs.length} />
          <Slider aria-label="Volume" name="length"
            value={specs.length}
            min={10} max={110}
            shiftStep={30}
            step={10}
            marks onChange={handleChange} />
        </div>
        <Button
          onClick={() => {}}
          className={styles.btn}
        >
          Add to Cart
        </Button>
      </div>

    </div>
  )
}
function STLModel({ url, position, color }: { url: string, position: [number, number, number], color: string }) {
  const modelRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.x += delta * 0.1
      modelRef.current.rotation.y += delta * 0.2
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
    <Canvas fallback={<div>Sorry no WebGL supported!</div>}>
      <ambientLight intensity={0.5} />
      <Environment preset="studio" />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <OrbitControls enableZoom={false} enablePan={false} />
      <STLModel url={url} position={[0, 0, 0]} color={color} />
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
    <div className={styles.preview} >
      <div className={styles.flex}>
        <div className={styles.previewcanvas}>
          <RingCanvas url={`./${ring.id}.stl`} color={ring.color} />
        </div>
        <DialogContent className={styles.colum}>
          <h1>
            {ring.name}
          </h1>
          <DialogContentText>
            <h2>
              Price: ${ring.price.toFixed(2)} MXN
            </h2>
          </DialogContentText>
          <DialogContentText>
            <h4>
              {ring.description}
            </h4>
          </DialogContentText>
          <br />

          <Button className={styles.btn} onClick={() => {
            onAddToCart(ring)
            onClose()
          }}>
            Add to Cart
          </Button>
          <br />
          <Button className={styles.btn2} onClick={onClose}>Close</Button>
        </DialogContent>
      </div>
    </div>
  )
}

function CartView({ cart, onUpdateCart, onClose, onCheckout, onPreview }: { cart: CartItem[]; onUpdateCart: (updatedCart: CartItem[]) => void; onClose: () => void; onCheckout: () => void; onPreview: (id: any) => void }) {
  const updateQuantity = (id: number, change: number) => {
    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ).filter(item => item.quantity > 0);
    onUpdateCart(updatedCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={styles.view}>
      <DialogTitle>
        <h3>
          Your Cart
        </h3>
      </DialogTitle>
      <DialogContent>
        {cart.length === 0 ? (
          <DialogContentText>Your cart is empty.</DialogContentText>
        ) : (
          <div >
            {cart.map((item) => (
              <div key={item.id} className={styles.card}>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <h2 className="text-sm text-gray-500">${item.price.toFixed(2)} MXN</h2>
                </div>
                <div className={styles.flex}>
                  <Button
                    variant="outline"
                    className={styles.btn2}
                    onClick={() => onPreview(item)}
                  >
                    Preview
                  </Button>
                  <IconButton onClick={() => updateQuantity(item.id, -1)} size="small">
                    <RemoveIcon />
                  </IconButton>
                  <span className="mx-2">{item.quantity}</span>
                  <IconButton onClick={() => updateQuantity(item.id, 1)} size="small">
                    <AddIcon />
                  </IconButton>
                  <IconButton onClick={() => updateQuantity(item.id, -item.quantity)} size="small" className="ml-2">
                    <DeleteOutlineIcon />
                  </IconButton>
                </div>

              </div>

            ))}
            <br />
            <div className="mt-4 text-right">
              <h2 className={styles.text}>Total: ${totalPrice.toFixed(2)}</h2>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className={styles.btn2}>Close</Button>
        <Button onClick={onCheckout} className={styles.btn} disabled={cart.length === 0}>Checkout</Button>
      </DialogActions>
    </div>
  )
}

export default function RingViewer() {
  const rings: RingType[] = [
    { id: 1, name: "Silver Ring", color: "#C0C0C0", price: 1299.99, description: "A classic silver ring that never goes out of style." },
    { id: 2, name: "Gold Ring", color: "#FFD700", price: 4499.99, description: "A luxurious gold ring that adds a touch of elegance to any outfit." },
    { id: 3, name: "Rose Gold Ring", color: "#B76E79", price: 6599.99, description: "A trendy rose gold ring that combines style and sophistication." },
    { id: 4, name: "Platinum Ring", color: "#E5E4E2", price: 9699.99, description: "A premium platinum ring known for its durability and shine." },
    { id: 5, name: "Bronze Ring", color: "#CD7F32", price: 99.99, description: "A rustic bronze ring with a unique, antique appeal." },
    { id: 6, name: "Copper Ring", color: "#B87333", price: 59.99, description: "An affordable copper ring with a warm, earthy tone." },
  ]

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedRing, setSelectedRing] = useState<RingType | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isKnife, setIsKnife] = useState(false)

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
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    handlePlaceOrder(data);
  };
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className={styles.container}>
      <Toolbar className={styles.toolbar}>
        <Button className={styles.btnbase} onClick={() => setIsKnife(false)}>
          Knife
        </Button>
        <Button className={styles.btnbase} onClick={() => setIsKnife(true)}>
          Rings
        </Button>
      </Toolbar>
      <IconButton className={styles.cart} onClick={() => setIsCartOpen(true)}>
        <Badge badgeContent={totalItems} color="primary">
          <ShoppingCartIcon fontSize='large' />
        </Badge>
      </IconButton>


      <svg
        width="800"
        height="64"
        viewBox="-0.5 -0.5 81 7"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <style>
          {`
              .golden-line {
                stroke: #C8AA6E;
                 stroke: url(#gold-gradient);           
                stroke-width: 0.4;           
                fill: none;                 
                stroke-linecap: round;      
                stroke-linejoin: round;
              }
                .gold {
                stroke: #C8AA6E;
                 stroke: url(#gold);           
                stroke-width: 0.4;           
                fill: none;                 
                stroke-linecap: round;      
                stroke-linejoin: round;
              }
            `}
          linear-gradient(top, #a95, #f2f2f2 25%, #ffffff 38%, #c5c5c5 63%, #f7f7f7 87%, #a95);
        </style>

        <defs>
          <linearGradient id="gold-gradient">
            <stop offset="0%" stop-color="#ffd53f" stop-opacity="0.1" />
            <stop offset="5%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="10%" stop-color="#FFEC8B" stop-opacity="1" />
            <stop offset="10.5%" stop-color="#fff8d3" stop-opacity="1" />
            <stop offset="11.5%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="15%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="16%" stop-color="#f0cf14" stop-opacity="1" />
            <stop offset="20%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="25%" stop-color="#FFEC8B" stop-opacity="1" />
            <stop offset="30%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="35%" stop-color="#fdf9ec" stop-opacity="1" />
            <stop offset="35.5%" stop-color="#FFEC8B" stop-opacity="1" />
            <stop offset="40%" stop-color="#ffd53f" stop-opacity="1" />
            <stop offset="45%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="50%" stop-color="#ffd53f" stop-opacity="0.1" />
            <stop offset="55%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="60%" stop-color="#ffd53f" stop-opacity="1" />
            <stop offset="64.5%" stop-color="#FFEC8B" stop-opacity="1" />
            <stop offset="65%" stop-color="#fdf9ec" stop-opacity="1" />
            <stop offset="70%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="75%" stop-color="#FFEC8B" stop-opacity="1" />
            <stop offset="80%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="84%" stop-color="#f0cf14" stop-opacity="1" />
            <stop offset="85%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="88.5%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="89.5%" stop-color="#fff8d3" stop-opacity="1" />
            <stop offset="90%" stop-color="#FFEC8B" stop-opacity="1" />
            <stop offset="95%" stop-color="#FFD700" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffd53f" stop-opacity="0.1" />
          </linearGradient>
          <linearGradient id="gold">
            <stop offset="0%" stop-color=" #FFD700" stop-opacity="1" />
            <stop offset="50%" stop-color=" #ffd53f" stop-opacity="1" />
            <stop offset="100%" stop-color=" #FFD700" stop-opacity="1" />
          </linearGradient>
        </defs>
        <path
          className="golden-line"
          d="M 80 0 H 46 L 40 6 L 34 0 H 0"
        />
        <path
          className="golden-line"
          d="M 75 2 H 42 L 40 0 L 38 2 H 5 "
        />
        <path
          className="gold"
          d="M 40 2 L 39 3 L 40 4 L 41 3 L 40 2 "
        />
      </svg>

      {isKnife ?

        <div className={styles.grid}>
          {rings.map(ring => (
            <div key={ring.id} className={`${styles.card} p-4 text-center`} >
              <div className={styles.canvas}>
                <RingCanvas url={`./${ring.id}.stl`} color={ring.color} />
              </div>
              <h3 className="font-semibold mt-2">{ring.name}</h3>
              <h1 className="text-gray-500">${ring.price.toFixed(2)}</h1>
              <div className={styles.flex}>

                <IconButton
                  className={styles.btn2}
                  onClick={() => setSelectedRing(ring)}
                >
                  <VisibilityIcon />
                </IconButton>
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
        :
        <BladeDesigner />
      }
      {selectedRing && (
        <Dialog open={Boolean(selectedRing)} onClose={() => setSelectedRing(null)}>
          <RingPreview ring={selectedRing} onAddToCart={addToCart} onClose={() => setSelectedRing(null)} />
        </Dialog>
      )}
      <Dialog open={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <CartView
          cart={cart}
          onUpdateCart={updateCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
          onPreview={(ring: any) => setSelectedRing(ring)}
        />
      </Dialog>
      <Dialog open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Checkout</DialogTitle>
          <DialogContent>
            <DialogContentText>Please enter your details to complete the purchase.</DialogContentText>

            <TextField
              type="text"
              placeholder="Name"
              className={styles.input}
              {...register('name', { required: true })}
              error={!!errors.name}
              helperText={errors.name ? 'Name is required' : ''}
            />

            <TextField
              type="email"
              placeholder="Email"
              className={styles.input}
              {...register('email', { required: true })}
              error={!!errors.email}
              helperText={errors.email ? 'Email is required' : ''}
            />

            <TextField
              type="text"
              placeholder="Address"
              className={styles.input}
              {...register('address', { required: true })}
              error={!!errors.address}
              helperText={errors.address ? 'Address is required' : ''}
            />

            <TextField
              type="text"
              placeholder="City"
              className={styles.input}
              {...register('city', { required: true })}
              error={!!errors.city}
              helperText={errors.city ? 'City is required' : ''}
            />

            <TextField
              type="text"
              placeholder="ZIP Code"
              className={styles.input}
              {...register('zipCode', { required: true })}
              error={!!errors.zipCode}
              helperText={errors.zipCode ? 'ZIP Code is required' : ''}
            />

            <TextField
              type="text"
              placeholder="Credit Card Number"
              className={styles.input}
              {...register('creditCardNumber', { required: true })}
              error={!!errors.creditCardNumber}
              helperText={errors.creditCardNumber ? 'Credit Card Number is required' : ''}
            />
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

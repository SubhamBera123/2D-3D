import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { Box, User, Download, Eye } from "lucide-react";

export default function ThreeScene({ children }) {
    const [fpsMode, setFpsMode] = useState(false);
    const keys = useRef({});
    const sceneRef = useRef();

    useEffect(() => {
        const down = (e) => (keys.current[e.code] = true);
        const up = (e) => (keys.current[e.code] = false);

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);

        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const exportGLB = () => {
        const exporter = new GLTFExporter();
        exporter.parse(
            sceneRef.current.children,
            (result) => {
                const blob = new Blob([result], { type: "model/gltf-binary" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "building.glb";
                a.click();
                URL.revokeObjectURL(url);
                alert("Exported as building.glb");
            },
            { binary: true }
        );
    };

    return (
        <div style={{ 
            marginTop: 20,
            maxWidth: '1400px',
            margin: '20px auto'
        }}>
            {/* Header with Controls */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    padding: '25px 35px',
                    background: 'rgba(79, 172, 254, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '25px',
                    border: '2px solid rgba(79, 172, 254, 0.3)',
                    marginBottom: '25px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                    boxShadow: '0 8px 32px rgba(79, 172, 254, 0.2)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <Box size={32} color="#4facfe" strokeWidth={1.5} />
                    </motion.div>
                    <div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#fff',
                            margin: '0 0 5px 0',
                            fontFamily: 'Orbitron, sans-serif'
                        }}>
                            3D Model Viewer
                        </h3>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.9rem',
                            margin: 0
                        }}>
                            Interactive 3D visualization
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <motion.button
                        onClick={() => setFpsMode(!fpsMode)}
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '14px 28px',
                            background: fpsMode 
                                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: fpsMode
                                ? '0 10px 30px rgba(245, 87, 108, 0.4)'
                                : '0 10px 30px rgba(0, 242, 254, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: 'Orbitron, sans-serif',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {fpsMode ? <Eye size={20} /> : <User size={20} />}
                        {fpsMode ? 'Orbit Mode' : 'FPS Mode'}
                    </motion.button>

                    <motion.button
                        onClick={exportGLB}
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '14px 28px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontFamily: 'Orbitron, sans-serif',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Download size={20} />
                        Export .GLB
                    </motion.button>
                </div>
            </motion.div>

            {/* Canvas Container */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    position: 'relative',
                    borderRadius: '25px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(79, 172, 254, 0.1)',
                    border: '3px solid rgba(79, 172, 254, 0.3)',
                    background: 'rgba(15, 15, 35, 0.5)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                <Canvas
                    ref={sceneRef}
                    camera={{ position: [0, 1.6, 5], fov: 75 }}
                    style={{ 
                        width: '100%', 
                        height: '600px',
                        background: 'transparent'
                    }}
                >
                    {!fpsMode && <OrbitControls />}
                    {fpsMode && <PointerLockControls />}

                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 10, 5]} intensity={0.8} />

                    <FPSMovement enabled={fpsMode} keys={keys} />

                    {children}
                </Canvas>
            </motion.div>

            {/* Instructions */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '30px',
                    marginTop: '25px',
                    flexWrap: 'wrap'
                }}
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        padding: '12px 25px',
                        background: 'rgba(0, 242, 254, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '2px solid rgba(0, 242, 254, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem'
                    }}
                >
                    <Eye size={18} color="#00f2fe" />
                    <span><strong>Left-click + drag:</strong> Rotate view</span>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        padding: '12px 25px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '2px solid rgba(102, 126, 234, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem'
                    }}
                >
                    <User size={18} color="#667eea" />
                    <span><strong>WASD:</strong> Move (FPS mode)</span>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        padding: '12px 25px',
                        background: 'rgba(245, 87, 108, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '2px solid rgba(245, 87, 108, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem'
                    }}
                >
                    <Download size={18} color="#f5576c" />
                    <span><strong>Export:</strong> Download as .GLB</span>
                </motion.div>
            </motion.div>
        </div>
    );
}

function FPSMovement({ enabled, keys }) {
    useFrame(({ camera }) => {
        if (!enabled) return;

        const speed = 0.08;

        if (keys.current["KeyW"]) camera.translateZ(-speed);
        if (keys.current["KeyS"]) camera.translateZ(speed);
        if (keys.current["KeyA"]) camera.translateX(-speed);
        if (keys.current["KeyD"]) camera.translateX(speed);

        camera.position.y = 1.6;
    });

    return null;
}

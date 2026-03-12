import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ruler, Target, Check } from "lucide-react";

export default function ScaleCalibration({ image, onScaleComputed }) {
    const canvasRef = useRef(null);
    const [p1, setP1] = useState(null);
    const [p2, setP2] = useState(null);
    const [realDist, setRealDist] = useState("");

    const handleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!p1) setP1({ x, y });
        else if (!p2) setP2({ x, y });
    };

    const computeScale = () => {
        if (!p1 || !p2 || !realDist) return alert("Select 2 points and enter distance!");

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const Dpx = Math.hypot(dx, dy);
        const Dm = parseFloat(realDist);

        const scale = Dm / Dpx; // meters per pixel

        onScaleComputed(scale);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = image;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            ctx.fillStyle = "green";
            if (p1) {
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            if (p2) {
                ctx.beginPath();
                ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    }, [image, p1, p2]);

    return (
        <div style={{ 
            marginTop: 20,
            maxWidth: '1000px',
            margin: '20px auto'
        }}>
            {/* Instruction Banner */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    padding: '20px 30px',
                    background: 'rgba(0, 242, 254, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '2px solid rgba(0, 242, 254, 0.3)',
                    marginBottom: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    boxShadow: '0 8px 32px rgba(0, 242, 254, 0.15)'
                }}
            >
                <Target size={24} color="#00f2fe" />
                <div style={{ color: '#fff' }}>
                    <strong style={{ color: '#00f2fe', fontSize: '1.1rem' }}>Set Scale:</strong>
                    <span style={{ marginLeft: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        Click two points on a known distance and enter the real measurement
                    </span>
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
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 242, 254, 0.1)',
                    border: '3px solid rgba(0, 242, 254, 0.3)'
                }}
            >
                <canvas
                    ref={canvasRef}
                    onClick={handleClick}
                    style={{ 
                        display: 'block',
                        maxWidth: '100%',
                        height: 'auto',
                        cursor: 'crosshair'
                    }}
                />
            </motion.div>

            {/* Input Section */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: '30px',
                    flexWrap: 'wrap'
                }}
            >
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                        position: 'relative'
                    }}
                >
                    <input
                        type="number"
                        placeholder="Distance in meters"
                        value={realDist}
                        onChange={e => setRealDist(e.target.value)}
                        style={{
                            padding: '18px 30px',
                            width: '280px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(0, 242, 254, 0.3)',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'Orbitron, sans-serif',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#00f2fe';
                            e.target.style.boxShadow = '0 0 30px rgba(0, 242, 254, 0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0, 242, 254, 0.3)';
                            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                        }}
                    />
                    <motion.div
                        style={{
                            position: 'absolute',
                            right: '-40px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Ruler size={24} color="#00f2fe" />
                    </motion.div>
                </motion.div>

                <motion.button
                    onClick={computeScale}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '18px 50px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontFamily: 'Orbitron, sans-serif',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Check size={22} />
                    Compute Scale
                </motion.button>
            </motion.div>

            {/* Points Status */}
            {(p1 || p2) && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        marginTop: '25px',
                        flexWrap: 'wrap'
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                            padding: '12px 25px',
                            background: p1 
                                ? 'rgba(0, 242, 254, 0.15)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '15px',
                            border: p1
                                ? '2px solid rgba(0, 242, 254, 0.5)'
                                : '2px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Target size={18} color={p1 ? '#00f2fe' : 'rgba(255,255,255,0.3)'} />
                        <span style={{ 
                            color: p1 ? '#00f2fe' : 'rgba(255,255,255,0.4)',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            Point 1: {p1 ? 'Selected' : 'Click to select'}
                        </span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                            padding: '12px 25px',
                            background: p2 
                                ? 'rgba(245, 87, 108, 0.15)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '15px',
                            border: p2
                                ? '2px solid rgba(245, 87, 108, 0.5)'
                                : '2px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Target size={18} color={p2 ? '#f5576c' : 'rgba(255,255,255,0.3)'} />
                        <span style={{ 
                            color: p2 ? '#f5576c' : 'rgba(255,255,255,0.4)',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            Point 2: {p2 ? 'Selected' : 'Click to select'}
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

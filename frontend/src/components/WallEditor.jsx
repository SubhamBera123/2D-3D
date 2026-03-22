import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Trash2, CheckCircle, Plus, Info, MousePointer2 } from "lucide-react";

export default function WallEditor({ image, walls, onGeometryUpdate }) {

    const canvasRef = useRef(null);

    const [nodes, setNodes] = useState([]);
    const [segments, setSegments] = useState([]);

    const [dragIndex, setDragIndex] = useState(null);
    const [addingWallStart, setAddingWallStart] = useState(null);
    const [manualMode, setManualMode] = useState(false);
    const [autoDetectedWalls, setAutoDetectedWalls] = useState([]);

    // Convert raw walls → nodes + segments
    useEffect(() => {
        if (!image || walls.length === 0) return;

        let localNodes = [];
        let localSegments = [];

        walls.forEach((w, idx) => {
            const n1 = { x: w.x1, y: w.y1 };
            const n2 = { x: w.x2, y: w.y2 };

            const idx1 = localNodes.push(n1) - 1;
            const idx2 = localNodes.push(n2) - 1;

            // Preserve color from backend if it exists
            localSegments.push({ 
                id: idx, 
                n1: idx1, 
                n2: idx2,
                color: w.color || "#8f8f8f"
            });
        });

        setNodes(localNodes);
        setSegments(localSegments);
        setAutoDetectedWalls(localSegments); // Store auto-detected walls
    }, [walls, image]);

    // Draw blueprint + nodes + segments
    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = image;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            // Draw segments
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;

            segments.forEach(s => {
                const n1 = nodes[s.n1];
                const n2 = nodes[s.n2];
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
            });

            // Draw nodes
            nodes.forEach((n, idx) => {
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Visual indicator when adding a wall
            if (addingWallStart) {
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(addingWallStart.x, addingWallStart.y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    };

    useEffect(draw, [nodes, segments, addingWallStart]);

    // Helper: distance to segment
    const distToSegment = (px, py, x1, y1, x2, y2) => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;

        if (len_sq !== 0) param = dot / len_sq;

        let xx, yy;

        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }

        return Math.hypot(px - xx, py - yy);
    };

    // DELETE WALL (Right-click)
    const onRightClick = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        let newSegments = segments.filter(s => {
            const n1 = nodes[s.n1];
            const n2 = nodes[s.n2];
            const d = distToSegment(mx, my, n1.x, n1.y, n2.x, n2.y);
            return d > 6;
        });

        setSegments(newSegments);
    };

    // START ADDING WALL (Double-click)
    const onDoubleClick = (e) => {
        if (!manualMode) return; // Only work in manual mode
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // Get mouse position relative to canvas
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        console.log('Manual Mode - Double Click at:', { x: mx, y: my, canvasSize: { width: canvas.width, height: canvas.height }, displaySize: { width: rect.width, height: rect.height } });

        if (!addingWallStart) {
            setAddingWallStart({ x: mx, y: my });
        } else {
            const ncopy = [...nodes];
            const idx1 = ncopy.push({ ...addingWallStart }) - 1;
            const idx2 = ncopy.push({ x: mx, y: my }) - 1;
            setNodes(ncopy);

            const scopy = [...segments];
            scopy.push({
                id: Date.now(),
                n1: idx1,
                n2: idx2,
                isManual: true // Mark as manually added
            });
            setSegments(scopy);

            setAddingWallStart(null);
        }
    };

    // DRAGGING NODES
    const onMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        nodes.forEach((n, idx) => {
            const dist = Math.hypot(n.x - mx, n.y - my);
            if (dist < 8) {
                setDragIndex(idx);
            }
        });
    };

    const onMouseMove = (e) => {
        if (dragIndex === null) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        let nn = [...nodes];
        nn[dragIndex] = { x: mx, y: my };
        setNodes(nn);
    };

    const onMouseUp = () => setDragIndex(null);

    // Toggle manual mode
    const toggleManualMode = () => {
        if (!manualMode) {
            // Switching to manual mode - clear current walls but save auto-detected
            setAutoDetectedWalls([...segments]);
            setSegments([]);
            setNodes([]);
        } else {
            // Switching back to auto mode - restore auto-detected walls
            if (autoDetectedWalls.length > 0) {
                setSegments(autoDetectedWalls);
                // Rebuild nodes from auto-detected segments
                const newNodes = [];
                autoDetectedWalls.forEach(seg => {
                    if (nodes[seg.n1]) newNodes[seg.n1] = nodes[seg.n1];
                    if (nodes[seg.n2]) newNodes[seg.n2] = nodes[seg.n2];
                });
                setNodes(newNodes);
            }
        }
        setManualMode(!manualMode);
        setAddingWallStart(null);
    };

    // Clear all manual walls and start fresh
    const clearAllWalls = () => {
        setSegments([]);
        setNodes([]);
        setAddingWallStart(null);
    };

    useEffect(() => {
    if (nodes.length && segments.length) {
            onGeometryUpdate(nodes, segments);
        }
    }, [nodes, segments]);


    return (
        <div style={{ 
            marginTop: 20,
            maxWidth: '1200px',
            margin: '20px auto'
        }}>
            {/* Instruction Banner */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    padding: '20px 30px',
                    background: manualMode ? 'rgba(245, 87, 108, 0.1)' : 'rgba(0, 242, 254, 0.1)',
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
                <Info size={24} color="#00f2fe" />
                <div style={{ color: '#fff', flex: 1 }}>
                    <strong style={{ color: '#00f2fe', fontSize: '1.1rem' }}>Edit Walls:</strong>
                    <span style={{ marginLeft: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        {manualMode 
                            ? 'Double-click to add walls • Click two points to create a wall' 
                            : 'Right-click to delete • Drag nodes to adjust'
                        }
                    </span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                        onClick={toggleManualMode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '12px 24px',
                            background: manualMode 
                                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            color: '#fff',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'Orbitron, sans-serif'
                        }}
                    >
                        <MousePointer2 size={18} />
                        {manualMode ? 'Auto Mode' : 'Manual Mode'}
                    </motion.button>

                    {manualMode && (
                        <motion.button
                            onClick={clearAllWalls}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                border: 'none',
                                borderRadius: '50px',
                                color: '#fff',
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontFamily: 'Orbitron, sans-serif'
                            }}
                        >
                            <Trash2 size={18} />
                            Clear All
                        </motion.button>
                    )}
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
                {manualMode && addingWallStart && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={{
                            position: 'absolute',
                            top: addingWallStart.y - 20,
                            left: addingWallStart.x - 80,
                            padding: '8px 16px',
                            background: 'rgba(245, 87, 108, 0.9)',
                            borderRadius: '20px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            pointerEvents: 'none',
                            zIndex: 10,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 15px rgba(245, 87, 108, 0.5)'
                        }}
                    >
                        Click second point →
                    </motion.div>
                )}
                
                <canvas
                    ref={canvasRef}
                    onContextMenu={onRightClick}
                    onDoubleClick={onDoubleClick}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    style={{ 
                        display: 'block',
                        maxWidth: '100%',
                        height: 'auto',
                        cursor: manualMode ? 'crosshair' : 'move'
                    }}
                />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '30px',
                    flexWrap: 'wrap'
                }}
            >
                <motion.button
                    onClick={() => onGeometryUpdate(nodes, segments)}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '16px 40px',
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
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <CheckCircle size={22} />
                    </motion.div>
                    Confirm Walls
                </motion.button>
            </motion.div>

            {/* Stats Display */}
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
                        padding: '15px 30px',
                        background: 'rgba(0, 242, 254, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '2px solid rgba(0, 242, 254, 0.3)',
                        textAlign: 'center',
                        minWidth: '150px'
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                    }}>
                        <Plus size={20} color="#00f2fe" />
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Nodes</span>
                    </div>
                    <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {nodes.length}
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        padding: '15px 30px',
                        background: 'rgba(245, 87, 108, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '2px solid rgba(245, 87, 108, 0.3)',
                        textAlign: 'center',
                        minWidth: '150px'
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                    }}>
                        <Edit3 size={20} color="#f5576c" />
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Segments</span>
                    </div>
                    <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {segments.length}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Check, Plus, Trash2, Move } from "lucide-react";

const roomTypes = [
    "Bedroom",
    "Kitchen",
    "Living Room",
    "Dining",
    "Bathroom",
    "Toilet",
    "Hallway",
    "Balcony",
    "Storage",
    "Other"
];

export default function RoomEditor({ rooms, onAssign, onBackToWalls, onUpdateRoomPosition, blueprintImage, onAddRoom }) {
    
    // Safety check - if no rooms, show message
    if (!rooms || rooms.length === 0) {
        return (
            <div style={{ 
                marginTop: 10,
                maxWidth: '900px',
                margin: '20px auto',
                textAlign: 'center',
                padding: '40px'
            }}>
                <p style={{ color: '#fff', fontSize: '1.2rem' }}>
                    No rooms detected. Click "Back to Edit Walls" and make sure walls form closed shapes.
                </p>
            </div>
        );
    }
    
    return (
        <div style={{ 
            marginTop: 10,
            maxWidth: '900px',
            margin: '20px auto'
        }}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    padding: '25px 35px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '25px',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    marginBottom: '30px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
                }}
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ display: 'inline-block', marginBottom: '15px' }}
                >
                    <Home size={40} color="#667eea" strokeWidth={1.5} />
                </motion.div>
                <h3 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: '0 0 10px 0',
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '1px'
                }}>
                    Assign Room Labels
                </h3>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    Select room types and place labels where you want them!
                </p>
            </motion.div>

            {/* Info Banner */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                    padding: '20px 30px',
                    background: 'rgba(0, 242, 254, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '2px solid rgba(0, 242, 254, 0.3)',
                    textAlign: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 8px 32px rgba(0, 242, 254, 0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}
            >
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        margin: 0
                    }}>
                        ✅ Label all rooms + Drag labels to position them on the floor plan!
                    </p>
                    <p style={{
                        color: 'rgba(0, 242, 254, 0.8)',
                        fontSize: '0.85rem',
                        margin: '8px 0 0 0',
                        fontWeight: '500'
                    }}>
                        📊 {rooms.filter(r => r.type).length} / {rooms.length} rooms labeled
                    </p>
                </div>
                
                <motion.button
                    onClick={onBackToWalls}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        border: 'none',
                        borderRadius: '50px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: 'Orbitron, sans-serif'
                    }}
                >
                    ← Back to Edit Walls
                </motion.button>
            </motion.div>

            {/* Interactive Canvas for Label Placement */}
            <RoomPlacementCanvas 
                rooms={rooms}
                blueprintImage={blueprintImage}
                onAssign={onAssign}
                onUpdatePosition={onUpdateRoomPosition}
                onAddRoom={onAddRoom}
            />

            {/* Room Type Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                {rooms.map((room, idx) => (
                    <RoomTypeCard
                        key={idx}
                        index={idx}
                        room={room}
                        onAssign={onAssign}
                    />
                ))}
            </div>
        </div>
    );
}

// === INTERACTIVE CANVAS FOR LABEL PLACEMENT ===
function RoomPlacementCanvas({ rooms, blueprintImage, onUpdatePosition, onAddRoom }) {
    const canvasRef = useRef(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [imageObj, setImageObj] = useState(null);
    const [addingMode, setAddingMode] = useState(false); // NEW: Toggle mode for adding rooms

    // Load image once
    useEffect(() => {
        if (!blueprintImage) {
            console.warn('No blueprint image provided');
            return;
        }
        
        const img = new Image();
        img.src = blueprintImage;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            console.log('Blueprint image loaded:', { width: img.width, height: img.height });
            setImageObj(img);
        };
        img.onerror = () => {
            console.error('Failed to load blueprint image');
        };
    }, [blueprintImage]);

    // Draw rooms and labels on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageObj) return;
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = imageObj.width;
        canvas.height = imageObj.height;
        
        // Draw blueprint image
        ctx.drawImage(imageObj, 0, 0);
        
        console.log(`Drawing ${rooms.length} rooms on canvas`);
        
        // Draw each room polygon (semi-transparent)
        rooms.forEach((room, idx) => {
            // Only draw polygon if it exists (skip manual rooms)
            if (room.polygon && room.polygon.length > 0) {
                // Random pastel color for each room
                const colors = [
                    'rgba(255, 99, 132, 0.3)',
                    'rgba(54, 162, 235, 0.3)',
                    'rgba(255, 206, 86, 0.3)',
                    'rgba(75, 192, 192, 0.3)',
                    'rgba(153, 102, 255, 0.3)',
                    'rgba(255, 159, 64, 0.3)',
                    'rgba(255, 99, 255, 0.3)',
                    'rgba(99, 255, 132, 0.3)'
                ];
                const color = colors[idx % colors.length];
                
                // Draw polygon
                ctx.beginPath();
                ctx.moveTo(room.polygon[0].x, room.polygon[0].y);
                room.polygon.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            // ALWAYS draw label (for both auto and manual rooms)
            const pos = room.labelPosition || room.center;
            const label = room.type || `Room ${idx + 1}`;
            
            console.log(`Drawing room ${idx} label at:`, pos, 'with text:', label);
            
            // Label background pill
            ctx.font = 'bold 20px Orbitron, sans-serif';
            const textWidth = ctx.measureText(label).width;
            const padding = 15;
            const pillWidth = textWidth + padding * 2;
            const pillHeight = 40;
            
            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(
                pos.x - pillWidth/2 + 3,
                pos.y - pillHeight/2 + 3,
                pillWidth,
                pillHeight
            );
            
            // Background
            const gradient = ctx.createLinearGradient(
                pos.x - pillWidth/2, pos.y - pillHeight/2,
                pos.x + pillWidth/2, pos.y + pillHeight/2
            );
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.9)');
            gradient.addColorStop(1, 'rgba(118, 75, 162, 0.9)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(
                pos.x - pillWidth/2,
                pos.y - pillHeight/2,
                pillWidth,
                pillHeight,
                20
            );
            ctx.fill();
            
            // Text
            ctx.fillStyle = '#fff';
            ctx.fillText(label, pos.x - textWidth/2, pos.y + 7);
            
            // Drag handle (blue dot in center)
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = draggingIndex === idx ? '#ff4444' : '#00f2fe';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }, [rooms, draggingIndex, imageObj]);

    // Handle mouse down on label
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        // Check if clicked on any label
        for (let i = 0; i < rooms.length; i++) {
            const pos = rooms[i].labelPosition || rooms[i].center;
            const dist = Math.sqrt(Math.pow(mx - pos.x, 2) + Math.pow(my - pos.y, 2));
            
            if (dist < 30) { // Within 30px of label center
                setDraggingIndex(i);
                break;
            }
        }
    };

    // Handle drag (update position in real-time for visual feedback)
    const handleMouseMove = (e) => {
        if (draggingIndex === null) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        // Force re-render to show dragging
        // (actual position saved on mouseUp)
    };

    // Handle release
    const handleMouseUp = (e) => {
        if (draggingIndex !== null && onUpdatePosition) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            
            onUpdatePosition(draggingIndex, { x: mx, y: my });
        }
        setDraggingIndex(null);
    };

    // Handle click to add room (when in adding mode)
    const handleCanvasClick = (e) => {
        if (!addingMode || draggingIndex !== null) return;
        
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        console.log('🎯 Adding room at:', { x: mx, y: my, canvasSize: { width: canvas.width, height: canvas.height }, displaySize: { width: rect.width, height: rect.height } });
        
        // Add a new room at this position
        if (onAddRoom) {
            onAddRoom({ x: mx, y: my });
            setAddingMode(false); // Turn off adding mode after adding
            console.log('✅ Room added successfully!');
        } else {
            console.error('onAddRoom function not provided');
        }
    };

    // Handle right-click to add room
    const handleRightClick = (e) => {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        // Add a new room at this position
        if (onAddRoom) {
            onAddRoom({ x: mx, y: my });
        }
    };

    return (
        <div>
            {/* Add Room Mode Toggle Button */}
            <motion.button
                onClick={() => setAddingMode(!addingMode)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    padding: '12px 25px',
                    background: addingMode 
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '50px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: addingMode
                        ? '0 10px 30px rgba(245, 87, 108, 0.4)'
                        : '0 10px 30px rgba(56, 239, 125, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'Orbitron, sans-serif',
                    marginBottom: '15px'
                }}
            >
                <Plus size={20} />
                {addingMode ? '✏️ Click Canvas to Place Room (ESC/Click to Cancel)' : '➕ Add Room Manually'}
            </motion.button>

            {/* Canvas Container */}
            <div style={{
                marginBottom: '20px',
                borderRadius: '20px',
                overflow: 'hidden',
                border: addingMode 
                    ? '3px solid rgba(245, 87, 108, 0.8)'
                    : '3px solid rgba(0, 242, 254, 0.4)',
                boxShadow: addingMode
                    ? '0 0 40px rgba(245, 87, 108, 0.4)'
                    : '0 10px 40px rgba(0, 242, 254, 0.2)'
            }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={handleCanvasClick}
                    onContextMenu={handleRightClick}
                    style={{
                        width: '100%',
                        height: 'auto',
                        cursor: addingMode 
                            ? 'crosshair' 
                            : (draggingIndex !== null ? 'grabbing' : 'grab'),
                        display: 'block'
                    }}
                />
                <div style={{
                    padding: '15px 25px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: addingMode ? '#ff6b9d' : '#00f2fe',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    borderTop: addingMode 
                        ? '2px solid rgba(245, 87, 108, 0.3)'
                        : '2px solid rgba(0, 242, 254, 0.3)'
                }}>
                    {addingMode ? (
                        <span>🎯 <strong>Click anywhere</strong> to place a room label • Press ESC or click button again to cancel</span>
                    ) : (
                        <span>🎯 <strong>Drag blue dots</strong> to move labels • <strong>Right-click</strong> to add room instantly • Use toggle button above for click-to-add mode</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// === SIMPLE ROOM TYPE CARD ===
function RoomTypeCard({ index, room, onAssign }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            style={{
                padding: '20px',
                background: room.type 
                    ? 'rgba(0, 242, 254, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                border: room.type
                    ? '2px solid rgba(0, 242, 254, 0.3)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px'
            }}>
                <Home size={20} color={room.type ? '#00f2fe' : '#999'} />
                <span style={{
                    color: room.type ? '#00f2fe' : '#fff',
                    fontWeight: '600',
                    fontSize: '1rem'
                }}>
                    Room {index + 1}
                </span>
                {room.type && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            marginLeft: 'auto',
                            padding: '4px 10px',
                            background: 'rgba(0, 242, 254, 0.2)',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            color: '#00f2fe',
                            fontWeight: '600'
                        }}
                    >
                        ✓ {room.type}
                    </motion.span>
                )}
            </div>

            <select
                value={room.type || ""}
                onChange={(e) => onAssign(index, e.target.value)}
                style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 15px rgba(102, 126, 234, 0.3)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <option value="">Select room type...</option>
                <option value="Bedroom">🛏️ Bedroom</option>
                <option value="Kitchen">🍳 Kitchen</option>
                <option value="Living Room">🛋️ Living Room</option>
                <option value="Dining">🍽️ Dining</option>
                <option value="Bathroom">🚿 Bathroom</option>
                <option value="Toilet">🚽 Toilet</option>
                <option value="Hallway">🚶 Hallway</option>
                <option value="Balcony">🌿 Balcony</option>
                <option value="Storage">📦 Storage</option>
                <option value="Other">🏠 Other</option>
            </select>
        </motion.div>
    );
}
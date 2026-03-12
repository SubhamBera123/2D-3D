import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Check } from "lucide-react";

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

export default function RoomEditor({ rooms, onAssign }) {
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
                    Select the appropriate room type for each detected area
                </p>
            </motion.div>

            {/* Room Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                padding: '10px'
            }}>
                {rooms.map((room, idx) => (
                    <RoomCard
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

function RoomCard({ index, room, onAssign }) {
    const [isSelected, setIsSelected] = useState(false);
    
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -5 }}
            style={{
                padding: '25px',
                background: room.type
                    ? 'rgba(0, 242, 254, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: room.type
                    ? '2px solid rgba(0, 242, 254, 0.4)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: room.type
                    ? '0 10px 40px rgba(0, 242, 254, 0.2)'
                    : '0 8px 32px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setIsSelected(true)}
            onMouseLeave={() => setIsSelected(false)}
        >
            {/* Gradient Overlay on Hover */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isSelected ? 0.05 : 0 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    pointerEvents: 'none'
                }}
            />

            {/* Room Number Badge */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    color: '#fff',
                    boxShadow: '0 5px 15px rgba(245, 87, 108, 0.4)'
                }}
            >
                {index + 1}
            </motion.div>

            {/* Label */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                }}>
                    <Home size={18} color={room.type ? '#00f2fe' : 'rgba(255,255,255,0.5)'} />
                    <span style={{ 
                        color: room.type ? '#00f2fe' : 'rgba(255,255,255,0.6)',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                    }}>
                        Room {index + 1}
                    </span>
                </div>
                
                {room.type && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            background: 'rgba(0, 242, 254, 0.15)',
                            borderRadius: '20px',
                            marginTop: '10px'
                        }}
                    >
                        <Check size={14} color="#00f2fe" />
                        <span style={{ 
                            color: '#00f2fe',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>
                            {room.type}
                        </span>
                    </motion.div>
                )}
            </div>

            {/* Dropdown */}
            <select
                defaultValue={room.type || ""}
                onChange={(e) => onAssign(index, e.target.value)}
                style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '15px',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '500',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'all 0.3s ease',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '20px'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
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

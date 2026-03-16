// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Box, Ruler, Home as HomeIcon, Layers } from "lucide-react";
import UploadPanel from "../components/UploadPanel.jsx";
import WallEditor from "../components/WallEditor.jsx";
import ScaleCalibration from "../components/ScaleCalibration.jsx";
import ThreeScene from "../components/ThreeScene.jsx";
import WallMesh from "../components/WallMesh.jsx";
import RoomEditor from "../components/RoomEditor.jsx";
import RoomLabel from "../components/RoomLabel.jsx";
import FurnitureObject from "../components/FurnitureObject.jsx";

import { extractRooms } from "../utils/extractRooms.js";
import { getBounding } from "../utils/getBounding.js";
import { computeCentroid } from "../utils/computeCentroid.js";

export default function Home() {

    const [walls, setWalls] = useState([]);
    const [imageURL, setImageURL] = useState(null);

    const [nodes, setNodes] = useState(null);
    const [segments, setSegments] = useState(null);
    const [rooms, setRooms] = useState(null);

    const [scale, setScale] = useState(null);
    const [furniture, setFurniture] = useState([]);

    // Determine current phase
    const getCurrentPhase = () => {
        if (!imageURL || walls.length === 0) return 0;
        if (nodes === null && segments === null) return 1;
        if (rooms && scale === null) return 2;
        if (scale !== null) return 3;
        return 0;
    };

    const currentPhase = getCurrentPhase();

    const phases = [
        { icon: <Box size={20} />, title: "Upload Blueprint", description: "Upload your 2D floor plan" },
        { icon: <Layers size={20} />, title: "Edit Walls", description: "Adjust wall detection" },
        { icon: <HomeIcon size={20} />, title: "Label Rooms", description: "Assign room types" },
        { icon: <Building2 size={20} />, title: "3D View", description: "Explore your 3D model" }
    ];

    const handleWallsDetected = (file, detectedWalls) => {
        setImageURL(URL.createObjectURL(file));
        setWalls(detectedWalls);

        // reset flow
        setNodes(null);
        setSegments(null);
        setRooms(null);
        setScale(null);
        setFurniture([]);
    };

    // PHASE 2 — Extract Rooms AFTER user confirms walls
    useEffect(() => {
        if (!nodes || !segments) return;

        const detected = extractRooms(nodes, segments);

        if (detected.length === 0) {
            const bbox = getBounding(nodes);
            setRooms([{ polygon: bbox, center: computeCentroid(bbox), type: null }]);
        } else {
            setRooms(detected.map(r => ({ ...r, type: null })));
        }
    }, [nodes, segments]);

    const updateRoomType = (index, type) => {
        const updated = [...rooms];
        updated[index].type = type;
        setRooms(updated);
    };

    // center offset for 3D
    let offset = { x: 0, z: 0 };
    if (scale && nodes && segments) {
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        segments.forEach(s => {
            const A = nodes[s.n1];
            const B = nodes[s.n2];

            const wx1 = A.x * scale;
            const wz1 = A.y * scale * -1;

            const wx2 = B.x * scale;
            const wz2 = B.y * scale * -1;

            minX = Math.min(minX, wx1, wx2);
            maxX = Math.max(maxX, wx1, wx2);
            minZ = Math.min(minZ, wz1, wz2);
            maxZ = Math.max(maxZ, wz1, wz2);
        });

        offset = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                padding: '40px 20px',
                maxWidth: '1600px',
                margin: '0 auto',
                position: 'relative'
            }}
        >
            {/* Animated Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '50px',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <motion.div
                    animate={{ 
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        display: 'inline-block',
                        marginBottom: '20px'
                    }}
                >
                    <Building2 size={80} color="#00f2fe" strokeWidth={1.5} />
                </motion.div>
                
                <motion.h1
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 0 40px rgba(102, 126, 234, 0.5)',
                        marginBottom: '15px',
                        fontFamily: 'Orbitron, sans-serif',
                        letterSpacing: '2px'
                    }}
                >
                    2D Blueprint → 3D Converter
                </motion.h1>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        fontSize: '1.1rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}
                >
                    Transform your architectural blueprints into interactive 3D models
                </motion.p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '40px',
                    gap: '20px',
                    flexWrap: 'wrap',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                {phases.map((phase, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                            scale: currentPhase >= index ? 1.05 : 1,
                            opacity: currentPhase >= index ? 1 : 0.4
                        }}
                        whileHover={{ scale: 1.1 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '20px',
                            background: currentPhase >= index 
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            border: currentPhase >= index
                                ? '2px solid rgba(0, 242, 254, 0.3)'
                                : '2px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: currentPhase >= index
                                ? '0 8px 32px rgba(0, 242, 254, 0.2)'
                                : 'none',
                            transition: 'all 0.3s ease',
                            minWidth: '180px'
                        }}
                    >
                        <motion.div
                            animate={currentPhase >= index ? { 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.2, 1]
                            } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{
                                color: currentPhase >= index ? '#00f2fe' : 'rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            {phase.icon}
                        </motion.div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontWeight: '600', 
                                fontSize: '0.9rem',
                                color: currentPhase >= index ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                                marginBottom: '5px'
                            }}>
                                {phase.title}
                            </div>
                            <div style={{ 
                                fontSize: '0.75rem',
                                color: currentPhase >= index ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.2)'
                            }}>
                                {phase.description}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '30px',
                    padding: '40px',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <UploadPanel onWallsDetected={handleWallsDetected} />

                {/* PHASE 1 — WALL EDITOR */}
                {imageURL && walls.length > 0 && nodes === null && segments === null && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <WallEditor
                            image={imageURL}
                            walls={walls}
                            onGeometryUpdate={(n, s) => {
                                setNodes(n);
                                setSegments(s);
                            }}
                        />
                    </motion.div>
                )}

                {/* PHASE 2 — ROOM LABELING */}
                {nodes && segments && rooms && scale === null && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        style={{ marginBottom: '30px' }}
                    >
                        <RoomEditor rooms={rooms} onAssign={updateRoomType} />
                    </motion.div>
                )}

                {/* PHASE 3 — SCALE */}
                {nodes && segments && rooms && scale === null && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    >
                        <ScaleCalibration
                            image={imageURL}
                            onScaleComputed={s => setScale(s)}
                        />
                    </motion.div>
                )}

                {/* PHASE 4 — 3D */}
                {nodes && segments && rooms && scale !== null && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <ThreeScene scale={scale} offset={offset} rooms={rooms}>
                            {segments.map((s, i) => {
                                const A = nodes[s.n1];
                                const B = nodes[s.n2];
                                
                                // Get wall color if available (from backend or manual)
                                const wallColor = s.color || "#8f8f8f";
                                
                                return (
                                    <WallMesh
                                        key={i}
                                        x1={A.x}
                                        y1={A.y}
                                        x2={B.x}
                                        y2={B.y}
                                        height={3}
                                        thickness={0.15}
                                        scale={scale}
                                        offset={offset}
                                        color={wallColor}
                                    />
                                );
                            })}

                            {rooms.map((r, i) => (
                                <RoomLabel
                                    key={i}
                                    text={r.type}
                                    position={[
                                        (r.center.x * scale) - offset.x,
                                        2,
                                        (r.center.y * scale * -1) - offset.z
                                    ]}
                                />
                            ))}

                            {/* Render furniture objects based on room types */}
                            {rooms.map((room, idx) => {
                                if (!room.type) return null;
                                
                                // Add furniture based on room type
                                const furnitureItems = [];
                                const basePos = [
                                    (room.center.x * scale) - offset.x,
                                    0,
                                    (room.center.y * scale * -1) - offset.z
                                ];
                                
                                switch(room.type.toLowerCase()) {
                                    case 'bedroom':
                                        furnitureItems.push(
                                            <FurnitureObject
                                                key={`bed-${idx}`}
                                                type="bed"
                                                position={[basePos[0], basePos[1], basePos[2]]}
                                                scale={1}
                                            />
                                        );
                                        break;
                                    case 'bathroom':
                                        furnitureItems.push(
                                            <FurnitureObject
                                                key={`bathtub-${idx}`}
                                                type="bathtub"
                                                position={[basePos[0] + 1, basePos[1], basePos[2]]}
                                                scale={1}
                                            />
                                        );
                                        break;
                                    case 'toilet':
                                        furnitureItems.push(
                                            <FurnitureObject
                                                key={`toilet-${idx}`}
                                                type="toilet"
                                                position={basePos}
                                                scale={1}
                                            />
                                        );
                                        break;
                                    case 'kitchen':
                                        furnitureItems.push(
                                            <FurnitureObject
                                                key={`fridge-${idx}`}
                                                type="refrigerator"
                                                position={[basePos[0] + 1.5, basePos[1], basePos[2]]}
                                                scale={1}
                                            />
                                        );
                                        break;
                                    case 'living room':
                                        furnitureItems.push(
                                            <FurnitureObject
                                                key={`sofa-${idx}`}
                                                type="sofa"
                                                position={basePos}
                                                scale={1}
                                            />
                                        );
                                        break;
                                    case 'dining':
                                        furnitureItems.push(
                                            <FurnitureObject
                                                key={`table-${idx}`}
                                                type="table"
                                                position={basePos}
                                                scale={1}
                                            />
                                        );
                                        break;
                                    default:
                                        break;
                                }
                                
                                return furnitureItems;
                            })}
                        </ThreeScene>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

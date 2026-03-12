// src/pages/Home.jsx

import { useState, useEffect } from "react";
import UploadPanel from "../components/UploadPanel.jsx";
import WallEditor from "../components/WallEditor.jsx";
import ScaleCalibration from "../components/ScaleCalibration.jsx";
import ThreeScene from "../components/ThreeScene.jsx";
import WallMesh from "../components/WallMesh.jsx";
import RoomEditor from "../components/RoomEditor.jsx";
import RoomLabel from "../components/RoomLabel.jsx";

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

    const handleWallsDetected = (file, detectedWalls) => {
        setImageURL(URL.createObjectURL(file));
        setWalls(detectedWalls);

        // reset flow
        setNodes(null);
        setSegments(null);
        setRooms(null);
        setScale(null);
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
        <div style={{ padding: 20 }}>
            <h2>2D Blueprint → 3D Converter</h2>

            <UploadPanel onWallsDetected={handleWallsDetected} />

            {/* PHASE 1 — WALL EDITOR */}
            {imageURL && walls.length > 0 && nodes === null && segments === null && (
                <WallEditor
                    image={imageURL}
                    walls={walls}
                    onGeometryUpdate={(n, s) => {
                        setNodes(n);
                        setSegments(s);
                    }}
                />
            )}

            {/* PHASE 2 — ROOM LABELING */}
            {nodes && segments && rooms && scale === null && (
                <RoomEditor rooms={rooms} onAssign={updateRoomType} />
            )}

            {/* PHASE 3 — SCALE */}
            {nodes && segments && rooms && scale === null && (
                <ScaleCalibration
                    image={imageURL}
                    onScaleComputed={s => setScale(s)}
                />
            )}

            {/* PHASE 4 — 3D */}
            {nodes && segments && rooms && scale !== null && (
                <ThreeScene scale={scale} offset={offset} rooms={rooms}>
                    {segments.map((s, i) => {
                        const A = nodes[s.n1];
                        const B = nodes[s.n2];
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
                </ThreeScene>
            )}
        </div>
    );
}

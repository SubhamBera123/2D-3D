import { useMemo } from "react";

export default function WallMesh({ x1, y1, x2, y2, height, thickness, scale, offset, color }) {

    const { length, angle, midX, midZ } = useMemo(() => {
        const dx = (x2 - x1) * scale;
        const dz = (y2 - y1) * scale * -1;

        return {
            length: Math.hypot(dx, dz),
            angle: Math.atan2(dz, dx),
            midX: ((x1 + x2) / 2 * scale) - offset.x,
            midZ: (((y1 + y2) / 2 * scale) * -1) - offset.z
        };
    }, [x1, y1, x2, y2, scale, offset]);

    // Use provided color or default gray
    const wallColor = color || "#8f8f8f";

    return (
        <mesh
            position={[midX, height / 2, midZ]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[length, height, thickness]} />
            <meshStandardMaterial 
                color={wallColor} 
                roughness={0.3} 
                metalness={0.8}
                emissive={wallColor}
                emissiveIntensity={0.2}
            />
        </mesh>
    );
}

import { useMemo } from "react";

export default function WallMesh({ x1, y1, x2, y2, height, thickness, scale, offset }) {

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

    return (
        <mesh
            position={[midX, height / 2, midZ]}
            rotation={[0, -angle, 0]}
            castShadow
        >
            <boxGeometry args={[length, height, thickness]} />
            <meshStandardMaterial color="#8f8f8f" roughness={0.8} metalness={0.1} />

        </mesh>
    );
}

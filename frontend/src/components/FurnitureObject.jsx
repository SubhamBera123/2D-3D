import { useMemo } from "react";
import { Box, Cylinder } from "@react-three/drei";

export default function FurnitureObject({ type, position, rotation = [0, 0, 0], scale = 1 }) {
    const furnitureProps = useMemo(() => {
        switch (type.toLowerCase()) {
            case 'bed':
                return {
                    geometry: <boxGeometry args={[2 * scale, 0.5 * scale, 1.8 * scale]} />,
                    material: <meshStandardMaterial color="#4a5568" roughness={0.5} metalness={0.3} />,
                    position: [position[0], position[1], position[2]]
                };
            
            case 'table':
                return {
                    geometry: <boxGeometry args={[1.5 * scale, 0.1 * scale, 1 * scale]} />,
                    material: <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />,
                    position: [position[0], position[1] + 0.75 * scale, position[2]]
                };
            
            case 'chair':
                return {
                    geometry: <group>
                        <mesh position={[0, 0.4, 0]}>
                            <boxGeometry args={[0.5 * scale, 0.8 * scale, 0.5 * scale]} />
                            <meshStandardMaterial color="#654321" roughness={0.6} />
                        </mesh>
                    </group>,
                    material: null,
                    position: [position[0], position[1], position[2]]
                };
            
            case 'sofa':
                return {
                    geometry: <boxGeometry args={[2.5 * scale, 0.8 * scale, 1 * scale]} />,
                    material: <meshStandardMaterial color="#2c5f2d" roughness={0.8} metalness={0.2} />,
                    position: [position[0], position[1] + 0.4 * scale, position[2]]
                };
            
            case 'bathtub':
                return {
                    geometry: <boxGeometry args={[1.8 * scale, 0.6 * scale, 0.8 * scale]} />,
                    material: <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} />,
                    position: [position[0], position[1] + 0.3 * scale, position[2]]
                };
            
            case 'toilet':
                return {
                    geometry: <group>
                        <mesh position={[0, 0.2, 0]}>
                            <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.4 * scale, 16]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.3} />
                        </mesh>
                        <mesh position={[0, 0.5, -0.3]}>
                            <boxGeometry args={[0.4 * scale, 0.3 * scale, 0.2 * scale]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.3} />
                        </mesh>
                    </group>,
                    material: null,
                    position: [position[0], position[1], position[2]]
                };
            
            case 'sink':
                return {
                    geometry: <cylinderGeometry args={[0.4 * scale, 0.4 * scale, 0.2 * scale, 16]} />,
                    material: <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} />,
                    position: [position[0], position[1] + 0.8 * scale, position[2]]
                };
            
            case 'refrigerator':
                return {
                    geometry: <boxGeometry args={[0.8 * scale, 1.8 * scale, 0.8 * scale]} />,
                    material: <meshStandardMaterial color="#e8e8e8" roughness={0.4} metalness={0.6} />,
                    position: [position[0], position[1] + 0.9 * scale, position[2]]
                };
            
            case 'desk':
                return {
                    geometry: <boxGeometry args={[1.8 * scale, 0.1 * scale, 0.8 * scale]} />,
                    material: <meshStandardMaterial color="#a0522d" roughness={0.6} metalness={0.2} />,
                    position: [position[0], position[1] + 0.75 * scale, position[2]]
                };
            
            default:
                // Generic object
                return {
                    geometry: <boxGeometry args={[1 * scale, 1 * scale, 1 * scale]} />,
                    material: <meshStandardMaterial color="#808080" roughness={0.5} metalness={0.5} />,
                    position: [position[0], position[1], position[2]]
                };
        }
    }, [type, position, scale]);

    return (
        <group position={position} rotation={rotation}>
            {furnitureProps.geometry}
            {furnitureProps.material && furnitureProps.material}
        </group>
    );
}

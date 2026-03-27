import { useMemo } from "react";
import * as THREE from "three";

export default function DetectedObject3D({ object, scale = 1 }) {
    const { geometry, material, position, rotation } = useMemo(() => {
        // Convert 2D object to 3D based on type
        const objType = object.type.toLowerCase();
        
        // Base position (converted from 2D canvas to 3D world)
        // Note: You'll need to pass the proper offset and scale from parent
        const baseX = (object.x * scale) || 0;
        const baseZ = (object.y * scale * -1) || 0;
        
        let geom, mat, pos, rot = [0, 0, 0];
        
        // Create 3D geometry based on object type
        switch(objType) {
            case 'bed':
                geom = <boxGeometry args={[2 * scale, 0.5 * scale, 1.8 * scale]} />;
                mat = <meshStandardMaterial color={object.color} roughness={0.5} metalness={0.3} />;
                pos = [baseX, 0.25 * scale, baseZ];
                break;
            
            case 'table':
            case 'round_table':
                if (objType === 'round_table') {
                    geom = <cylinderGeometry args={[0.6 * scale, 0.6 * scale, 0.75 * scale, 32]} />;
                } else {
                    geom = <boxGeometry args={[1.2 * scale, 0.75 * scale, 1.2 * scale]} />;
                }
                mat = <meshStandardMaterial color={object.color} roughness={0.4} metalness={0.5} />;
                pos = [baseX, 0.375 * scale, baseZ];
                break;
            
            case 'chair':
            case 'stool':
                geom = <boxGeometry args={[0.5 * scale, 0.8 * scale, 0.5 * scale]} />;
                mat = <meshStandardMaterial color={object.color} roughness={0.6} metalness={0.2} />;
                pos = [baseX, 0.4 * scale, baseZ];
                break;
            
            case 'sofa':
                geom = <boxGeometry args={[2.5 * scale, 0.8 * scale, 1 * scale]} />;
                mat = <meshStandardMaterial color={object.color} roughness={0.5} metalness={0.2} />;
                pos = [baseX, 0.4 * scale, baseZ];
                break;
            
            case 'bathtub':
                geom = <boxGeometry args={[1.8 * scale, 0.6 * scale, 0.8 * scale]} />;
                mat = <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} />;
                pos = [baseX, 0.3 * scale, baseZ];
                break;
            
            case 'sink':
                geom = <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.2 * scale, 16]} />;
                mat = <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.8} />;
                pos = [baseX, 0.8 * scale, baseZ];
                break;
            
            case 'counter':
            case 'triangle':
                geom = <boxGeometry args={[1.5 * scale, 0.9 * scale, 0.6 * scale]} />;
                mat = <meshStandardMaterial color={object.color} roughness={0.4} metalness={0.3} />;
                pos = [baseX, 0.45 * scale, baseZ];
                break;
            
            default:
                // Generic box for unknown objects
                const width = Math.max(0.5, object.width * scale * 0.01);
                const height = Math.max(0.5, object.height * scale * 0.01);
                geom = <boxGeometry args={[width, height, width]} />;
                mat = <meshStandardMaterial color={object.color} roughness={0.5} metalness={0.3} />;
                pos = [baseX, height / 2, baseZ];
        }
        
        return { geometry: geom, material: mat, position: pos, rotation: rot };
    }, [object, scale]);

    return (
        <group position={position} rotation={rotation}>
            {geometry}
            {material}
        </group>
    );
}

import { Text } from "@react-three/drei";

export default function RoomLabel({ text, position }) {
    if (!text) return null;
    
    return (
        <group position={position}>
            {/* Glow Background */}
            <Text
                position={[0, 0.1, -0.1]}
                fontSize={0.6}
                color="#00f2fe"
                anchorX="center"
                anchorY="middle"
            >
                {text}
            </Text>
            
            {/* Main Text */}
            <Text
                position={[0, 0, 0]}
                fontSize={0.5}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                {text}
            </Text>
        </group>
    );
}

import { Text } from "@react-three/drei";

export default function RoomLabel({ text, position }) {
    if (!text) return null;
    return (
        <Text
            position={position}
            fontSize={0.5}
            color="black"
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    );
}

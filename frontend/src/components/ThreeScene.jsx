import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export default function ThreeScene({ children }) {
    const [fpsMode, setFpsMode] = useState(false);
    const keys = useRef({});
    const sceneRef = useRef();

    useEffect(() => {
        const down = (e) => (keys.current[e.code] = true);
        const up = (e) => (keys.current[e.code] = false);

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);

        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const exportGLB = () => {
        const exporter = new GLTFExporter();
        exporter.parse(
            sceneRef.current.children,
            (result) => {
                const blob = new Blob([result], { type: "model/gltf-binary" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "building.glb";
                a.click();
                URL.revokeObjectURL(url);
                alert("Exported as building.glb");
            },
            { binary: true }
        );
    };

    return (
        <div>
            <button onClick={() => setFpsMode(!fpsMode)}>Toggle FPS</button>
            <button onClick={exportGLB} style={{ marginLeft: "10px" }}>
                Export to .glb
            </button>

            <Canvas
                ref={sceneRef}
                camera={{ position: [0, 1.6, 5], fov: 75 }}
                style={{ width: "100%", height: "600px", background: "#ececec" }}
            >
                {!fpsMode && <OrbitControls />}
                {fpsMode && <PointerLockControls />}

                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={0.8} />

                <FPSMovement enabled={fpsMode} keys={keys} />

                {children}
            </Canvas>
        </div>
    );
}

function FPSMovement({ enabled, keys }) {
    useFrame(({ camera }) => {
        if (!enabled) return;

        const speed = 0.08;

        if (keys.current["KeyW"]) camera.translateZ(-speed);
        if (keys.current["KeyS"]) camera.translateZ(speed);
        if (keys.current["KeyA"]) camera.translateX(-speed);
        if (keys.current["KeyD"]) camera.translateX(speed);

        camera.position.y = 1.6;
    });

    return null;
}

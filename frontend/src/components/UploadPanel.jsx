// src/components/UploadPanel.jsx
import { useState } from "react";
import { uploadBlueprint } from "../api/blueprintAPI";

export default function UploadPanel({ onWallsDetected }) {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) return alert("Select a file first");

        const data = await uploadBlueprint(file);
        console.log("BACKEND RESPONSE:", data);

        // Universal wall extraction — supports walls, segments OR lines
        const walls =
            data.walls ||
            data.segments ||
            data.lines ||
            data.edges ||
            [];

        onWallsDetected(file, walls);
    };

    return (
        <div style={{ padding: 10 }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload} style={{ marginLeft: 10, padding: "6px 14px" }}>
                Upload & Detect Walls
            </button>
        </div>
    );
}

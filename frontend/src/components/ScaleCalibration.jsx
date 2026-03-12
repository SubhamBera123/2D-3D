import { useRef, useState, useEffect } from "react";

export default function ScaleCalibration({ image, onScaleComputed }) {
    const canvasRef = useRef(null);
    const [p1, setP1] = useState(null);
    const [p2, setP2] = useState(null);
    const [realDist, setRealDist] = useState("");

    const handleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!p1) setP1({ x, y });
        else if (!p2) setP2({ x, y });
    };

    const computeScale = () => {
        if (!p1 || !p2 || !realDist) return alert("Select 2 points and enter distance!");

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const Dpx = Math.hypot(dx, dy);
        const Dm = parseFloat(realDist);

        const scale = Dm / Dpx; // meters per pixel

        onScaleComputed(scale);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = image;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            ctx.fillStyle = "green";
            if (p1) {
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            if (p2) {
                ctx.beginPath();
                ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    }, [image, p1, p2]);

    return (
        <div style={{ marginTop: 20 }}>
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                style={{ border: "1px solid #555", cursor: "crosshair" }}
            />

            <div style={{ marginTop: 10 }}>
                <input
                    type="number"
                    placeholder="Distance in meters"
                    value={realDist}
                    onChange={e => setRealDist(e.target.value)}
                />
                <button onClick={computeScale} style={{ marginLeft: 10 }}>
                    Compute Scale
                </button>
            </div>
        </div>
    );
}

import { useEffect, useRef } from "react";

export default function BlueprintOverlay({ blueprintImage, walls }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!blueprintImage || walls.length === 0) return;

        const img = new Image();
        img.src = blueprintImage;

        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            // Draw walls
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;

            walls.forEach(w => {
                ctx.beginPath();
                ctx.moveTo(w.x1, w.y1);
                ctx.lineTo(w.x2, w.y2);
                ctx.stroke();
            });
        };
    }, [blueprintImage, walls]);

    return (
        <div style={{ border: "1px solid #333", marginTop: 20 }}>
            <canvas ref={canvasRef} />
        </div>
    );
}

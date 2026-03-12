import { useEffect, useRef, useState } from "react";

export default function WallEditor({ image, walls, onGeometryUpdate }) {

    const canvasRef = useRef(null);

    const [nodes, setNodes] = useState([]);
    const [segments, setSegments] = useState([]);

    const [dragIndex, setDragIndex] = useState(null);
    const [addingWallStart, setAddingWallStart] = useState(null);

    // Convert raw walls → nodes + segments
    useEffect(() => {
        if (!image || walls.length === 0) return;

        let localNodes = [];
        let localSegments = [];

        walls.forEach((w, idx) => {
            const n1 = { x: w.x1, y: w.y1 };
            const n2 = { x: w.x2, y: w.y2 };

            const idx1 = localNodes.push(n1) - 1;
            const idx2 = localNodes.push(n2) - 1;

            localSegments.push({ id: idx, n1: idx1, n2: idx2 });
        });

        setNodes(localNodes);
        setSegments(localSegments);
    }, [walls, image]);

    // Draw blueprint + nodes + segments
    const draw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = image;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            // Draw segments
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;

            segments.forEach(s => {
                const n1 = nodes[s.n1];
                const n2 = nodes[s.n2];
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
            });

            // Draw nodes
            nodes.forEach((n, idx) => {
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Visual indicator when adding a wall
            if (addingWallStart) {
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(addingWallStart.x, addingWallStart.y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    };

    useEffect(draw, [nodes, segments, addingWallStart]);

    // Helper: distance to segment
    const distToSegment = (px, py, x1, y1, x2, y2) => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;

        if (len_sq !== 0) param = dot / len_sq;

        let xx, yy;

        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }

        return Math.hypot(px - xx, py - yy);
    };

    // DELETE WALL (Right-click)
    const onRightClick = (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let newSegments = segments.filter(s => {
            const n1 = nodes[s.n1];
            const n2 = nodes[s.n2];
            const d = distToSegment(mx, my, n1.x, n1.y, n2.x, n2.y);
            return d > 6;
        });

        setSegments(newSegments);
    };

    // START ADDING WALL (Double-click)
    const onDoubleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (!addingWallStart) {
            setAddingWallStart({ x: mx, y: my });
        } else {
            const ncopy = [...nodes];
            const idx1 = ncopy.push({ ...addingWallStart }) - 1;
            const idx2 = ncopy.push({ x: mx, y: my }) - 1;
            setNodes(ncopy);

            const scopy = [...segments];
            scopy.push({
                id: Date.now(),
                n1: idx1,
                n2: idx2,
            });
            setSegments(scopy);

            setAddingWallStart(null);
        }
    };

    // DRAGGING NODES
    const onMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        nodes.forEach((n, idx) => {
            const dist = Math.hypot(n.x - mx, n.y - my);
            if (dist < 8) {
                setDragIndex(idx);
            }
        });
    };

    const onMouseMove = (e) => {
        if (dragIndex === null) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let nn = [...nodes];
        nn[dragIndex] = { x: mx, y: my };
        setNodes(nn);
    };

    const onMouseUp = () => setDragIndex(null);

    useEffect(() => {
    if (nodes.length && segments.length) {
            onGeometryUpdate(nodes, segments);
        }
    }, [nodes, segments]);


    return (
        <div style={{ marginTop: 20 }}>
            <canvas
                ref={canvasRef}
                onContextMenu={onRightClick}
                onDoubleClick={onDoubleClick}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                style={{ border: "1px solid #333", cursor: "pointer" }}
            />
            <button onClick={() => onGeometryUpdate(nodes, segments)}>
                Confirm Walls
            </button>

        </div>
    );
}

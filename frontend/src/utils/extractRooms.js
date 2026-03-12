export function extractRooms(nodes, segments) {
    const adjacency = {};

    segments.forEach(s => {
        const { n1, n2 } = s;
        if (!adjacency[n1]) adjacency[n1] = [];
        if (!adjacency[n2]) adjacency[n2] = [];
        adjacency[n1].push(n2);
        adjacency[n2].push(n1);
    });

    const visited = new Set();
    const rooms = [];

    function dfs(start, current, path, visitedEdges) {
        adjacency[current].forEach(next => {
            const edge = `${current}-${next}`;
            if (visitedEdges.has(edge)) return;

            visitedEdges.add(edge);
            const newPath = [...path, next];

            if (next === start && newPath.length > 3) {
                rooms.push(newPath);
            } else if (!visited.has(next)) {
                dfs(start, next, newPath, new Set(visitedEdges));
            }
        });
        visited.add(current);
    }

    Object.keys(adjacency).forEach(key => {
        dfs(parseInt(key), parseInt(key), [parseInt(key)], new Set());
    });

    const unique = dedupeRooms(rooms);

    return unique.map(room => ({
        polygon: room.map(idx => nodes[idx]),
        center: computeCentroid(room.map(idx => nodes[idx])),
        type: null
    }));
}

function dedupeRooms(rooms) {
    const unique = [];
    rooms.forEach(r => {
        const sorted = [...r].sort();
        const key = sorted.join("-");
        if (!unique.some(u => [...u].sort().join("-") === key)) {
            unique.push(r);
        }
    });
    return unique;
}

function computeCentroid(points) {
    let x = 0, y = 0;
    points.forEach(p => {
        x += p.x;
        y += p.y;
    });
    return { x: x / points.length, y: y / points.length };
}

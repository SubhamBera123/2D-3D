
export function computeCentroid(poly) {
    let cx = 0, cy = 0;

    poly.forEach(p => {
        cx += p.x;
        cy += p.y;
    });

    return {
        x: cx / poly.length,
        y: cy / poly.length
    };
}

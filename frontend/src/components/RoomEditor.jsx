import { useState } from "react";

const roomTypes = [
    "Bedroom",
    "Kitchen",
    "Living Room",
    "Dining",
    "Bathroom",
    "Toilet",
    "Hallway",
    "Balcony",
    "Storage",
    "Other"
];

export default function RoomEditor({ rooms, onAssign }) {
    return (
        <div style={{ marginTop: 10 }}>
            <h3>Assign Room Labels</h3>
            {rooms.map((room, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                    <span>Room {idx + 1}: </span>
                    <select
                        defaultValue={room.type || ""}
                        onChange={(e) => onAssign(idx, e.target.value)}
                    >
                        <option value=""></option>
                        {roomTypes.map((t) => (
                            <option value={t} key={t}>{t}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
}

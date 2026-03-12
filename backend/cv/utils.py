import math

def are_collinear(l1, l2, angle_thresh=5, dist_thresh=10):
    # Check angle between lines
    angle1 = math.degrees(math.atan2(l1[3]-l1[1], l1[2]-l1[0]))
    angle2 = math.degrees(math.atan2(l2[3]-l2[1], l2[2]-l2[0]))
    if abs(angle1 - angle2) > angle_thresh:
        return False
    return True

def lines_to_json(lines):
    walls = []
    for (x1,y1,x2,y2) in lines:
        walls.append({
            "x1": int(x1),
            "y1": int(y1),
            "x2": int(x2),
            "y2": int(y2)
        })
    return { "walls": walls }

def merge_lines(lines):
    merged = []
    used = set()

    for i in range(len(lines)):
        if i in used: continue
        x1,y1,x2,y2 = lines[i]
        group = [(x1,y1,x2,y2)]
        used.add(i)

        for j in range(i+1, len(lines)):
            if j in used: continue
            if are_collinear(lines[i], lines[j]):
                group.append(lines[j])
                used.add(j)

        # Merge group into single line based on min/max extents
        xs = [l[0] for l in group] + [l[2] for l in group]
        ys = [l[1] for l in group] + [l[3] for l in group]
        merged.append((min(xs), min(ys), max(xs), max(ys)))

    return merged

    

import cv2
import numpy as np

def detect_lines(edge_img):
    lines = cv2.HoughLinesP(edge_img, 1, np.pi/180, threshold=80, minLineLength=40, maxLineGap=10)
    wall_lines = []

    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            wall_lines.append({
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2)
            })

    return wall_lines

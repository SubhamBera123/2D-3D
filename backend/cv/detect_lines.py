import cv2
import numpy as np

def detect_lines(edge_img, original_img=None):
    lines = cv2.HoughLinesP(edge_img, 1, np.pi/180, threshold=80, minLineLength=40, maxLineGap=10)
    wall_lines = []

    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            
            # Extract wall color if original image is provided
            wall_color = "#8f8f8f"  # Default gray
            if original_img is not None:
                # Sample color from midpoint of the line
                mid_x = int((x1 + x2) / 2)
                mid_y = int((y1 + y2) / 2)
                
                # Get color from original image (handle boundaries)
                mid_x = min(max(mid_x, 0), original_img.shape[1] - 1)
                mid_y = min(max(mid_y, 0), original_img.shape[0] - 1)
                
                color_bgr = original_img[mid_y, mid_x]
                # Convert BGR to hex
                wall_color = '#{:02x}{:02x}{:02x}'.format(int(color_bgr[2]), int(color_bgr[1]), int(color_bgr[0]))
            
            wall_lines.append({
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2),
                "color": wall_color
            })

    return wall_lines

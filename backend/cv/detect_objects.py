import cv2
import numpy as np

def detect_objects(original_img, gray_img):
    """
    Detect 2D objects (furniture, fixtures) from the blueprint
    Returns list of detected objects with type, position, and dimensions
    """
    objects = []
    
    # Apply thresholding to get dark objects
    _, thresh = cv2.threshold(gray_img, 50, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for contour in contours:
        # Filter by area (ignore small noise)
        area = cv2.contourArea(contour)
        if area < 500 or area > 50000:  # Adjust thresholds as needed
            continue
        
        # Get bounding box
        x, y, w, h = cv2.boundingRect(contour)
        
        # Get center point
        M = cv2.moments(contour)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
        else:
            cx = x + w // 2
            cy = y + h // 2
        
        # Classify object based on shape and size
        obj_type = classify_object(contour, w, h, area)
        
        # Skip walls (long thin rectangles)
        if obj_type == "wall":
            continue
        
        # Get color from original image
        color = "#ffffff"
        if original_img is not None:
            # Sample color from center of object
            cx_clamped = min(max(cx, 0), original_img.shape[1] - 1)
            cy_clamped = min(max(cy, 0), original_img.shape[0] - 1)
            color_bgr = original_img[cy_clamped, cx_clamped]
            color = '#{:02x}{:02x}{:02x}'.format(int(color_bgr[2]), int(color_bgr[1]), int(color_bgr[0]))
        
        objects.append({
            "type": obj_type,
            "x": cx,
            "y": cy,
            "width": w,
            "height": h,
            "area": area,
            "color": color,
            "rotation": 0  # Can be calculated from contour orientation
        })
    
    return objects

def classify_object(contour, w, h, area):
    """
    Classify object based on its shape and dimensions
    """
    aspect_ratio = w / float(h) if h > 0 else 0
    circularity = 4 * np.pi * area / (cv2.arcLength(contour, True) ** 2) if len(contour) > 0 else 0
    
    # Approximate the contour
    peri = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
    
    # Classification logic
    if len(approx) == 3:
        return "triangle"
    elif len(approx) == 4:
        # Check if it's a rectangle/square
        if 0.8 <= aspect_ratio <= 1.2:
            # Square-ish objects
            if area > 2000:
                return "table"
            else:
                return "stool"
        else:
            # Rectangular objects
            if aspect_ratio > 2.5 or aspect_ratio < 0.4:
                return "wall"  # Long thin rectangle
            elif area > 3000:
                if aspect_ratio > 1:
                    return "bed"
                else:
                    return "counter"
            else:
                return "chair"
    elif len(approx) > 4:
        # Circular or curved objects
        if circularity > 0.7:
            if area > 1500:
                return "round_table"
            else:
                return "sink"
        else:
            # Irregular shapes
            if area > 4000:
                return "sofa"
            else:
                return "bathtub"
    
    return "object"  # Default fallback

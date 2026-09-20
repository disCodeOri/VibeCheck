#!/usr/bin/env python3
"""
OpenCV Face Detection, Color Harmonization, and Seamless Skin Blending
Maps user face photo onto Ready Player Me 3D model head UV map.
Features:
- Haar Cascade face detection with eye localization
- Reinhard LAB color space transfer (eliminates skin tone mismatch and harsh border seams)
- Eye-socket preservation (prevents ghost double-eyes over 3D eyeball meshes)
- Smooth Cosine + Gaussian multi-band alpha feathering
"""

import sys
import json
import base64
import os
import cv2
import numpy as np

def color_transfer(source, target):
    """
    Transfers color statistics from target (3D model skin) to source (user photo)
    in the perceptual LAB color space to ensure perfect skin tone matching.
    """
    src_lab = cv2.cvtColor(source, cv2.COLOR_BGR2LAB).astype(np.float32)
    tar_lab = cv2.cvtColor(target, cv2.COLOR_BGR2LAB).astype(np.float32)

    s_mean, s_std = src_lab.mean(axis=(0, 1)), src_lab.std(axis=(0, 1))
    t_mean, t_std = tar_lab.mean(axis=(0, 1)), tar_lab.std(axis=(0, 1))

    # Avoid zero division
    s_std = np.where(s_std < 1e-4, 1.0, s_std)

    # Scale and shift color channels
    res_lab = (src_lab - s_mean) * (t_std / s_std) + t_mean
    res_lab = np.clip(res_lab, 0, 255).astype(np.uint8)

    return cv2.cvtColor(res_lab, cv2.COLOR_LAB2BGR)

def align_and_blend_face(user_image_bytes, is_male=True):
    # 1. Decode user image
    nparr = np.frombuffer(user_image_bytes, np.uint8)
    user_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if user_img is None:
        raise ValueError("Could not decode user image")

    # 2. Load base head skin texture
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    base_skin_path = os.path.join(base_dir, 'public', 'models', 'male_face.jpg' if is_male else 'female_face.png')
    base_img = cv2.imread(base_skin_path)
    if base_img is None:
        raise ValueError(f"Could not load base skin from {base_skin_path}")

    # Standardize base size to 512x512
    if base_img.shape[0] != 512 or base_img.shape[1] != 512:
        base_img = cv2.resize(base_img, (512, 512), interpolation=cv2.INTER_AREA)

    # 3. Detect face in user photo
    gray = cv2.cvtColor(user_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))

    uh, uw = user_img.shape[:2]

    if len(faces) > 0:
        # Largest detected face
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        fx, fy, fw, fh = faces[0]

        # Add proportional padding (forehead, cheeks, chin)
        pad_x = int(fw * 0.16)
        pad_y = int(fh * 0.18)
        x1 = max(0, fx - pad_x)
        y1 = max(0, fy - pad_y)
        x2 = min(uw, fx + fw + pad_x)
        y2 = min(uh, fy + fh + pad_y)
        face_crop = user_img[y1:y2, x1:x2]
    else:
        # Fallback to square center crop
        crop_size = min(uw, uh)
        cx, cy = uw // 2, uh // 2
        x1 = max(0, cx - crop_size // 2)
        y1 = max(0, cy - crop_size // 2)
        face_crop = user_img[y1:y1 + crop_size, x1:x1 + crop_size]

    # 4. Target face placement on Ready Player Me UV map (512x512):
    # Centered at (254, 184)
    target_w = 224
    target_h = 244
    target_cx = 254
    target_cy = 184

    top_left_x = target_cx - target_w // 2
    top_left_y = target_cy - target_h // 2
    target_roi = base_img[top_left_y:top_left_y + target_h, top_left_x:top_left_x + target_w]

    # 5. Harmonize skin tone with Reinhard color transfer
    harmonized_face = color_transfer(face_crop, target_roi)
    face_resized = cv2.resize(harmonized_face, (target_w, target_h), interpolation=cv2.INTER_CUBIC)

    # 6. Generate smooth multi-band feather mask (smooth cosine rolloff)
    mask = np.zeros((target_h, target_w), dtype=np.float32)
    rx = (target_w / 2.0) * 0.88
    ry = (target_h / 2.0) * 0.88

    for y in range(target_h):
        for x in range(target_w):
            nx = (x - target_w / 2.0) / rx
            ny = (y - target_h / 2.0) / ry
            dist = np.sqrt(nx * nx + ny * ny)
            if dist < 0.60:
                mask[y, x] = 1.0
            elif dist < 1.0:
                mask[y, x] = 0.5 * (1.0 + np.cos(np.pi * (dist - 0.60) / 0.40))
            else:
                mask[y, x] = 0.0

    # 7. Eye Socket Protection:
    # In Ready Player Me, separate 3D eyeball spheres sit at (214, 180) and (298, 180).
    # Soften mask over the eye sockets to allow the 3D model's clean eyes to dominate,
    # preventing creepy "ghost double eyes" or glasses reflections overlapping.
    local_eye_l = (int(214 - top_left_x), int(180 - top_left_y))
    local_eye_r = (int(298 - top_left_x), int(180 - top_left_y))
    
    cv2.circle(mask, local_eye_l, 18, 0.22, -1)
    cv2.circle(mask, local_eye_r, 18, 0.22, -1)

    # Apply Gaussian smoothing to mask
    mask = cv2.GaussianBlur(mask, (21, 21), 7)
    alpha = mask[:, :, np.newaxis]

    # 8. Composite blended ROI back into base skin texture
    blended = base_img.copy()
    blended_roi = (face_resized.astype(np.float32) * alpha + target_roi.astype(np.float32) * (1.0 - alpha)).astype(np.uint8)
    blended[top_left_y:top_left_y + target_h, top_left_x:top_left_x + target_w] = blended_roi

    # 9. Encode to JPEG
    _, encoded = cv2.imencode('.jpg', blended, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
    return base64.b64encode(encoded).decode('utf-8')

if __name__ == '__main__':
    try:
        input_data = sys.stdin.read()
        if not input_data:
            sys.exit(1)

        parsed = json.loads(input_data)
        image_data = parsed.get('image', '')
        is_male = parsed.get('isMale', True)

        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]

        raw_bytes = base64.b64decode(image_data)
        out_b64 = align_and_blend_face(raw_bytes, is_male)

        print(json.dumps({
            "success": True,
            "faceTexture": f"data:image/jpeg;base64,{out_b64}"
        }))
    except Exception as err:
        print(json.dumps({
            "success": False,
            "error": str(err)
        }))
        sys.exit(1)

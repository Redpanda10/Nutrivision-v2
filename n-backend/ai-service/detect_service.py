from flask import Flask, request, jsonify
from ultralytics import YOLO
import numpy as np
import cv2
import base64

app = Flask(__name__)

model = YOLO("best.pt")

@app.route("/detect", methods=["POST"])
def detect():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    img_bytes = file.read()

    # Convert to OpenCV image
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # YOLO prediction
    results = model.predict(source=img, conf=0.25, save=False)
    result = results[0]

    # Annotated image
    annotated_frame = result.plot()

    _, buffer = cv2.imencode(".jpg", annotated_frame)
    encoded_image = base64.b64encode(buffer).decode("utf-8")

    detections = []
    for box in result.boxes:
        detections.append({
            "name": result.names[int(box.cls[0])],
            "confidence": float(box.conf[0])
        })

    return jsonify({
        "detections": detections,
        "annotated_image": encoded_image
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)
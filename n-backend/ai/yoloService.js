// // n-backend/ai/yoloService.js
// const axios = require('axios');
// const FormData = require('form-data');
// const fs = require('fs');

// const runYOLO = async (inputPath) => {
//     try {
//         const form = new FormData();
//         form.append('file', fs.createReadStream(inputPath));

//         const response = await axios.post('http://localhost:5001/detect', form, {
//             headers: { ...form.getHeaders() },
//             timeout: 10000 // 10s timeout
//         });

//         const detections = response.data.detections;

//         if (!detections || detections.length === 0) {
//             return { name: "unknown", confidence: 0 };
//         }

//         // Return the top detection
//         return {
//             name: detections[0].name,
//             confidence: detections[0].confidence,
//             annotatedImage: response.data.annotated_image
//         };
//     } catch (error) {
//         console.error("AI Service Error:", error.message);
//         throw new Error("AI Service is not responding. Make sure Python script is running.");
//     }
// };

// module.exports = { runYOLO };

// n-backend/ai/yoloService.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const runYOLO = async (inputPath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(inputPath));

    const response = await axios.post(
      "http://localhost:5001/detect",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 15000,
      }
    );

    const detections = response.data?.detections || [];

    if (detections.length === 0) {
      return {
        detections: [],
        foods: [],
        annotatedImage: response.data?.annotated_image || null,
      };
    }

    // ✅ STEP 1: keep best confidence per unique food
    const foodMap = new Map();

    detections.forEach((d) => {
      const name = d.name?.toLowerCase()?.trim();
      const confidence = d.confidence || 0;

      if (!name) return;

      if (!foodMap.has(name)) {
        foodMap.set(name, {
          name,
          confidence,
        });
      } else {
        // keep highest confidence detection
        if (confidence > foodMap.get(name).confidence) {
          foodMap.set(name, {
            name,
            confidence,
          });
        }
      }
    });

    // ✅ STEP 2: final structured arrays
    const uniqueDetections = Array.from(foodMap.values());

    const foods = uniqueDetections.map((d) => d.name);

    return {
      detections: uniqueDetections,
      foods, // 👈 IMPORTANT for nutrition loop
      annotatedImage: response.data?.annotated_image || null,
      provider: "yolo-pt-bridge",
    };
  } catch (error) {
    console.error("YOLO Service Error:", error.message);

    throw new Error(
      "YOLO service failed. Make sure Python detection server is running."
    );
  }
};

module.exports = { runYOLO };
const mongoose = require("mongoose");

/* =========================
   MICRONUTRIENTS
========================= */

const nutritionMicroSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      amount: {
        type: Number,
        default: 0,
      },

      unit: {
        type: String,
        trim: true,
        default: "mg",
      },

      percentDaily: {
        type: Number,
        default: 0,
      },
    },
    { _id: false }
  );

/* =========================
   NUTRITION
========================= */

const nutritionSchema =
  new mongoose.Schema(
    {
      caloriesKcal: {
        type: Number,
        min: 0,
        default: 0,
      },

      proteinG: {
        type: Number,
        min: 0,
        default: 0,
      },

      carbsG: {
        type: Number,
        min: 0,
        default: 0,
      },

      fatG: {
        type: Number,
        min: 0,
        default: 0,
      },
      sugarG:{
        type:Number,
        min:0,
        default:0
      },

      vitamins: {
        type: [nutritionMicroSchema],
        default: [],
      },

      minerals: {
        type: [nutritionMicroSchema],
        default: [],
      },

      raw: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        select: false,
      },
    },
    { _id: false }
  );

/* =========================
   RECOGNITION CANDIDATES
========================= */

const recognitionCandidateSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
      },

      externalId: {
        type: String,
        trim: true,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    { _id: false }
  );

/* =========================
   RECOGNITION
========================= */

const recognitionSchema =
  new mongoose.Schema(
    {
      provider: {
        type: String,
        trim: true,
        default: "yolo-onnx",
      },

      externalId: {
        type: String,
        trim: true,
      },

      name: {
        type: String,
        trim: true,
        required: true,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },

      // Better to store URL instead of Base64
      annotatedImage: {
        type: String,
        default: null,
      },

      candidates: {
        type: [
          recognitionCandidateSchema,
        ],
        default: [],
      },
    },
    { _id: false }
  );

/* =========================
   MAIN FOOD HISTORY
========================= */

const foodHistorySchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      capturedImage: {
        type: {
          url: {
            type: String,
            trim: true,
          },

          mimeType: {
            type: String,
            trim: true,
            default: "image/jpeg",
          },

          width: {
            type: Number,
            min: 0,
          },

          height: {
            type: Number,
            min: 0,
          },
        },

        default: {},
      },

      recognition: {
        type: recognitionSchema,
        required: true,
      },

      ingredients: {
        type: [
          {
            type: String,
            trim: true,
          },
        ],

        default: [],
      },

      nutrition: {
        type: nutritionSchema,
        required: true,
      },

      safetyCheck: {
        isSafe: {
          type: Boolean,
          default: true,
        },

        allergensMatched: {
          type: [String],
          default: [],
        },

        warnings: {
          type: [String],
          default: [],
        },
      },

      insights: {
        benefits: {
          type: [String],
          default: [],
        },

        bestTimeToEat: {
          type: [String],
          default: [],
        },

        warnings: {
          type: [String],
          default: [],
        },
      },

      eatenAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    {
      timestamps: true,

      versionKey: false,

      toJSON: {
        virtuals: true,
      },

      toObject: {
        virtuals: true,
      },
    }
  );

/* =========================
   INDEXES
========================= */

foodHistorySchema.index({
  user: 1,
  eatenAt: -1,
});

/* =========================
   PRE SAVE MIDDLEWARE
========================= */

foodHistorySchema.pre(
  "save",
  function(next) {
    if (
      this.recognition &&
      !this.recognition.provider
    ) {
      this.recognition.provider =
        "yolo-onnx";
    }

  }
);

/* =========================
   VIRTUAL IMAGE URL
========================= */

foodHistorySchema.virtual(
  "imageUrl"
).get(function() {
  if (!this.capturedImage?.url) {
    return null;
  }

  if (
    this.capturedImage.url.startsWith(
      "http"
    )
  ) {
    return this.capturedImage.url;
  }

  const baseUrl = (
    process.env.BASE_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");

  return `${baseUrl}${this.capturedImage.url}`;
});

/* =========================
   EXPORT
========================= */

module.exports = mongoose.model(
  "FoodHistory",
  foodHistorySchema
);
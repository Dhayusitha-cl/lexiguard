import express from "express";
import multer from "multer";
import Contract from "../models/Contract.js";
import { protect } from "../middleware/authMiddleware.js";
import { extractText } from "../services/extractText.js";
import { analyzeContract } from "../services/analyzePipeline.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOCX, or TXT allowed"));
  },
});

router.use(protect);

// POST /api/contract/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const rawText = await extractText(req.file);

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        message:
          "Could not extract text. File may be scanned/image. Try a text-based PDF.",
      });
    }

    const contract = await Contract.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      rawText,
      role: req.user.role,
      status: "uploaded",
    });

    res.status(201).json({
      contractId: contract._id,
      fileName: contract.fileName,
      textLength: rawText.length,
      preview: rawText.slice(0, 500),
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// POST /api/contract/analyze
// Body: { contractId, role }
router.post("/analyze", async (req, res) => {
  try {
    const { contractId, role } = req.body;

    const contract = await Contract.findOne({
      _id: contractId,
      userId: req.user._id,
    });
    if (!contract) return res.status(404).json({ message: "Contract not found" });

    const result = await analyzeContract(contract.rawText, role || req.user.role);

    contract.clauses = result.clauses;
    contract.redFlags = result.redFlags;
    contract.summary = result.summary;
    contract.highCount = result.clauses.filter((c) => c.risk === "High").length;
    contract.mediumCount = result.clauses.filter((c) => c.risk === "Medium").length;
    contract.lowCount = result.clauses.filter((c) => c.risk === "Low").length;
    contract.riskScore = Math.round(
      (contract.highCount * 100 +
        contract.mediumCount * 50 +
        contract.lowCount * 10) /
        Math.max(contract.clauses.length, 1)
    );
    contract.role = role || req.user.role;
    contract.status = "analyzed";
    await contract.save();

    res.json(contract);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ message: err.message || "Analysis failed" });
  }
});

// GET /api/contract/history
router.get("/history", async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user._id })
      .select("-rawText -clauses")
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/contract/:id
router.get("/:id", async (req, res) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!contract) return res.status(404).json({ message: "Not found" });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/contract/compare
router.post("/compare", async (req, res) => {
  try {
    const { contractIdA, contractIdB } = req.body;
    const [a, b] = await Promise.all([
      Contract.findOne({ _id: contractIdA, userId: req.user._id }),
      Contract.findOne({ _id: contractIdB, userId: req.user._id }),
    ]);
    if (!a || !b) return res.status(404).json({ message: "Contract not found" });

    res.json({
      a: {
        id: a._id,
        fileName: a.fileName,
        riskScore: a.riskScore,
        highCount: a.highCount,
        mediumCount: a.mediumCount,
        lowCount: a.lowCount,
        summary: a.summary,
        redFlags: a.redFlags,
      },
      b: {
        id: b._id,
        fileName: b.fileName,
        riskScore: b.riskScore,
        highCount: b.highCount,
        mediumCount: b.mediumCount,
        lowCount: b.lowCount,
        summary: b.summary,
        redFlags: b.redFlags,
      },
      delta: {
        riskScore: b.riskScore - a.riskScore,
        highCount: b.highCount - a.highCount,
        saferContractId:
          a.riskScore < b.riskScore ? a._id : b._id,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/contract/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Contract.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
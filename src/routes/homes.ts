import { Router } from "express";
import { z } from "zod";
import { db } from "../config/firebase";
import { Home } from "../types";
import { AuthedRequest } from "../middleware/auth";

const router = Router();

const createHomeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1)
});

// GET /homes - list homes for authenticated user only
router.get("/", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`[GET /homes] Fetching homes for userId: ${userId}`);

    const snapshot = await db.collection("homes")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    console.log(`[GET /homes] Found ${snapshot.docs.length} homes`);

    const homes: Home[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(`[GET /homes] Home document:`, {
        id: doc.id,
        name: data.name,
        address: data.address,
        userId: data.userId,
        createdAt: data.createdAt
      });
      return {
        id: doc.id,
        name: data.name,
        address: data.address,
        userId: data.userId,
        createdAt: data.createdAt
      };
    });
    console.log(`[GET /homes] Returning:`, homes);
    res.json(homes);
  } catch (err) {
    console.error("Error fetching homes", err);
    res.status(500).json({ error: "Failed to fetch homes" });
  }
});

// POST /homes - create a new home for authenticated user
router.post("/", async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = createHomeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const now = new Date().toISOString();
    const docRef = await db.collection("homes").add({
      name: parsed.data.name,
      address: parsed.data.address,
      userId: userId,
      createdAt: now
    });

    const home: Home = {
      id: docRef.id,
      name: parsed.data.name,
      address: parsed.data.address,
      userId: userId,
      createdAt: now
    };

    console.log(`[POST /homes] Created home:`, home);
    res.status(201).json(home);
  } catch (err) {
    console.error("Error creating home", err);
    res.status(500).json({ error: "Failed to create home" });
  }
});

// DELETE /homes/:id - delete a home (only if owned by user)
router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check ownership before deleting
    const docRef = db.collection("homes").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Home not found" });
    }

    const data = doc.data();
    if (data?.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own homes" });
    }

    await docRef.delete();
    console.log(`[DELETE /homes] Deleted home ${id} by user ${userId}`);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting home", err);
    res.status(500).json({ error: "Failed to delete home" });
  }
});

export default router;
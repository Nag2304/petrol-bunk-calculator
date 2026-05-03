import express from "express";
import { z } from "zod";
import pool from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { aggregateRecords, defaultNozzles } from "../utils/defaults.js";

const router = express.Router();

const nozzleSchema = z.object({
  nozzleName: z.string().min(1),
  fuelType: z.enum(["Petrol", "Diesel"]),
  closeReading: z.coerce.number(),
  openReading: z.coerce.number(),
  testingLitres: z.coerce.number(),
  ratePerLitre: z.coerce.number()
});

const recordSchema = z.object({
  notes: z.string().default(""),
  nozzles: z.array(nozzleSchema).min(1)
});

router.use(requireAuth);

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function normalizeNozzle(row) {
  return {
    nozzleName: row.nozzleName,
    fuelType: row.fuelType,
    closeReading: Number(row.closeReading),
    openReading: Number(row.openReading),
    testingLitres: Number(row.testingLitres),
    ratePerLitre: Number(row.ratePerLitre)
  };
}

router.get("/records/:date", async (request, response) => {
  const { date } = request.params;
  const recordResult = await pool.query(
    "SELECT id, notes FROM daily_records WHERE user_id = $1 AND record_date = $2",
    [request.user.id, date]
  );

  if (!recordResult.rowCount) {
    return response.json({ record: { notes: "", nozzles: defaultNozzles } });
  }

  const record = recordResult.rows[0];
  const nozzleResult = await pool.query(
    `SELECT nozzle_name AS "nozzleName", fuel_type AS "fuelType", close_reading AS "closeReading",
            open_reading AS "openReading", testing_litres AS "testingLitres", rate_per_litre AS "ratePerLitre"
       FROM nozzle_entries
      WHERE daily_record_id = $1
      ORDER BY id ASC`,
    [record.id]
  );

  response.json({ record: { notes: record.notes, nozzles: nozzleResult.rows.map(normalizeNozzle) } });
});

router.put("/records/:date", async (request, response) => {
  const parsed = recordSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({ message: "Invalid record payload" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const recordInsert = await client.query(
      `INSERT INTO daily_records (user_id, record_date, notes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, record_date)
       DO UPDATE SET notes = EXCLUDED.notes, updated_at = NOW()
       RETURNING id`,
      [request.user.id, request.params.date, parsed.data.notes]
    );

    const recordId = recordInsert.rows[0].id;
    await client.query("DELETE FROM nozzle_entries WHERE daily_record_id = $1", [recordId]);

    for (const nozzle of parsed.data.nozzles) {
      await client.query(
        `INSERT INTO nozzle_entries
          (daily_record_id, nozzle_name, fuel_type, close_reading, open_reading, testing_litres, rate_per_litre)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          recordId,
          nozzle.nozzleName,
          nozzle.fuelType,
          nozzle.closeReading,
          nozzle.openReading,
          nozzle.testingLitres,
          nozzle.ratePerLitre
        ]
      );
    }

    await client.query("COMMIT");
    response.json({ message: "Record saved" });
  } catch (error) {
    await client.query("ROLLBACK");
    response.status(500).json({ message: "Unable to save record" });
  } finally {
    client.release();
  }
});

router.get("/dashboard/summary", async (request, response) => {
  const month = request.query.month;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return response.status(400).json({ message: "Month is required in YYYY-MM format" });
  }

  const result = await pool.query(
    `SELECT dr.record_date AS "recordDate", dr.notes,
            ne.nozzle_name AS "nozzleName", ne.fuel_type AS "fuelType",
            ne.close_reading AS "closeReading", ne.open_reading AS "openReading",
            ne.testing_litres AS "testingLitres", ne.rate_per_litre AS "ratePerLitre"
       FROM daily_records dr
       LEFT JOIN nozzle_entries ne ON ne.daily_record_id = dr.id
      WHERE dr.user_id = $1
        AND TO_CHAR(dr.record_date, 'YYYY-MM') = $2
      ORDER BY dr.record_date ASC, ne.id ASC`,
    [request.user.id, month]
  );

  const grouped = new Map();
  result.rows.forEach((row) => {
    const recordDate = normalizeDate(row.recordDate);
    if (!grouped.has(recordDate)) {
      grouped.set(recordDate, { recordDate, notes: row.notes, nozzles: [] });
    }
    if (row.nozzleName) {
      grouped.get(recordDate).nozzles.push(normalizeNozzle(row));
    }
  });

  const records = [...grouped.values()];
  const totals = aggregateRecords(records);
  const days = records.map((record) => ({
    recordDate: record.recordDate,
    totalAmount: aggregateRecords([record]).overall.amount
  }));

  response.json({ totals, days });
});

export default router;

export const defaultNozzles = [
  { nozzleName: "Nozzle 1", fuelType: "Petrol", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 110.34 },
  { nozzleName: "Nozzle 2", fuelType: "Diesel", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 98.22 },
  { nozzleName: "Nozzle 3", fuelType: "Diesel", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 98.22 },
  { nozzleName: "Nozzle 4", fuelType: "Petrol", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 110.34 }
];

export function computeMetrics(nozzle) {
  const closeReading = Number(nozzle.closeReading || 0);
  const openReading = Number(nozzle.openReading || 0);
  const testingLitres = Number(nozzle.testingLitres || 0);
  const ratePerLitre = Number(nozzle.ratePerLitre || 0);
  const gross = closeReading - openReading;
  const net = gross - testingLitres;
  const amount = Number((net * ratePerLitre).toFixed(2));
  return { gross, net, amount, testing: testingLitres };
}

export function aggregateRecords(records) {
  const totals = {
    overall: { gross: 0, testing: 0, net: 0, amount: 0 },
    petrol: { gross: 0, testing: 0, net: 0, amount: 0 },
    diesel: { gross: 0, testing: 0, net: 0, amount: 0 }
  };

  records.forEach((record) => {
    record.nozzles.forEach((nozzle) => {
      const metrics = computeMetrics(nozzle);
      const bucket = nozzle.fuelType === "Petrol" ? totals.petrol : totals.diesel;
      totals.overall.gross += metrics.gross;
      totals.overall.testing += metrics.testing;
      totals.overall.net += metrics.net;
      totals.overall.amount += metrics.amount;
      bucket.gross += metrics.gross;
      bucket.testing += metrics.testing;
      bucket.net += metrics.net;
      bucket.amount += metrics.amount;
    });
  });

  for (const key of ["overall", "petrol", "diesel"]) {
    totals[key].gross = Number(totals[key].gross.toFixed(3));
    totals[key].testing = Number(totals[key].testing.toFixed(3));
    totals[key].net = Number(totals[key].net.toFixed(3));
    totals[key].amount = Number(totals[key].amount.toFixed(2));
  }

  return totals;
}

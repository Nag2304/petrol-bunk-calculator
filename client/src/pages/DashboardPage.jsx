import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api";
import BrandMark from "../components/BrandMark";
import PageFooter from "../components/PageFooter";
import { useAuth } from "../context/AuthContext";

const defaultNozzles = [
  { nozzleName: "Nozzle 1", fuelType: "Petrol", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 110.34 },
  { nozzleName: "Nozzle 2", fuelType: "Diesel", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 98.22 },
  { nozzleName: "Nozzle 3", fuelType: "Diesel", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 98.22 },
  { nozzleName: "Nozzle 4", fuelType: "Petrol", closeReading: 0, openReading: 0, testingLitres: 0, ratePerLitre: 110.34 }
];

function calculateNozzle(nozzle) {
  const gross = Number(nozzle.closeReading || 0) - Number(nozzle.openReading || 0);
  const sold = gross - Number(nozzle.testingLitres || 0);
  const amount = Number((sold * Number(nozzle.ratePerLitre || 0)).toFixed(2));
  return { gross, sold, amount };
}

function aggregateNozzles(nozzles) {
  return nozzles.reduce(
    (accumulator, nozzle) => {
      const metrics = calculateNozzle(nozzle);
      const fuelKey = nozzle.fuelType === "Petrol" ? "petrol" : "diesel";
      accumulator.overall.gross += metrics.gross;
      accumulator.overall.testing += Number(nozzle.testingLitres || 0);
      accumulator.overall.net += metrics.sold;
      accumulator.overall.amount += metrics.amount;
      accumulator[fuelKey].gross += metrics.gross;
      accumulator[fuelKey].testing += Number(nozzle.testingLitres || 0);
      accumulator[fuelKey].net += metrics.sold;
      accumulator[fuelKey].amount += metrics.amount;
      return accumulator;
    },
    {
      overall: { gross: 0, testing: 0, net: 0, amount: 0 },
      petrol: { gross: 0, testing: 0, net: 0, amount: 0 },
      diesel: { gross: 0, testing: 0, net: 0, amount: 0 }
    }
  );
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  }).format(value || 0);
}

function litres(value) {
  return `${Number(value || 0).toFixed(3)} L`;
}

export default function DashboardPage() {
  const { auth, logout } = useAuth();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [summary, setSummary] = useState(null);
  const [record, setRecord] = useState({ notes: "", nozzles: defaultNozzles });
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  useEffect(() => {
    loadSummary();
  }, [month]);

  useEffect(() => {
    loadRecord(selectedDate);
  }, [selectedDate]);

  async function loadSummary() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));
    try {
      const data = await api.getSummary(auth.token, month);
      setSummary(data);
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, loading: false }));
    }
  }

  async function loadRecord(date) {
    try {
      const data = await api.getRecord(auth.token, date);
      setRecord({
        notes: data.record.notes || "",
        nozzles: data.record.nozzles?.length ? data.record.nozzles : defaultNozzles
      });
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  async function saveRecord() {
    setStatus((current) => ({ ...current, saving: true, error: "" }));
    try {
      await api.saveRecord(auth.token, selectedDate, record);
      await Promise.all([loadSummary(), loadRecord(selectedDate)]);
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    } finally {
      setStatus((current) => ({ ...current, saving: false }));
    }
  }

  const totals = useMemo(() => aggregateNozzles(record.nozzles), [record.nozzles]);
  const pieData = [
    { name: "Petrol", value: totals.petrol.amount, color: "#f4b544" },
    { name: "Diesel", value: totals.diesel.amount, color: "#0f7b5f" }
  ];

  const dayMap = useMemo(() => {
    const map = new Map();
    summary?.days?.forEach((day) => map.set(day.recordDate, day));
    return map;
  }, [summary]);

  const monthDate = parseISO(`${month}-01`);
  const calendarDays = [];
  let cursor = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  while (cursor <= calendarEnd) {
    calendarDays.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const shareText = encodeURIComponent(
    `Petrol Bunk Summary for ${selectedDate}
Petrol gross: ${litres(totals.petrol.gross)}
Diesel gross: ${litres(totals.diesel.gross)}
Petrol amount: ${currency(totals.petrol.amount)}
Diesel amount: ${currency(totals.diesel.amount)}
Total collection: ${currency(totals.overall.amount)}`
  );

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="dashboard-brand">
          <BrandMark compact />
          <div>
          <span className="pill">Operations dashboard</span>
          <h1>Petrol Bunk Calculator</h1>
          <p>Track nozzle performance, monthly trends, and day-wise collections with secure accounts and database-backed records.</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <strong>{auth.user.name}</strong>
            <span>{auth.user.email}</span>
          </div>
          <button className="ghost-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      {status.error ? <p className="form-error banner-error">{status.error}</p> : null}

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Overall tracker</h2>
              <p>Monthly fuel-wise collection split from the database.</p>
            </div>
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => currency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {pieData.map((entry) => (
                <div className="legend-item" key={entry.name}>
                  <span className="legend-dot" style={{ backgroundColor: entry.color }} />
                  <div>
                    <strong>{entry.name}</strong>
                    <small>{currency(entry.value)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <span>Total collection</span>
              <strong>{currency(summary?.totals?.overall?.amount || 0)}</strong>
            </article>
            <article className="stat-card">
              <span>Petrol gross</span>
              <strong>{litres(summary?.totals?.petrol?.gross || 0)}</strong>
            </article>
            <article className="stat-card">
              <span>Diesel gross</span>
              <strong>{litres(summary?.totals?.diesel?.gross || 0)}</strong>
            </article>
            <article className="stat-card">
              <span>Tracked days</span>
              <strong>{summary?.days?.length || 0}</strong>
            </article>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Calendar tracker</h2>
              <p>Select any date to view or update the day-wise nozzle sheet.</p>
            </div>
          </div>

          <div className="calendar-grid week-head">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const snapshot = dayMap.get(key);
              const active = selectedDate === key;
              return (
                <button
                  className={`calendar-cell ${!isSameMonth(day, monthDate) ? "muted-day" : ""} ${active ? "active-day" : ""} ${
                    isToday(day) ? "today-cell" : ""
                  }`}
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  type="button"
                >
                  <strong>{format(day, "d")}</strong>
                  <small>{snapshot ? currency(snapshot.totalAmount) : "No entry"}</small>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="entry-layout">
        <div className="panel entry-panel">
          <div className="panel-header">
            <div>
              <h2>Daily nozzle sheet</h2>
              <p>Selected date: {selectedDate}</p>
            </div>
            <button className="primary-button" disabled={status.saving} onClick={saveRecord} type="button">
              {status.saving ? "Saving..." : "Save day record"}
            </button>
          </div>

          <div className="nozzle-grid">
            {record.nozzles.map((nozzle, index) => {
              const metrics = calculateNozzle(nozzle);
              return (
                <article className="nozzle-card" key={nozzle.nozzleName}>
                  <div className="nozzle-header">
                    <div>
                      <span className="pill small-pill">{nozzle.fuelType}</span>
                      <h3>{nozzle.nozzleName}</h3>
                    </div>
                  </div>
                  <div className="field-grid">
                    <label>
                      Fuel
                      <select
                        value={nozzle.fuelType}
                        onChange={(event) => updateNozzle(index, "fuelType", event.target.value)}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                      </select>
                    </label>
                    <label>
                      Close
                      <input
                        type="number"
                        value={nozzle.closeReading}
                        onChange={(event) => updateNozzle(index, "closeReading", event.target.value)}
                      />
                    </label>
                    <label>
                      Open
                      <input
                        type="number"
                        value={nozzle.openReading}
                        onChange={(event) => updateNozzle(index, "openReading", event.target.value)}
                      />
                    </label>
                    <label>
                      Testing
                      <input
                        type="number"
                        value={nozzle.testingLitres}
                        onChange={(event) => updateNozzle(index, "testingLitres", event.target.value)}
                      />
                    </label>
                    <label>
                      Rate / litre
                      <input
                        type="number"
                        value={nozzle.ratePerLitre}
                        onChange={(event) => updateNozzle(index, "ratePerLitre", event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="mini-stats">
                    <div>
                      <span>Gross</span>
                      <strong>{litres(metrics.gross)}</strong>
                    </div>
                    <div>
                      <span>Net sold</span>
                      <strong>{litres(metrics.sold)}</strong>
                    </div>
                    <div>
                      <span>Amount</span>
                      <strong>{currency(metrics.amount)}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <label className="notes-field">
            Notes
            <textarea
              rows="4"
              value={record.notes}
              onChange={(event) => setRecord({ ...record, notes: event.target.value })}
              placeholder="Shift notes, special testing, or supervisor remarks"
            />
          </label>
        </div>

        <div className="panel summary-panel">
          <div className="panel-header">
            <div>
              <h2>Day summary</h2>
              <p>Fuel-wise totals generated instantly from the nozzle sheet.</p>
            </div>
          </div>
          <div className="summary-stack">
            <article className="summary-band petrol-band">
              <span>Petrol</span>
              <strong>{currency(totals.petrol.amount)}</strong>
              <small>{litres(totals.petrol.gross)} gross | {litres(totals.petrol.net)} net</small>
            </article>
            <article className="summary-band diesel-band">
              <span>Diesel</span>
              <strong>{currency(totals.diesel.amount)}</strong>
              <small>{litres(totals.diesel.gross)} gross | {litres(totals.diesel.net)} net</small>
            </article>
            <article className="summary-band total-band">
              <span>Overall collection</span>
              <strong>{currency(totals.overall.amount)}</strong>
              <small>{litres(totals.overall.gross)} gross | {litres(totals.overall.net)} net</small>
            </article>
          </div>

          <div className="share-box">
            <h3>Share today&apos;s summary</h3>
            <p>Quick send options for WhatsApp and email from the homepage.</p>
            <div className="share-actions">
              <a
                className="primary-button"
                href={`https://wa.me/?text=${shareText}`}
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>
              <a
                className="ghost-button"
                href={`mailto:?subject=Petrol Bunk Summary ${selectedDate}&body=${shareText}`}
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );

  function updateNozzle(index, field, value) {
    setRecord((current) => ({
      ...current,
      nozzles: current.nozzles.map((nozzle, nozzleIndex) =>
        nozzleIndex === index ? { ...nozzle, [field]: value } : nozzle
      )
    }));
  }
}

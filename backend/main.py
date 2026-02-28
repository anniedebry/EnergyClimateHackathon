from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path

app = FastAPI()

# Allow your React frontend to talk to this backend
origins = [
    "http://localhost:3000",  # React
    "http://localhost:5173",  # Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to your CSV file
CSV_FILE = Path("PACE.csv")

# Global dataframe variable
df = None

# Note we can change year span. general df that we run stuff on.
def load_data():
    global df

    if not CSV_FILE.exists():
        raise FileNotFoundError(f"CSV file not found: {CSV_FILE}")

    df = pd.read_csv(CSV_FILE, low_memory=False)
    df.columns = df.columns.str.strip()

    df['Local date'] = pd.to_datetime(df['Local date'], format='%d%b%Y')

    columns_to_clean = [
        "Demand",
        "Demand forecast",
        "Adjusted COL Gen",
        "Adjusted NG Gen",
        "Adjusted NUC Gen",
        "Adjusted OIL Gen",
        "Adjusted GEO Gen",
        "Adjusted WAT Gen",
        "Adjusted PS Gen",
        "Adjusted SUN Gen",
        "Adjusted SNB Gen",
        "Adjusted WND Gen",
        "Adjusted WNB Gen",
        "Adjusted BAT Gen",
        "Adjusted OES Gen",
        "Adjusted UES Gen",
        "Adjusted OTH Gen",
        "Adjusted UNK Gen",
        "AZPS",
        "IPCO",
        "LDWP",
        "NEVP",
        "NWMT",
        "PACW",
        "WACM",
        "CO2 Factor: COL",
        "CO2 Factor: NG",
        "CO2 Factor: OIL",
        "CO2 Emissions: COL",
        "CO2 Emissions: NG",
        "CO2 Emissions: OIL",
        "CO2 Emissions: Other",
        "CO2 Emissions Generated",
        "CO2 Emissions Imported",
        "CO2 Emissions Exported",
        "CO2 Emissions Consumed",
        "Positive Generation",
        "Consumed Electricity",
        "CO2 Emissions Intensity for Generated Electricity",
        "CO2 Emissions Intensity for Consumed Electricity"
    ]

    existing_columns = [col for col in columns_to_clean if col in df.columns]

    df[existing_columns] = (
        df[existing_columns]
        .replace(r'^\s*$', pd.NA, regex=True)
        .apply(lambda col: col.astype(str).str.replace(",", "", regex=False))
        .apply(pd.to_numeric, errors='coerce')
        .fillna(0)
        .astype(float)
    )

    cutoff = pd.Timestamp.today().normalize() - pd.Timedelta(days=3)
    pace_recent = df[
        (df['Local date'].dt.year >= 2022) &
        (df['Local date'] < cutoff)
    ]

# Load data on startup
@app.on_event("startup")
def startup_event():
    load_data()

def filter_time_range(start: str, end: str) -> pd.DataFrame:
    """
    Filters the global dataframe between start and end datetime strings.
    """
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")

    try:
        start_dt = pd.to_datetime(start)
        end_dt = pd.to_datetime(end)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid datetime format. Use something like 2025-01-01 00:00:00"
        )

    filtered_df = df[(df["Datetime"] >= start_dt) & (df["Datetime"] <= end_dt)].copy()

    if filtered_df.empty:
        raise HTTPException(status_code=404, detail="No data found in that time range")

    return filtered_df


# ─────────────────────────────────────────────────────────────────────────────
# PRIMARY ENDPOINT — used by EnergyDashboard.tsx
# Returns the full DayData shape the frontend expects (hours + avgMix).
# Weather is intentionally excluded — the frontend fetches it separately
# via weatherApi.ts → open-meteo.
#
# Example: GET /api/energy/2025-01-15
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/energy/{date}")
async def get_energy_day(date: str):
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")

    # Filter by Local date (the column we know exists and is already parsed)
    try:
        target_date = pd.to_datetime(date)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    day_df = df[df["Local date"] == target_date].copy()

    if day_df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for {date}")

    day_df = day_df.reset_index(drop=True)

    # ── Validate required columns exist (same pattern as your other endpoints) ──
    required = [
        "Hour", "Demand", "Demand forecast",
        "Adjusted COL Gen", "Adjusted NG Gen", "Adjusted NUC Gen",
        "Adjusted SUN Gen", "Adjusted WND Gen", "Adjusted WAT Gen", "Adjusted GEO Gen"
    ]
    missing = [col for col in required if col not in day_df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns in CSV: {missing}")

    # ── Build hourly rows ─────────────────────────────────────────────────────
    # If your CSV has one row per day (not per hour), this will return a single
    # row. If it has 24 rows per day (hourly), it will return all 24.
    hours = []
    for i, row in day_df.iterrows():
        hour_num = int(row["Hour"]) % 24
        col_gen  = float(row["Adjusted COL Gen"])
        ng_gen   = float(row["Adjusted NG Gen"])
        nuc_gen  = float(row["Adjusted NUC Gen"])
        sun_gen  = float(row["Adjusted SUN Gen"])
        wnd_gen  = float(row["Adjusted WND Gen"])
        wat_gen  = float(row["Adjusted WAT Gen"])
        geo_gen  = float(row["Adjusted GEO Gen"])

        total_gen = col_gen + ng_gen + nuc_gen + sun_gen + wnd_gen + wat_gen + geo_gen
        total_gen = total_gen if total_gen > 0 else 1

        demand         = float(row["Demand"])
        optimal_demand = float(row["Demand forecast"])
        savings        = demand - optimal_demand

        hours.append({
            "hour": f"{str(hour_num).zfill(2)}:00",
            "h":    hour_num,
            "demand":        round(demand, 2),
            "optimalDemand": round(optimal_demand, 2),
            "savings":       round(savings, 2),
            # Mix percentages — read from dataframe
            "coal_pct":        round(col_gen  / total_gen * 100, 1),
            "natural_gas_pct": round(ng_gen   / total_gen * 100, 1),
            "nuclear_pct":     round(nuc_gen  / total_gen * 100, 1),
            "solar_pct":       round(sun_gen  / total_gen * 100, 1),
            "wind_pct":        round(wnd_gen  / total_gen * 100, 1),
            "hydro_pct":       round(wat_gen  / total_gen * 100, 1),
            "geothermal_pct":  round(geo_gen  / total_gen * 100, 1),
            # Costs — Lazard LCOE constants, no equivalent column in EIA CSV
            "coal_cost": 42, "natural_gas_cost": 52, "nuclear_cost": 22,
            "solar_cost": 18, "wind_cost": 15, "hydro_cost": 12, "geothermal_cost": 88,
        })

    energy_keys = ["coal", "natural_gas", "nuclear", "solar", "wind", "hydro", "geothermal"]
    avg_mix = {
        k: round(sum(h[f"{k}_pct"] for h in hours) / max(len(hours), 1), 1)
        for k in energy_keys
    }

    return {
        "hours":  hours,
        "avgMix": avg_mix,
    }

@app.get("/api/debug/columns")
async def debug_columns():
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")
    return {"columns": df.columns.tolist(), "shape": df.shape}
# ─────────────────────────────────────────────────────────────────────────────
# EXISTING ENDPOINTS (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

# Example: /api/peak-demand?start=2025-01-01 00:00:00&end=2025-01-01 23:59:59
@app.get("/api/peak-demand")
async def get_peak_demand(start: str, end: str):
    filtered_df = filter_time_range(start, end)

    if "Demand" not in filtered_df.columns:
        raise HTTPException(status_code=400, detail="Column 'Demand' not found in CSV")

    max_index = filtered_df["Demand"].idxmax()
    max_row = filtered_df.loc[max_index]

    return {
        "start": start,
        "end": end,
        "peak_demand": float(max_row["Demand"]),
        "peak_time": str(max_row["Datetime"]),
        "peak_hour": pd.to_datetime(max_row["Datetime"]).hour
    }


@app.get("/api/avg-demand")
async def get_average_demand(start: str, end: str):
    filtered_df = filter_time_range(start, end)

    if "Demand" not in filtered_df.columns:
        raise HTTPException(status_code=400, detail="Column 'Demand' not found in CSV")

    avg_demand = filtered_df["Demand"].mean()

    return {
        "start": start,
        "end": end,
        "average_demand": float(avg_demand)
    }


@app.get("/api/demand-forecast")
async def get_demand_forecast(start: str, end: str):
    filtered_df = filter_time_range(start, end)

    if "Demand forecast" not in filtered_df.columns:
        raise HTTPException(status_code=400, detail="Column 'Demand forecast' not found in CSV")

    forecast_df = filtered_df[["Datetime", "Demand forecast"]].copy()

    return {
        "start": start,
        "end": end,
        "count": len(forecast_df),
        "values": forecast_df.to_dict(orient="records")
    }


@app.get("/api/co2-data")
async def get_co2_data(start: str, end: str):
    filtered_df = filter_time_range(start, end)

    wanted_columns = [
        "Datetime",
        "CO2 Factor: COL",
        "CO2 Factor: NG",
        "CO2 Factor: OIL",
        "CO2 Emissions: COL",
        "CO2 Emissions: NG",
        "CO2 Emissions: Other"
    ]

    missing_columns = [col for col in wanted_columns if col not in filtered_df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns in CSV: {missing_columns}"
        )

    co2_df = filtered_df[wanted_columns].copy()

    return {
        "start": start,
        "end": end,
        "count": len(co2_df),
        "values": co2_df.to_dict(orient="records")
    }


@app.get("/api/adjusted-generation")
async def get_adjusted_generation(start: str, end: str):
    filtered_df = filter_time_range(start, end)

    wanted_columns = [
        "Datetime",
        "Adjusted NG Gen",
        "Adjusted NUC Gen",
        "Adjusted OIL Gen",
        "Adjusted GEO Gen",
        "Adjusted WAT Gen",
        "Adjusted PS Gen",
        "Adjusted SUN Gen",
        "Adjusted SNB Gen",
        "Adjusted WND Gen",
        "Adjusted WNB Gen",
        "Adjusted BAT Gen",
        "Adjusted OES Gen",
        "Adjusted UES Gen",
        "Adjusted OTH Gen",
        "Adjusted UNK Gen"
    ]

    missing_columns = [col for col in wanted_columns if col not in filtered_df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns in CSV: {missing_columns}"
        )

    generation_df = filtered_df[wanted_columns].copy()

    return {
        "start": start,
        "end": end,
        "count": len(generation_df),
        "values": generation_df.to_dict(orient="records")
    }


# ─────────────────────────────────────────────────────────────────────────────
# TESTING / TEMPLATE ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "FastAPI backend is running"}


@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI"}


@app.get("/api/data")
async def get_data():
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")

    return df.head(10).to_dict(orient="records")


@app.get("/api/columns")
async def get_columns():
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")

    return {"columns": df.columns.tolist()}


@app.get("/api/summary")
async def get_summary():
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")

    summary = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": df.columns.tolist()
    }

    return summary


@app.get("/api/filter")
async def filter_data(column: str, value: str):
    if df is None:
        raise HTTPException(status_code=500, detail="Dataframe not loaded")

    if column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{column}' not found")

    filtered_df = df[df[column].astype(str) == value]

    return filtered_df.to_dict(orient="records")


@app.post("/api/reload")
async def reload_data():
    try:
        load_data()
        return {"message": "CSV reloaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
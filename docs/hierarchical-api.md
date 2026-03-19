# Hierarchical Fertilizer Demand API Documentation

This API provides hierarchical summaries and drill-down data for fertilizer demand across five administrative levels: **Federal, Region, Zone, Woreda, and Kebele**.

## Base URL
`/api/fertilizer-demand`

## Common Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `productionSeason` | string | No | The name of the production season (e.g., "Meher 2025"). Defaults to the most active season. |
| `requestedAt.from` | date | No | Start date for filtering requests (ISO format). |
| `requestedAt.to` | date | No | End date for filtering requests (ISO format). |

---

## 1. Federal Summary
Returns national-level totals and a breakdown for DAP and UREA.

**Endpoint:** `GET /federal`

**Example Curl:**
```bash
curl -X GET "http://localhost:5000/api/fertilizer-demand/federal?productionSeason=Meher%202025" \
     -H "Authorization: Bearer <token>"
```

---

## 2. Federal Drill-Down
Returns a list of regions and their specific demand for a fertilizer type.

**Endpoint:** `GET /federal/:fertilizerType`

**Example Curl:**
```bash
curl -X GET "http://localhost:5000/api/fertilizer-demand/federal/UREA?productionSeason=Meher%202025" \
     -H "Authorization: Bearer <token>"
```

---

## 3. Region Summary
Returns totals for a specific region.

**Endpoint:** `GET /region/:regionId`

**Example Curl:**
```bash
curl -X GET "http://localhost:5000/api/fertilizer-demand/region/region-uuid?productionSeason=Meher%202025" \
     -H "Authorization: Bearer <token>"
```

---

## 4. Region Drill-Down
Returns a list of zones in the region and their specific demand for a fertilizer type.

**Endpoint:** `GET /region/:regionId/:fertilizerType`

**Example Curl:**
```bash
curl -X GET "http://localhost:5000/api/fertilizer-demand/region/region-uuid/DAP?productionSeason=Meher%202025" \
     -H "Authorization: Bearer <token>"
```

---

## 5. Zone Summary
Returns totals for a specific zone.

**Endpoint:** `GET /zone/:zoneId`

---

## 6. Zone Drill-Down
Returns a list of woredas in the zone and their specific demand for a fertilizer type.

**Endpoint:** `GET /zone/:zoneId/:fertilizerType`

---

## 7. Woreda Summary
Returns totals for a specific woreda.

**Endpoint:** `GET /woreda/:woredaId`

---

## 8. Woreda Drill-Down
Returns a list of kebeles in the woreda and their specific demand for a fertilizer type.

**Endpoint:** `GET /woreda/:woredaId/:fertilizerType`

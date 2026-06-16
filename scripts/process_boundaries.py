"""
NPS Boundary GeoJSON Processor
Simplifies geometry and normalizes designation keys for the NPS Explorer app.
Run once: python scripts/process_boundaries.py
Output: public/data/nps_boundaries.geojson (~2MB target)
"""

import json
from collections import Counter
from pathlib import Path

import geopandas as gpd
from shapely.geometry import mapping

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).parent.parent
INPUT_FILE = Path(__file__).parent / "nps_boundaries_raw.gdb.zip"
OUTPUT_FILE = REPO_ROOT / "public" / "data" / "nps_boundaries.geojson"

# ---------------------------------------------------------------------------
# Designation normalization
# Maps raw UNIT_TYPE values → our app's slug keys (must match designations.js)
# ---------------------------------------------------------------------------
DESIGNATION_MAP = {
    "National Park": "national-park",
    "National Monument": "national-monument",
    "National Recreation Area": "recreation-area",
    "National Seashore": "seashore",
    "National Lakeshore": "seashore",
    "National Historic Site": "historic",
    "National Historical Park": "historic",
    "National Historical Park and Ecological Preserve": "historic",
    "International Historic Site": "historic",
    "National Parkway": "parkway",
    "National Preserve": "preserve",
    "National Reserve": "preserve",
    "National Memorial": "memorial",
    "National Wild and Scenic River": "riverway",
    "Wild & Scenic Riverway": "riverway",
    "National Scenic Trail": "trail",   
    "National Historic Trail": "trail",
}

EXPLICIT_OVERRIDES = {
    "neri": "national-park",  # Force New River Gorge to be a National Park on our map
}

def normalize_designation(raw_type: str, park_code: str = "") -> str:
    """Map raw NPS unit type string to our app's designation slug."""
    # 0. Check explicit unit code overrides first (fixes database asset anomalies)
    if park_code.lower() in EXPLICIT_OVERRIDES:
        return EXPLICIT_OVERRIDES[park_code.lower()]

    if not raw_type:
        return "other"
    
    # 1. Check for exact matches first
    if raw_type in DESIGNATION_MAP:
        return DESIGNATION_MAP[raw_type]
            
    # 2. PRIORITY OVERRIDES: Handle combined types (like 'National Park & Preserve')
    if "national park" in raw_type.lower():
        return "national-park"
        
    if "national monument" in raw_type.lower():
        return "national-monument"
    
    # 3. Check for remaining partial sub-strings (Preserves, Historic, Riverways, etc.)
    for key, value in DESIGNATION_MAP.items():
        if key.lower() in raw_type.lower():
            return value
    
    return "other"


def detect_column(gdf, *candidates: str) -> str | None:

    """Find first matching column name (case-insensitive)."""
    cols_lower = {c.lower(): c for c in gdf.columns}
    for candidate in candidates:
        if candidate.lower() in cols_lower:
            return cols_lower[candidate.lower()]
    return None


def main() -> None:
    print(f"Loading: {INPUT_FILE}")
    if not INPUT_FILE.exists():
        print("ERROR: Raw GDB zip file not found.")
        return

    # Geopandas reads directly from zipped GDB arrays using a virtual file system string
    # We point to the specific layer inside the geodatabase
    try:
        gdf = gpd.read_file(f"zip://{INPUT_FILE}")
    except Exception as e:
        print(f"Standard zip read failed, trying alternative layer extraction: {e}")
        # Fallback if the database layer needs to be explicitly targeting the internal directory
        gdf = gpd.read_file(INPUT_FILE)
        
    print(f"Loaded {len(gdf)} features | CRS: {gdf.crs}")
    print(f"Columns: {list(gdf.columns)}")

    # Ensure WGS84
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        print("Reprojecting to WGS84...")
        gdf = gdf.to_crs(epsg=4326)

    # Detect column names (they vary by data source vintage)
    code_col = detect_column(gdf, "UNIT_CODE", "UnitCode", "unit_code", "PARKCODE")
    name_col = detect_column(gdf, "UNIT_NAME", "UnitName", "unit_name", "FULLNAME")
    type_col = detect_column(gdf, "UNIT_TYPE", "UnitType", "unit_type", "DESIGNATION")
    print(f"Detected: code={code_col} | name={name_col} | type={type_col}")

    # Simplify geometry — tolerance in decimal degrees (~300–500m at mid-latitudes)
    # Increase to 0.01 if output is still > 4MB; decrease to 0.002 for more detail
    print("Simplifying geometry (tolerance=0.005)...")
    gdf["geometry"] = gdf["geometry"].simplify(tolerance=0.005, preserve_topology=True)

    # Remove null / empty geometries
    gdf = gdf[gdf["geometry"].notna() & ~gdf["geometry"].is_empty]
    print(f"Valid features after cleanup: {len(gdf)}")

    # Build output FeatureCollection
    features = []
    for _, row in gdf.iterrows():
        raw_type = str(row.get(type_col) or "").strip() if type_col else ""
        park_code = str(row.get(code_col) or "").strip().lower() if code_col else ""
        park_name = str(row.get(name_col) or "").strip() if name_col else ""
        designation_key = normalize_designation(raw_type, park_code)

        features.append({
            "type": "Feature",
            "properties": {
                "parkCode": park_code,
                "parkName": park_name,
                "designationType": raw_type,
                "designationKey": designation_key,
            },
            "geometry": mapping(row["geometry"]),
        })

    geojson_out = {"type": "FeatureCollection", "features": features}

    # Write minified output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(geojson_out, separators=(",", ":")), encoding="utf-8")

    size_mb = OUTPUT_FILE.stat().st_size / 1_000_000
    print(f"\n✓ Written: {OUTPUT_FILE}")
    print(f"✓ Size: {size_mb:.2f} MB  (target: < 3MB)")
    print(f"✓ Features: {len(features)}")
    print("\nFeatures by designationKey:")
    for key, count in sorted(Counter(f["properties"]["designationKey"] for f in features).items(), key=lambda x: -x[1]):
        print(f"  {key:<22} {count}")


if __name__ == "__main__":
    main()
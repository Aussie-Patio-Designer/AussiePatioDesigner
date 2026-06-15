# Uploaded 3D scene models

Upload these GLB files directly into this folder (`public/models`) so Next.js serves them at the exact paths used by the 3D designer:

- `public/models/house.glb` → `/models/house.glb`
- `public/models/car.glb` → `/models/car.glb`
- `public/models/rubbish.glb` → `/models/rubbish.glb`

Important notes:

- Keep the filenames lowercase and exactly as shown: `house.glb`, `car.glb`, and `rubbish.glb`.
- Do not put these files under `app/`, `components/`, or another GitHub folder; the code reads from `/public/models` only.
- The designer includes simple fallback geometry, so it will still load before these files are added.

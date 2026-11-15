# RadShield-MD

Crew health awareness console for the NASA Space Apps Challenge (Kayath Brothers). Simulated data only. An awareness tool, not a diagnosis tool.

## Run it
Windows: double-click `Start-RadShield.bat` and keep the window open. It serves the app at http://localhost:8765/RadShield-MD.html. Use Edge or Chrome. The microphone and camera only keep their permission on `localhost`, not when the HTML is opened as a file.

## Files
- `RadShield-MD.html`: the whole app (React via CDN, plain CSS, inline SVG anatomy). Sections: data, model (`assess`), themes, figure, tools (reaction test, camera), workout routine, `App`, check-in, health log, fitness, report.
- `serve.ps1` and `Start-RadShield.bat`: tiny local web server and launcher.
- `server.mjs`: prototype REST API (`node server.mjs`, port 3001). Not yet updated to the seven-system model and not wired to the app.

## Features
Clickable anatomy with zoom, OK/Drift/Act/Alert status, five NASA hazards, four environments, radiation slider and storm shelter map, hazard pop-up with three actions, health log, workout plans and goals, surgeon report, light/dark/contrast/night modes with strength slider, voice commands, spoken assistant with eight voices, camera photo check.

Demo shortcuts: add `#flare`, `#ff`, `#fever`, `#light`, `#night`, `#fitness`, `#trends` or `#report` to the URL.

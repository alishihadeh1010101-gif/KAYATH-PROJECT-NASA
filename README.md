# RadShield-MD

Crew health awareness console for the NASA Space Apps Challenge (Kayath Brothers). Simulated data only. An awareness tool, not a diagnosis tool.

## Run it
Windows: double-click `Start-RadShield.bat` and keep the window open. It serves the app at http://localhost:8765/RadShield-MD.html. Use Edge or Chrome. The microphone and camera only keep their permission on `localhost`, not when the HTML is opened as a file.

## Files
- `RadShield-MD.html`: the whole app (React via CDN, plain CSS, inline SVG anatomy). Sections: anatomy plate, on-device vision loader (`RSVision`), eye-test timeline and analysis (`EyeRun`), data, model (`assess`), themes, figure, tools (reaction test, photo quality and camera), eye-tracking fatigue test, workout routine, `App`, check-in, health log, fitness, report.
- `serve.ps1` and `Start-RadShield.bat`: tiny local web server and launcher.
- `server.mjs`: prototype REST API (`node server.mjs`, port 3001). Not yet updated to the seven-system model and not wired to the app.

## Features
Layout: the body figure is the main screen (select a system to open its panel), a sidebar holds navigation, mission readouts, environment, hazards, test controls and the assistant, and display and input options sit behind the Accessibility button in the top bar.

Clickable anatomy with zoom, OK/Drift/Act/Alert status, five NASA hazards, four environments, radiation slider and storm shelter map, hazard pop-up with three actions, health log, workout plans and goals, surgeon report, light/dark/contrast/night modes with strength slider, voice commands, spoken assistant with eight voices.

Camera tools (video never leaves the browser):
- Eye-tracking fatigue test (Mind panel, or say "eye tracking test"): about 30 seconds of resting gaze and following a dot. Reports blink rate, eye-closure time (PERCLOS), longest closure, gaze lag and following error, and adds an "eye signs of fatigue" driver to Mind. All readings are webcam estimates; the cut-offs are named constants in `EyeRun.K` with their basis.
- Eye and skin photo checks: framing outline, live checks for focus, light, glare and steadiness, automatic capture of the sharpest of five frames, cropped to the framed region. The finding shown afterwards is still a simulated analyzer.
- Eye tracking and eye detection use MediaPipe Face Landmarker (`@mediapipe/tasks-vision` 1.2.2 from jsDelivr, model from Google's model store), downloaded only when one of these tools is opened.

Demo shortcuts: add `#flare`, `#ff`, `#fever`, `#light`, `#night`, `#fitness`, `#trends` or `#report` to the URL. Self-test hooks: `#eyetest` (real camera), `#eyetest=run`, `=follow`, `=done`, `=saved` (synthetic samples), `#camtest`, `#camtest2`.

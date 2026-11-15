# RadShield-MD: 3-minute pitch

Team: Kayath Brothers · NASA Space Apps Challenge: "Create Health Monitoring Software for Astronauts on Space Missions"
Repo: https://github.com/alishihadeh1010101-gif/KAYATH-PROJECT-NASA

One line: **RadShield-MD is a space doctor in a box: it tells a crew what is wrong, why, and the three things to do now, even when Earth is 40 minutes away.**

---

## Script (say it, do not read it)

**[0:00-0:15] HOOK (slide 1, no "Hi, we are team X")**
"Six months from Earth, a solar storm hits at 2 a.m. You message mission control, and the reply takes up to forty minutes round trip. Whoever is awake may not be a doctor. What do they do right now?"

**[0:15-0:45] PROBLEM (slide 2)**
- Who: deep-space crews on Moon and Mars missions, up to a ~40-minute round-trip delay to Earth.
- How bad: radiation adds up over a career (NASA limit 600 mSv), bones thin roughly 1% a month without loading, and isolation wears down sleep and mood.
- Why unsolved: today's support is "call the ground". That stops working when the ground is minutes away each way.
- Why now: Moon and Mars missions are being planned, so crews must be able to look after themselves.

**[0:45-1:15] SOLUTION (slide 3)**
"We built RadShield-MD, a health awareness console that watches seven body systems: mind, eyes, heart, immune, gut, bones and radiation. Each one shows OK, Drift, Act or Alert, with a shape as well as a colour, so it works for colour-blind crew and for a tired crew.
Our key idea: **every status is explained by the symptoms behind it, and every alert comes with exactly three actions.** It is an awareness tool, not a diagnosis tool."
(Architecture slide, 4 boxes: inputs [sliders, check-in, camera, voice] → model [symptoms → drivers → status] → outputs [alert, actions, workout, surgeon report] → NASA DONKI space-weather feed.)

**[1:15-2:30] LIVE DEMO (slide 4, the app) - one flow, ~75 seconds**
1. "Everyone is OK. Mars transit, day 14." (full-body figure, all green)
2. Say out loud: **"Simulate X-class solar flare."** (voice command)
3. The hazard pop-up covers the screen: **"Radiation storm. 1. Move to the Water-Wall Cargo Bay. 2. Stay sheltered. 3. Put water and food bags between you and the hull."** The assistant reads it aloud.
4. Say **"Acknowledge."** Show the storm-shelter map: "88% shielded, the safest zone." Click it; the dose rate drops.
5. **WOW:** click Gut. The camera does a hyperspace jump into the body, the organ lights up, and the Anatomy guide explains why storms cause nausea.
6. Finish on the Trends tab: the dose line against the 600 mSv career limit, and the personalised workout that changed because of today's symptoms.

**[2:30-2:45] SCALE (slide 5)**
"It is one file with no install and no cloud, so it runs offline on any crew tablet. At mission scale the same model takes real dosimeter and wearable data instead of sliders. Today every number is simulated, and we say so on every screen."

**[2:45-3:00] ASK (slide 6)**
"We want a flight surgeon to review our alert thresholds, and access to real dosimeter or wearable data from an analog mission such as HERA, so we can run a pilot. Our code is on GitHub for anyone to try today."

---

## Slides (6)
1. Hook line + RadShield-MD + team
2. Problem: who / how bad / why unsolved (3 numbers only)
3. Solution + 4-box architecture
4. LIVE DEMO (switch to the app)
5. Impact + scale + "simulated data" honesty line
6. Ask + GitHub link + QR code

## Demo setup (do this before going on)
- Start with `Start-RadShield.bat` and keep its window open (the mic and camera need localhost).
- Turn Voice commands on and click Allow once. Pick the assistant voice you like.
- Load the starting state: `http://localhost:8765/RadShield-MD.html` (Mars Transit, day 14, all OK).
- Backup if voice fails: click "Simulate X-class solar flare" yourself. Backup if the app fails: play the video.
- Do not demo the camera photo or the reaction test in 75 seconds. Mention them in Q&A.
- Practise the flow 5 times with a timer.

## Likely judge questions
- **Is it accurate medically?** It is an awareness tool, not a diagnosis. Thresholds are simple and need flight surgeon review; that is our ask.
- **Is the data real?** No, all readings are simulated. The 600 mSv limit and the DONKI feed are real references; DONKI falls back to a labelled simulation if offline.
- **Accessibility?** Colour plus shape plus text, large-text mode, 1-switch scan with Space, voice control of every button and slider, spoken replies, high-contrast and red-shift night modes.
- **Why not a phone app?** One HTML file works on any device with a browser and needs no network.

## Submission checklist
- [x] Source code on GitHub (with README)
- [ ] Final presentation (PPT/PDF)
- [ ] Demo video recording (backup, 75 seconds)
- [ ] Architecture diagram (PNG/SVG)
- [ ] Team photo / info

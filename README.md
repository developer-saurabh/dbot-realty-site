# DBOT Realty — mid-fidelity website (iteration 3)

Static HTML/CSS/JS. No build step.

## Deploy on Vercel
- **Drag and drop:** vercel.com → Add New → Project → drag this folder in → Deploy.
- **CLI:** `npx vercel` inside this folder (Framework preset: Other; no build command; output directory: `.`).

`vercel.json` turns on clean URLs (e.g. `/service-esg` instead of `/service-esg.html`).

## Preview locally
Open `index.html` in a browser, or run `npx serve .` / `python3 -m http.server`.

## Notes
- Forms (enquiry, sign-up, report download, job application) show a confirmation but send no data — prototype only.
- Yellow "pending" tags mark content awaiting DBOT input.
- `iteration-3-notes.html` (linked in the footer) maps each Version 2 feedback item to where it is addressed, and lists open decisions.

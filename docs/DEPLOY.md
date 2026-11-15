# How to publish the app and get its address

The app is static: the whole `app/` folder is the site. There is nothing to build and no keys to configure. Any static host that serves HTTPS works.

## Option A: Netlify Drop (2 minutes, no git)

1. Go to https://app.netlify.com/drop and sign in (free account).
2. Drag the `app` folder (the whole folder, not its loose contents) onto the page. A zip of the folder's contents with `index.html` at the root also works on hosts that accept zips.
3. Netlify returns an address like `https://random-name.netlify.app`.
4. Under "Site configuration" the name can be changed, for example `yvyshift-py`.

To update after a change: open the "Deploys" tab and drag the `app` folder again.

## Option B: GitHub Pages (from this repository)

1. In the repository: Settings → Pages → Source: "Deploy from a branch" → branch `main`, folder `/ (root)` → Save.
2. The address will be `https://<user>.github.io/<repository>/app/`.

## Installable and offline app (PWA)

The site can already be installed and used without internet (`manifest.webmanifest`, `sw.js` and the `icons/` folder). Conditions:

- **It must be served over HTTPS**, as Netlify, GitHub Pages and Firebase do. Opened with a double click (`file://`) it works normally but cannot be installed or stored on the device.
- The first visit must be **online**: that is when the app files are stored.
- **Every time you publish again**, change `VERSION` in `app/sw.js` (currently `yvy-v21`). Otherwise phones may keep showing the old version.
- On a phone, the browser offers "Install app" (the button in the top bar appears only when the browser allows it).
- The optional local AI is downloaded separately, from inside the app (about 0.9 GB). See [`LOCAL_AI.md`](LOCAL_AI.md).

## Check before submitting

Open the address in a private window and on a phone, and check:

- [ ] The home page loads and the header says **YvyShift**.
- [ ] In Rotation Lab the NASA lens appears and "Show NASA data only" changes the text and the ranking.
- [ ] The footer shows the scale (56 × 62 km) and the statement about the use of Claude.
- [ ] The satellite images load in Field Monitor.
- [ ] The language selector changes all the text.
- [ ] "Copy link to this result" makes a link that opens the same result.
- [ ] Picking a point on the map and pressing "Download data" brings NASA POWER data (it can take up to a minute).
- [ ] On the phone there is no sideways scrolling.
- [ ] Install the app from the phone's browser, turn on airplane mode and open it: it should show the "Offline" notice and keep working.

Then paste the address into `README.md`, `docs/PROJECT_PAGE_EN.md` and the submission form.

## Demo fallback

If the internet fails: open `app/index.html` with a double click. Everything works with the cache except the live download for new locations.

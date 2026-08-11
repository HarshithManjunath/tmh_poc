# QuPath launch helper (POC)

Opens a local `.svs` slide in QuPath from a `qpath://...` link in the web app.

## One-time setup

1. Ensure QuPath 0.7+ is installed.
2. Double-click `register-qpath.reg` (confirm the registry prompt; may require
   administrator rights) to register the `qpath://` handler.

## How it works

- The web app emits `qpath://<url-encoded path>`.
- Windows hands the URL to `qpath-launcher.ps1`.
- The script URL-decodes the path, converts `/` back to `\`, locates
  `QuPath-*.exe`, and runs `QuPath.exe --image "<path>"`.

## Troubleshooting

- If clicking the link does nothing or shows a handler error: re-run
  `register-qpath.reg`, and confirm `C:\Users\THOUGHTCLAN\AppData\Local\QuPath-0.7.0\QuPath-0.7.0.exe` exists.
- The launcher searches `%LOCALAPPDATA%\QuPath-*\QuPath-*.exe` and
  `C:\Program Files\QuPath-*\QuPath-*.exe` (skipping the `(console)` variant).

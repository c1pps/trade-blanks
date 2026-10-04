# Verify the extension installed in your Chrome

Chrome keeps the files of every installed extension on your disk. You can compare them with [`SHA256SUMS.txt`](SHA256SUMS.txt) in a minute.

## 1. Find the folder

Open `chrome://version` and copy the **Profile Path**. The extension is in:

```
<Profile Path>/Extensions/mhegkceocponjlnnbinngggdmniigkgo/<version>_0/
```

Typical locations:

- Windows: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\mhegkceocponjlnnbinngggdmniigkgo\`
- macOS: `~/Library/Application Support/Google/Chrome/Default/Extensions/mhegkceocponjlnnbinngggdmniigkgo/`
- Linux: `~/.config/google-chrome/Default/Extensions/mhegkceocponjlnnbinngggdmniigkgo/`

## 2. Hash the files

Windows (PowerShell, inside the version folder):

```powershell
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '_metadata' } | Get-FileHash -Algorithm SHA256 | Format-Table Hash, Path -AutoSize
```

macOS / Linux (inside the version folder):

```bash
find . -type f ! -path './_metadata/*' | sort | xargs shasum -a 256
```

## 3. Compare

Every hash must match the same file in `SHA256SUMS.txt`, with two expected exceptions added by the Chrome Web Store itself:

- the `_metadata/` folder (Google's signature of the package);
- `manifest.json`, where the Store inserts its own `update_url` (and `key`) lines.

Open both `manifest.json` files side by side: apart from those Store lines, they are identical — same permissions, same sites.

## 4. Rebuild it yourself (optional)

With Node.js installed:

```bash
bash build.sh
```

It rebuilds `content.js`, `background.js` and `chart.js` from [`source/`](source) and confirms they are byte-for-byte identical to the published files.

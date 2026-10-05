# Third-party notices

The project's `LICENSE` applies to original project materials
and does not replace the licenses or rights of third parties.

## Locally hosted fonts

Unmodified WOFF2 font assets are distributed under the
SIL Open Font License, Version 1.1, with their original
copyright statements:

- Ma Shan Zheng: Copyright 2018 The Ma Shan Zheng Project Authors.
  See `assets/fonts/MaShanZheng-OFL.txt`.
- Noto Sans TC: Copyright 2014-2021 Adobe; Reserved Font Name 'Source'.
  See `assets/fonts/NotoSansTC-OFL.txt`.
- Noto Serif TC: Copyright 2012 Google Inc. All Rights Reserved.
  See `assets/fonts/NotoSerifTC-OFL.txt`.

`assets/fonts/manifest.json` records official download sources
and checksums for provenance. These URLs are maintenance
records, not runtime requests. `assets/fonts/fonts.css` loads
only local files. The font license does not grant a license
to the game's original source, characters, or artwork.

## Color profiles

Game WebP images contain a generic sRGB color profile with
the attribution `Google Inc. 2016`. That color profile is not
original Ververya artwork and contains no private capture data.

## Deployment tooling

The deployment workflow references official GitHub Actions
at fixed commit SHAs. Those Actions retain their own licenses;
their source is not bundled into the player's game runtime.

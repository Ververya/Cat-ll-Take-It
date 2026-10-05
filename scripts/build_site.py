"""Create the static Pages artifact; exclude local profiles, logs and source photos."""
from pathlib import Path
import shutil
import re

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'dist'
FILES = [
    'index.html', 'app.js', 'audio.js', 'judgment.js', 'storage.js',
    'scene.js', 'presentation.js', 'transaction-animation.js',
    'visual.css', 'transaction.css', 'judgment-flow.css',
]

def build():
    DEST.mkdir(exist_ok=True)
    # Every deployed asset is relative to the repository Pages base path.
    assets = set()
    for name in FILES:
        source = ROOT / name
        body = source.read_text(encoding='utf-8')
        assets.update(re.findall(r'assets/[\w/-]+\.webp', body))
        shutil.copy2(source, DEST / name)
    # Pose names are assembled dynamically in presentation.js.
    assets.update(p.relative_to(ROOT).as_posix() for p in (ROOT/'assets/cat').glob('cat-*.webp'))
    for name in sorted(assets):
        source, target = ROOT/name, DEST/name
        if not source.is_file():
            raise FileNotFoundError(name)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    (DEST/'.nojekyll').write_text('', encoding='utf-8')
    size=sum(p.stat().st_size for p in DEST.rglob('*') if p.is_file())
    print(f'Pages artifact: {len(FILES)} runtime files, {len(assets)} assets, {size/1024/1024:.1f} MiB')

if __name__ == '__main__':
    build()

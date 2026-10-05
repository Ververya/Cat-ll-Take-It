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
POLICY_FILES = ['LICENSE', 'PRIVACY.md', 'THIRD_PARTY_NOTICES.md']

def compile_production(body):
    """Remove development-only source, not just hide its UI at runtime."""
    output = []
    development = False
    for line in body.splitlines(keepends=True):
        if line.strip() == '// #if DEVELOPMENT':
            if development:
                raise ValueError('Nested DEVELOPMENT section')
            development = True
        elif line.strip() == '// #endif':
            if not development:
                raise ValueError('Unmatched DEVELOPMENT terminator')
            development = False
        elif not development:
            output.append(line)
    if development:
        raise ValueError('Unclosed DEVELOPMENT section')
    body = ''.join(output).replace('const DEVELOPMENT = true;', 'const DEVELOPMENT = false;')
    for forbidden in ['isDev', 'developer-override', 'judgment-debug', 'updateDebug', 'URLSearchParams']:
        if forbidden in body:
            raise ValueError(f'Development code remains in production: {forbidden}')
    return body

def build():
    DEST.mkdir(exist_ok=True)
    # Rebuild deterministically: a previously copied file must never leak into release.
    # Only individual files inside the verified workspace dist directory are removed.
    destination = DEST.resolve()
    if destination != ROOT.resolve() / 'dist':
        raise ValueError('Unsafe build destination')
    for old in DEST.rglob('*'):
        if old.is_file():
            if not old.resolve().is_relative_to(destination):
                raise ValueError('File outside build destination')
            old.unlink()
    # Every deployed asset is relative to the repository Pages base path.
    assets = set()
    for name in FILES:
        source = ROOT / name
        body = source.read_text(encoding='utf-8')
        assets.update(re.findall(r'assets/[\w/-]+\.webp', body))
        if name == 'app.js':
            (DEST / name).write_text(compile_production(body), encoding='utf-8')
        else:
            shutil.copy2(source, DEST / name)
    # Pose names are assembled dynamically in presentation.js.
    assets.update(p.relative_to(ROOT).as_posix() for p in (ROOT/'assets/cat').glob('cat-*.webp'))
    for name in sorted(assets):
        source, target = ROOT/name, DEST/name
        if not source.is_file():
            raise FileNotFoundError(name)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    fonts = ROOT / 'assets/fonts'
    for source in fonts.iterdir():
        if source.suffix not in {'.woff2', '.css', '.txt'}:
            continue
        target = DEST / 'assets/fonts' / source.name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    for name in POLICY_FILES:
        shutil.copy2(ROOT / name, DEST / name)
    (DEST/'.nojekyll').write_text('', encoding='utf-8')
    size=sum(p.stat().st_size for p in DEST.rglob('*') if p.is_file())
    print(f'Pages artifact: {len(FILES)} runtime files, {len(assets)} assets, {size/1024/1024:.1f} MiB')

if __name__ == '__main__':
    build()

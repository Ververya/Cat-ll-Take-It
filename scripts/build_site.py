"""Create the static Pages artifact; exclude local profiles, logs and source photos."""
from pathlib import Path
import shutil
import re
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'dist'
FILES = [
    'index.html', 'app.js', 'audio.js', 'judgment.js', 'storage.js',
    'scene.js', 'presentation.js', 'transaction-animation.js', 'cat-intent-router.js', 'privacy-rule-paper.js',
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

def version_runtime(body, names):
    """Version module imports without changing their code or relative base path."""
    for original, versioned in names.items():
        for quote in ["'", '"']:
            body = body.replace(f'{quote}./{original}{quote}', f'{quote}./{versioned}{quote}')
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
    # One content-derived release ID versions the whole module graph, including
    # dependencies: changing presentation.js also changes the cached app entry URL.
    runtime = {name: (DEST/name).read_text(encoding='utf-8') for name in FILES if name != 'index.html'}
    digest = hashlib.sha256()
    for name, body in sorted(runtime.items()):
        digest.update((name + '\0' + body + '\0').encode('utf-8'))
    release = digest.hexdigest()[:16]
    names = {name: f'{Path(name).stem}.{release}{Path(name).suffix}' for name in runtime}
    for name, body in runtime.items():
        (DEST/names[name]).write_text(version_runtime(body, names), encoding='utf-8', newline='\n')
    html = (DEST/'index.html').read_text(encoding='utf-8')
    for name, versioned in names.items():
        html = html.replace(f'"{name}"', f'"{versioned}"')
    (DEST/'index.html').write_text(html, encoding='utf-8', newline='\n')
    # Keep legacy static URLs for compatibility with previously cached HTML;
    # the current index and its module graph exclusively use versioned URLs.
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('Cannot identify source commit')
    (DEST/'build-info.json').write_text(json.dumps({'sourceCommit': commit, 'release': release, 'runtimeAssets': names}, indent=2)+'\n', encoding='utf-8', newline='\n')
    (DEST/'.nojekyll').write_text('', encoding='utf-8')
    size=sum(p.stat().st_size for p in DEST.rglob('*') if p.is_file())
    print(f'Pages artifact: {len(FILES)} runtime files, {len(assets)} assets, {size/1024/1024:.1f} MiB')

if __name__ == '__main__':
    build()

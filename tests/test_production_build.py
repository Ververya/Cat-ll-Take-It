"""Release regression checks; no external dependencies or network calls."""
from pathlib import Path
import hashlib
import importlib.util
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_site', ROOT/'scripts/build_site.py')
build_site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_site)

class ProductionBuildTests(unittest.TestCase):
    def test_development_sections_are_absent_from_artifact(self):
        source = (ROOT/'app.js').read_text(encoding='utf-8')
        compiled = build_site.compile_production(source)
        self.assertIn('const DEVELOPMENT = false;', compiled)
        self.assertNotIn('developer-override', compiled)
        self.assertNotIn('judgment-debug', compiled)
        self.assertNotIn('URLSearchParams', compiled)
        self.assertIn('judgment.outcome', compiled)
        self.assertIn('showClarify(judgment)', compiled)
        self.assertEqual(compiled, (ROOT/'dist/app.js').read_text(encoding='utf-8'))

    def test_bad_development_markers_fail_closed(self):
        for source in ['// #endif\n', '// #if DEVELOPMENT\n', '// #if DEVELOPMENT\n// #if DEVELOPMENT\n']:
            with self.assertRaises(ValueError):
                build_site.compile_production(source)

    def test_font_files_match_provenance_and_load_locally(self):
        fonts = ROOT/'assets/fonts'
        manifest = json.loads((fonts/'manifest.json').read_text(encoding='utf-8'))
        css = (fonts/'fonts.css').read_text(encoding='utf-8')
        self.assertNotRegex(css, r'https?://|//fonts\.')
        references = set(re.findall(r'url\(\./([^\)]+)\)', css))
        self.assertEqual(references, {f['file'] for f in manifest['files']})
        for item in manifest['files']:
            data = (fonts/item['file']).read_bytes()
            self.assertEqual(data[:4], b'wOF2')
            self.assertEqual(hashlib.sha256(data).hexdigest(), item['sha256'])
            self.assertEqual(data, (ROOT/'dist/assets/fonts'/item['file']).read_bytes())
        for name in ['MaShanZheng', 'NotoSansTC', 'NotoSerifTC']:
            self.assertIn('SIL OPEN FONT LICENSE', (fonts/(name+'-OFL.txt')).read_text())

    def test_runtime_has_no_remote_services(self):
        for name in build_site.FILES:
            text = (ROOT/'dist'/name).read_text(encoding='utf-8')
            self.assertNotRegex(text, r'https?://')
            self.assertNotRegex(text, r'\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(')
        deployed = {p.relative_to(ROOT/'dist').as_posix() for p in (ROOT/'dist').rglob('*') if p.is_file()}
        self.assertFalse(any(p.startswith(('audit/', 'tests/')) or p.startswith('verify') or p.endswith('-qa.json') or p.endswith('-qa-report.json') for p in deployed))
        for name in build_site.POLICY_FILES:
            self.assertIn(name, deployed)

if __name__ == '__main__':
    unittest.main()

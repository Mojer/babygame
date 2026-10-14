"""Collect project image sources, generation prompts and runtime assets into artwork/.

Run from any directory: python3 tools/collect_artwork.py
Copies project-local files, checks SHA-256, and writes a browseable index and manifest.
"""
from pathlib import Path
from collections import Counter
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artwork'
records = []
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def collect(source, target, category, prompt=None):
    source = ROOT / source
    if not source.is_file():
        raise FileNotFoundError(source)
    dest = OUT / target
    dest.parent.mkdir(parents=True, exist_ok=True)
    digest = sha256(source)
    if not dest.exists() or sha256(dest) != digest:
        shutil.copy2(source, dest)
    if sha256(dest) != digest:
        raise RuntimeError('Copy verification failed: ' + str(dest))
    record = {'file': target, 'source': source.relative_to(ROOT).as_posix(),
              'category': category, 'sha256': digest, 'bytes': dest.stat().st_size}
    if prompt:
        record['prompt'] = prompt
    records.append(record)


def city_category(name):
    if name.startswith('keyart'):
        return 'covers'
    if name.startswith(('akane', 'yu', 'player', 'portraits')):
        return 'characters'
    if name.startswith(('zombies', 'mutant')):
        return 'enemies'
    if name.startswith(('terrain', 'facades', 'props', 'fountain')):
        return 'environment'
    return 'effects'


def main():
    # Keep each generation's actual prompt associated with all its source/relayout images.
    for run in sorted((ROOT / 'art_spike/gen').iterdir()):
        if not run.is_dir():
            continue
        category = city_category(run.name)
        prompt = f'prompts/city/runs/{run.name}.txt'
        collect(f'art_spike/gen/{run.name}/prompt.txt', prompt, 'prompt')
        for image in sorted(run.rglob('*')):
            if image.is_file() and image.suffix.lower() in IMAGE_EXTENSIONS:
                relative = image.relative_to(run).as_posix()
                collect(image.relative_to(ROOT).as_posix(), f'originals/city/{category}/{run.name}/{relative}', 'original', prompt)
    for prompt in sorted((ROOT / 'art_spike/prompts').glob('*.txt')):
        collect(prompt.relative_to(ROOT).as_posix(), f'prompts/city/library/{prompt.name}', 'prompt')

    japan = [
        ('enemies-source.png', 'enemies.png', 'enemies-prompt.txt', 'enemies.txt'),
        ('environment-source.png', 'environment.png', 'environment-prompt.txt', 'environment.txt'),
        ('cover-source.png', 'cover-v1.png', 'cover-prompt.txt', 'cover.txt'),
        ('cover-source-v2.png', 'cover-v2.png', 'cover-flip-prompt.txt', 'cover-flip.txt'),
    ]
    for image, name, prompt_source, prompt_name in japan:
        prompt = 'prompts/japan/' + prompt_name
        collect('art_spike/japan/' + prompt_source, prompt, 'prompt')
        collect('art_spike/japan/' + image, 'originals/japan/' + name, 'original', prompt)

    for image in sorted((ROOT / 'art_spike/japan/props-clean').glob('*/prop.png')):
        collect(image.relative_to(ROOT).as_posix(), f'processed/japan/props/{image.parent.name}.png', 'processed', 'prompts/japan/environment.txt')
    for image in sorted((ROOT / 'art_spike/japan/terrain').glob('*.png')):
        collect(image.relative_to(ROOT).as_posix(), f'processed/japan/terrain/{image.name}', 'processed', 'prompts/japan/environment.txt')

    for asset in sorted((ROOT / 'art_spike/japan/animation').glob('*')):
        if asset.suffix.lower() in IMAGE_EXTENSIONS | {'.json'}:
            collect(asset.relative_to(ROOT).as_posix(), f'processed/japan/animation/{asset.name}', 'processed')

    collect('src/assets/title-bg.jpg', 'runtime/covers/city-title.jpg', 'runtime', 'prompts/city/runs/keyart-1.txt')
    for folder in ['covers', 'sprites']:
        for asset in sorted((ROOT / 'public' / folder).iterdir()):
            if asset.is_file() and asset.suffix.lower() in IMAGE_EXTENSIONS | {'.json'}:
                collect(asset.relative_to(ROOT).as_posix(), f'runtime/{folder}/{asset.name}', 'runtime')

    for name in ['map-preview.png', 'stage-selection.jpg', 'stage-cover-selection-v1.jpg', 'stage-cover-selection-v2.jpg']:
        collect('art_spike/japan/' + name, 'previews/japan/' + name, 'preview')

    counts = Counter(record['category'] for record in records)
    images = sum(Path(record['file']).suffix.lower() in IMAGE_EXTENSIONS for record in records)
    manifest = {'schema': 'zombie-overload.artwork.v1', 'root': 'zombie_overload/artwork',
                'images': images, 'prompts': counts['prompt'], 'files': records}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

    lines = [
        '# Zombie Overload 圖片素材與生成提示詞', '',
        f'集中整理 {images} 張圖片、{counts["prompt"]} 份提示詞，包含都市關卡、百鬼夜行、角色、敵人、場景、特效與封面版本。', '',
        '| 目錄 | 內容 |', '|---|---|',
        '| [originals/city](originals/city/) | 都市／共用素材原圖，依封面、角色、敵人、場景、特效分類，保留生成版本與重排圖 |',
        '| [originals/japan](originals/japan/) | 百鬼夜行妖怪、場景，以及封面 v1／巨獸朝左的 v2 原圖 |',
        '| [prompts/city/runs](prompts/city/runs/) | 每次實際生成所用的完整 prompt，與原圖一一對應 |',
        '| [prompts/city/library](prompts/city/library/) | 原本的提示詞庫與造型變體 |',
        '| [prompts/japan](prompts/japan/) | 妖怪、場景、封面生成與巨獸反轉的 prompt |',
        '| [processed/japan](processed/japan/) | 去背場景物件、地磚與妖怪動作影格／規格／檢查 |',
        '| [runtime](runtime/) | 遊戲用 JPG 封面、PNG 圖集、人物頭像、特效與圖集 JSON |',
        '| [previews/japan](previews/japan/) | 地圖預覽與選關畫面的版本紀錄 |', '',
        '目前使用的百鬼夜行封面是 [japan-cover-v2.jpg](runtime/covers/japan-cover-v2.jpg)，右上巨獸朝向中央。', '',
        '遊戲讀取 `public/` 和 `src/assets/` 的素材；本目錄為整理後的資料庫。正式素材更新後，可執行 `python3 tools/collect_artwork.py` 同步整理。', '',
        '[manifest.json](manifest.json) 記錄每個檔案的專案內來源、SHA-256 與原圖對應的 prompt。', '',
        '圖片處理腳本與導航驗證資料在 [art_spike](../art_spike/)；其他中間影格與人物參考保留於 [proc](../art_spike/proc/) 和 [ref](../art_spike/ref/)。', '',
        '## 原圖與 prompt 對照', '', '| 原圖 | 生成 prompt |', '|---|---|',
    ]
    for record in records:
        if record['category'] == 'original':
            name, prompt = record['file'], record['prompt']
            lines.append(f'| [{name}]({name}) | [{Path(prompt).name}]({prompt}) |')
    (OUT / 'README.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps({'directory': str(OUT), 'images': images, 'prompts': counts['prompt'],
                      'verified_files': len(records), 'bytes': sum(record['bytes'] for record in records)}, ensure_ascii=False))


if __name__ == '__main__':
    main()

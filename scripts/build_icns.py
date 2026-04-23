import struct
from pathlib import Path

SIZE_TO_TYPE = {
    16: b'icp4',
    32: b'icp5',
    64: b'icp6',
    128: b'ic07',
    256: b'ic08',
    512: b'ic09',
    1024: b'ic10',
}

ICONSET_DIR = Path('resources/logo-trimmer.iconset')
OUT_PATH = Path('resources/logo-trimmer.icns')


def read_png(size):
    if size == 1024:
        path = ICONSET_DIR / 'icon_512x512@2x.png'
        if path.exists():
            return path.read_bytes()
        return Path('resources/logo-trimmer-1024.png').read_bytes()

    path = ICONSET_DIR / f'icon_{size}x{size}.png'
    return path.read_bytes()


def build():
    chunks = []
    total = 8
    for size, type_code in SIZE_TO_TYPE.items():
        data = read_png(size)
        chunk_len = len(data) + 8
        chunks.append(type_code + struct.pack('>I', chunk_len) + data)
        total += chunk_len

    header = b'icns' + struct.pack('>I', total)
    OUT_PATH.write_bytes(header + b''.join(chunks))


if __name__ == '__main__':
    build()

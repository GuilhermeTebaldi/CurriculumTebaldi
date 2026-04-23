import math
import struct
import zlib

WIDTH = 1024
HEIGHT = 1024


def hex_to_rgba(value):
    value = value.lstrip('#')
    r = int(value[0:2], 16)
    g = int(value[2:4], 16)
    b = int(value[4:6], 16)
    return (r, g, b, 255)


def write_png(path, width, height, pixels):
    # pixels: bytearray of RGBA row-major
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)  # no filter
        row_start = y * stride
        raw.extend(pixels[row_start:row_start + stride])

    compressed = zlib.compress(bytes(raw), level=9)

    def chunk(tag, data):
        return (
            struct.pack('>I', len(data)) +
            tag +
            data +
            struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        )

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))


def set_pixel(pixels, x, y, color):
    if x < 0 or y < 0 or x >= WIDTH or y >= HEIGHT:
        return
    idx = (y * WIDTH + x) * 4
    pixels[idx:idx + 4] = bytes(color)


def fill_rect(pixels, x, y, w, h, color):
    if w <= 0 or h <= 0:
        return
    x0 = max(x, 0)
    y0 = max(y, 0)
    x1 = min(x + w, WIDTH)
    y1 = min(y + h, HEIGHT)
    row = bytes(color) * (x1 - x0)
    for yy in range(y0, y1):
        idx = (yy * WIDTH + x0) * 4
        pixels[idx:idx + len(row)] = row


def fill_circle(pixels, cx, cy, r, color):
    r2 = r * r
    for dy in range(-r, r + 1):
        yy = cy + dy
        if yy < 0 or yy >= HEIGHT:
            continue
        dx = int(math.sqrt(r2 - dy * dy))
        x0 = cx - dx
        x1 = cx + dx
        fill_rect(pixels, x0, yy, x1 - x0 + 1, 1, color)


def fill_quarter_circle(pixels, cx, cy, r, quadrant, color):
    r2 = r * r
    for dy in range(r):
        dx = int(math.sqrt(r2 - dy * dy))
        if quadrant == 'tl':
            yy = cy - dy
            x0 = cx - dx
            x1 = cx
        elif quadrant == 'tr':
            yy = cy - dy
            x0 = cx
            x1 = cx + dx
        elif quadrant == 'bl':
            yy = cy + dy
            x0 = cx - dx
            x1 = cx
        else:  # 'br'
            yy = cy + dy
            x0 = cx
            x1 = cx + dx
        fill_rect(pixels, x0, yy, x1 - x0 + 1, 1, color)


def fill_rounded_rect(pixels, x, y, w, h, r, color):
    if r <= 0:
        fill_rect(pixels, x, y, w, h, color)
        return
    # Center
    fill_rect(pixels, x + r, y, w - 2 * r, h, color)
    # Sides
    fill_rect(pixels, x, y + r, r, h - 2 * r, color)
    fill_rect(pixels, x + w - r, y + r, r, h - 2 * r, color)

    # Corners
    fill_quarter_circle(pixels, x + r - 1, y + r - 1, r, 'tl', color)
    fill_quarter_circle(pixels, x + w - r, y + r - 1, r, 'tr', color)
    fill_quarter_circle(pixels, x + r - 1, y + h - r, r, 'bl', color)
    fill_quarter_circle(pixels, x + w - r, y + h - r, r, 'br', color)


def draw_line(pixels, x0, y0, x1, y1, thickness, color):
    dx = x1 - x0
    dy = y1 - y0
    steps = max(abs(dx), abs(dy))
    if steps == 0:
        fill_circle(pixels, x0, y0, thickness // 2, color)
        return
    for i in range(steps + 1):
        t = i / steps
        x = int(round(x0 + dx * t))
        y = int(round(y0 + dy * t))
        fill_circle(pixels, x, y, thickness // 2, color)


def main():
    pixels = bytearray(WIDTH * HEIGHT * 4)

    bg = hex_to_rgba('#0f172a')
    paper = hex_to_rgba('#f8fafc')
    title = hex_to_rgba('#1e293b')
    line = hex_to_rgba('#94a3b8')
    accent = hex_to_rgba('#38bdf8')
    check = hex_to_rgba('#0f172a')

    fill_rounded_rect(pixels, 0, 0, WIDTH, HEIGHT, 200, bg)
    fill_rounded_rect(pixels, 220, 180, 584, 664, 48, paper)

    fill_rounded_rect(pixels, 260, 260, 220, 26, 13, title)

    lines = [
        (260, 320, 380, 18),
        (260, 370, 340, 18),
        (260, 420, 360, 18),
        (260, 500, 300, 18),
        (260, 550, 360, 18),
        (260, 600, 320, 18),
    ]
    for x, y, w, h in lines:
        fill_rounded_rect(pixels, x, y, w, h, 9, line)

    fill_circle(pixels, 660, 300, 68, accent)
    draw_line(pixels, 630, 300, 650, 320, 16, check)
    draw_line(pixels, 650, 320, 690, 274, 16, check)

    write_png('resources/logo-trimmer-1024.png', WIDTH, HEIGHT, pixels)


if __name__ == '__main__':
    main()

"""Per-shot mix: narration + continuous music bed (sliced in sequence order so the intercut film flows) + SFX.
Usage: python mix.py <out_dir_lemo> <out_dir_om>"""
import json, re, subprocess, sys, numpy as np
ROOT = '/home/user/lemo-opuscar/films/moon-c'
SR = 48000
DATA = json.loads(open(f'{ROOT}/shared/data.js').read()[len('window.DATA='):-2])
ORDER = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10']
LEMO = {'S01', 'S02', 'S07', 'S09', 'S10'}

def load(path, ss=0.0, t=None):
    cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(ss), '-i', path] + (['-t', str(t)] if t else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()

def lufs(path, ss=0, t=None):
    cmd = ['ffmpeg', '-nostdin', '-ss', str(ss), '-i', path] + (['-t', str(t)] if t else []) + ['-af', 'ebur128', '-f', 'null', '-']
    out = subprocess.run(cmd, capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])

db = lambda x: 10 ** (x / 20)
A = f'{ROOT}/shared/audio'
MUSIC = f'{A}/music_expansion.wav'
music_gain = db(-33 - lufs(MUSIC, 0, 90))
cr_gain = db(-38 - lufs(f'{A}/crickets.wav', 0, 30))
wv_gain = db(-34 - lufs(f'{A}/waves.wav', 0, 30))
pop = load(f'{A}/pop.wav')[: int(0.12 * SR)]
whoosh = load(f'{A}/whoosh.wav')
chime = load(f'{A}/chime.wav')

def put(buf, snd, t, g):
    i = int(t * SR); n = min(len(snd), len(buf) - i)
    if n > 0 and i >= 0: buf[i:i + n] += snd[:n] * g

def fade(x, fin, fout):
    n = len(x); a = np.ones(n, np.float32)
    if fin: k = int(fin * SR); a[:k] = np.linspace(0, 1, k)
    if fout: k = int(fout * SR); a[n - k:] *= np.linspace(1, 0, k)
    return x * a[:, None]

off = 2.0   # music start inside the track (skip the very first bars)
for sid in ORDER:
    d = DATA[sid]; nfr = round(d['dur'] * 30); dur = nfr / 30; n = int(round(dur * SR))
    W = {i: w['t0'] for i, w in enumerate(d['words'])}
    buf = np.zeros((n, 2), np.float32)
    vpath = f'{ROOT}/voice/{sid}.wav'
    put(buf, load(vpath), 0, db(-16 - lufs(vpath)))
    m = load(MUSIC, off, dur); m = m[:n]
    if sid == 'S10': m = fade(m, 0, 1.4)
    put(buf, m, 0, music_gain); off += dur
    sfx = []
    if sid == 'S01':
        put(buf, fade(load(f'{A}/crickets.wav', 3, dur), 0.2, 0.2), 0, cr_gain); sfx.append((whoosh, W[9] - 0.1, db(-14)))
    if sid == 'S02':
        sfx += [(pop, 0.02, db(-12)), (pop, W[12] - 0.04, db(-10)), (pop, W[13] - 0.04, db(-10)), (pop, W[15] - 0.04, db(-10)), (whoosh, W[10] - 0.2, db(-18))]
    if sid == 'S04': sfx.append((whoosh, W[2] - 0.2, db(-14)))
    if sid == 'S05': sfx += [(pop, W[i] - 0.03, db(-15)) for i in (6, 8, 11, 13)]
    if sid in ('S06', 'S07', 'S08'):
        start = W[6] - 0.3 if sid == 'S06' else 0
        put(buf, fade(load(f'{A}/waves.wav', 10 + start, dur - start), 0.4, 0.2), start, wv_gain)
    if sid == 'S07': sfx.append((whoosh, W[4], db(-16)))
    if sid == 'S08': sfx.append((whoosh, W[5] - 0.25, db(-16)))
    if sid == 'S09': sfx += [(whoosh, W[1] - 0.2, db(-14)), (whoosh, W[6] - 0.2, db(-18))]
    if sid == 'S10':
        put(buf, fade(load(f'{A}/crickets.wav', 3 + 4.6, dur), 0.2, 1.0), 0, cr_gain); sfx.append((chime, d['voiceDur'] + 0.02, db(-14)))
    for s, t, g in sfx: put(buf, s, max(0, t), g)
    dst = (sys.argv[1] if sid in LEMO else sys.argv[2]) + f'/{sid}_mix.wav'
    raw = buf.astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'alimiter=limit=0.89:level=false', '-c:a', 'pcm_s24le', dst], input=raw, check=True)
    print(sid, f'{dur:.3f}s', dst)

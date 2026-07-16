"""Basic authenticated API load probe; run only against staging.
Usage: python load_test.py http://localhost:8000 20
"""
import concurrent.futures
import sys
import time
from urllib.request import urlopen

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
count = int(sys.argv[2]) if len(sys.argv) > 2 else 20
def probe(_):
    started = time.perf_counter()
    with urlopen(f"{base}/healthz/", timeout=10) as response: response.read()
    return time.perf_counter() - started
with concurrent.futures.ThreadPoolExecutor(max_workers=count) as pool:
    times = list(pool.map(probe, range(count)))
print(f"requests={count} p95={sorted(times)[max(0, int(count * .95) - 1)] * 1000:.1f}ms max={max(times) * 1000:.1f}ms")

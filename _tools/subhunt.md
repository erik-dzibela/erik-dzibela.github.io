---
title: "subhunt"
date: 2026-01-12
language: "Python"
description: "Async subdomain bruteforcer with wildcard DNS detection to cut down on false positives. Fast, clean output, and SecLists compatible."
github: "https://github.com/erik-dzibela/subhunt"
tags: [recon, dns, async]
---

Async subdomain bruteforcer built for speed. It uses Python's `asyncio` to hammer through large wordlists quickly, with automatic wildcard DNS detection to filter false positives before they pollute your results.

No external dependencies beyond `dnspython`.

## Installation

```bash
git clone https://github.com/erik-dzibela/subhunt
pip3 install dnspython
```

## Usage

```bash
# Basic scan
python3 subhunt.py example.com -w wordlist.txt

# Crank up threads for speed
python3 subhunt.py example.com -w wordlist.txt -t 200

# Save results to file
python3 subhunt.py example.com -w wordlist.txt -o results.txt

# Skip wildcard check
python3 subhunt.py example.com -w wordlist.txt --no-wildcard-check
```

## Options

| Flag | Description |
|------|-------------|
| `-w, --wordlist` | Path to wordlist file (required) |
| `-t, --threads` | Concurrent threads (default: 50) |
| `-o, --output` | Save results to file |
| `--no-wildcard-check` | Skip wildcard DNS detection |
| `--timeout` | DNS resolution timeout in seconds (default: 3.0) |

## Wildcard DNS Detection

Some domains resolve every subdomain to the same IP regardless of whether it exists — without detection this floods your results with false positives. `subhunt` resolves a random nonsense subdomain before scanning and filters any matching IPs from results automatically.

Pairs well with [SecLists](https://github.com/danielmiessler/SecLists) DNS wordlists.

---
title: "portknock"
date: 2026-01-02
language: "Python"
description: "Async port knocking tool with post-knock scanning and banner grabbing."
github: "https://github.com/erik-dzibela/portknock"
tags: [recon, networking, async]
---

Async port knocking tool built for HTB and CTF workflows. Send TCP or UDP knock sequences, then automatically scan to verify a port opened and grab service banners.

No external dependencies. Python 3.10+ only.

## Usage

```bash
# Basic TCP knock sequence
python3 portknock.py 10.10.10.1 7000 8000 9000

# UDP knock sequence
python3 portknock.py 10.10.10.1 7000 8000 9000 --udp

# Knock then scan specific ports
python3 portknock.py 10.10.10.1 7000 8000 9000 --scan 22,80,443

# Knock, scan a range, grab banners
python3 portknock.py 10.10.10.1 7000 8000 9000 --scan 1-1024 --grab

# Custom delay between knocks (ms)
python3 portknock.py 10.10.10.1 7000 8000 9000 --delay 500
```

## Options

| Flag | Description |
|------|-------------|
| `--udp` | Use UDP knock packets instead of TCP |
| `--scan PORTS` | Scan ports after knocking — accepts `22,80,443` or ranges like `1-1024` |
| `--grab` | Grab service banners from open ports found during scan |
| `--delay MS` | Delay between knocks in milliseconds (default: 100) |
| `--scan-timeout SEC` | Per-port timeout during scan (default: 2.0) |

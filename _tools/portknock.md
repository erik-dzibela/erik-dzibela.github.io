---
title: "portknock"
date: 2024-02-10
language: "Python"
description: "A fast, async port knocker and service fingerprinter. Supports custom knock sequences, TCP/UDP, and JSON output for pipeline integration."
github: "https://github.com/yourhandle/portknock"
tags: [recon, networking, async]
---

## About

`portknock` is a lightweight async port knocker written in Python 3.10+. It's built for speed — using `asyncio` it can knock thousands of ports per second on LAN.

## Features

- Async TCP/UDP scanning
- Custom knock sequences from file or CLI
- JSON output for pipeline use
- Banner grabbing + service fingerprinting

## Usage

```bash
pip install portknock

# Basic knock sequence
portknock 192.168.1.1 7000 8000 9000

# From file, with JSON output
portknock --sequence seq.txt --json 192.168.1.1

# Banner grab after knock
portknock --grab 192.168.1.1 22 80 443
```

## Installation

```bash
git clone https://github.com/yourhandle/portknock
cd portknock
pip install -r requirements.txt
python portknock.py --help
```

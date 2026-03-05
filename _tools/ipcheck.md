---
title: "ipcheck"
date: 2026-03-05
language: "Python"
description: "A simple CLI based utility that can check the reputation of IPs using the AbuseIPDB API."
github: "https://github.com/erik-dzibela/IPCheck/blob/main/ipcheck.py"
tags: [recon, networking, soc]
---

`AbuseIPDB Check` is a lightweight CLI based IP reputation retrieval tool that uses the AbuseIPDB API. Very useful when working from the CLI and you need to quickly check an IPs reputation.

## Features

- Clean, formatted CLI output
- Verdict based on AbuseIPDB confidence score and report count
- Save results to file for logging/reporting
- Validates that the IP is public before querying

## Planned features

- Check multiple IPs (currently, this script only checks one IP at a time)

## Usage

- Note: Before using, you need a valid AbuseIPDB API.

```bash
# Lookup
python3 ipcheck.py

```

## Installation

```bash
git clone https://github.com/erik-dzibela/IPCheck/blob/main/ipcheck.py
pip3 install requests
```

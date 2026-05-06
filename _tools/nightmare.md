---
title: "nightmare"
date: 2026-05-06
language: "Python"
description: "Linux privilege escalation enumeration with AI-powered triage. Find the path to root — fast."
github: "https://github.com/r00t26/nightmare"
tags: [privesc, linux, ai, recon]
status: "under-development"
---

> **Under Development** — actively being built and battle-tested. Something wicked this way comes.

## Every system has a secret. nightmare finds it.

Most privesc tools give you everything and explain nothing. You get a wall of red text, a thousand findings, and no idea where to start. nightmare is built around a different idea: run targeted checks across the most dangerous Linux attack surfaces, cut the noise, and hand the findings straight to AI for triage.

The result is a ranked attack path. Not a dump. A path.

## How it works

nightmare runs a comprehensive suite of Linux privilege escalation checks (capabilities, SUID binaries, writable services, cron jobs, credential exposure, kernel CVEs, docker escapes, and more). When it's done, it packages everything into a structured prompt and lets you send it to Claude.

You get back something like this:

```
RANK 1 — Python3.8 cap_setuid Capability
Severity: Critical
Why: cap_setuid on an interpreter allows instant privilege escalation to root
Exploit: python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

Exact. Actionable. Ready to run.

## Battle tested

nightmare has been run against real HackTheBox machines and correctly surfaced the intended privilege escalation vector on first scan with no manual enumeration beforehand.

It works. More is coming.

---

*Full release, documentation, and public repository coming soon.*

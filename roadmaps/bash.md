Shell Fundamentals — Navigation & Files
Navigate Directories
ls, cd, mkdir, rmdir, pwd

Files & Directories Commands
cp, echo, mv, cat, touch, find, rm

File Permissions
chmod, chown, chgrp, and permission notation rwx

Shell Utilities
Tab Completion — auto-complete paths and commands

Bash Alias — shorthand for long commands

Repeat Commands — using !!, !n, history

Help Commands — man, --help, info

Stop Execution — Ctrl+C, kill

Redirects & Pipelines
Concept	Description
stdin, stdout, stderr	Standard I/O streams (0, 1, 2)
Pipes \|	Chain command output to input
Output redirection >, >>	Write/append output to file
Input redirection <	Feed file as input
Command substitution $()	Use command output as value
Process substitution <()	Use process output as file
Error redirection 2>	Redirect stderr separately

Text Editors -- skip for now this concepts
Nano, Vim, Vi, Emacs

Basic Editor Operations
less, more, grep, head, tail

Working with Text
View & Search
grep — pattern search in files

Text Transformation
sed, tr, cut, paste, join, split

Text Analysis
sort, wc, uniq, nl, awk

Wildcards
*, ?, [...], {...} — glob patterns for file matching

Bash Scripting — Syntax Concepts
Script Anatomy & Execution
Bash Script Anatomy — shebang #!/bin/bash, structure

Running Shell Scripts — Running with Bash, Direct Execution, Running with Source

Variables
Environment vs Shell variables

Variable scopes

Create, print, modify (=, $VAR, export)

Variables best practices

Special variables: $1, $2, $3, $0, $#, $*, $@, shift

String Manipulation
String length — ${#var}

Pattern replacement — ${var//pattern/replace}

Substring extraction — ${var:offset:length}

Case conversion — ${var^^}, ${var,,}

Input / Output
Read user input — read command

Here documents — <<EOF blocks

printf formatting

Here strings — <<<

Bash Data Types
Literals, Strings, Arrays, Numeric, Associative Arrays

Comments
#single-line comment

Operators
Category	Examples
Arithmetic	+, -, *, /, %, **
Logical	&&, \|\|, !
Comparison	-eq, -ne, -lt, -gt, -le, -ge
File test	-f, -d, -e, -r, -w, -x
String operators	=, !=, -z, -n

Working with Numerics
Arithmetic expansion — $(( expr )), let, expr, awk, bc

Control Flow
Conditionals
if, case

Loops
for, while, until, break, continue

Exit Codes
exit, $?, success vs failure (0 = success, non-zero = failure)

Regular Expressions
Basic regex syntax — anchors ^$, ., *, character classes

Extended regex — +, ?, |, () groups 

regex + grep, sed, awk — practical usage

Functions
Basic function definition and calling

Function Scopes — local keyword

Recursive Functions

Error Handling
set -e (exit on error), set -u (unset var = error), set -o (set options), trap, error logging

Advanced Scripting
Tool	Purpose
set -x	Debug: print each command before execution
bash -n	Syntax check without running
shellcheck	Static analysis linter for scripts

Process Management
ps, jobs, fg, bg, nohup, disown, background jobs (&), process substitution

System Monitoring
top, htop, free, uptime, df, du, iostat, vmstat

Networking Commands
ping, curl, wget, ssh, scp, rsync, ifconfig, ip, netstat, ss

Package Management
apt (Debian/Ubuntu), dnf / yum (RHEL/Fedora), brew (macOS)

File Compression
tar, gzip/gunzip, zip/unzip, bzip2, xz

Task Scheduling
cron / crontab, at, systemd timers


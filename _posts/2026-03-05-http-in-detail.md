---
layout: post
title: "HTTP In Detail"
date: 2025-01-05
tags: [networking, http, https, theory, web]
description: "A deep dive into HTTP and HTTPS — how they work, URLs, request methods, status codes, headers, and cookies."
---

**HTTP (Hyper-Text Transfer Protocol)** was developed between 1989-1991 by Tim Berners-Lee. It is a stateless Layer 7 (Application) protocol that primarily utilises TCP. HTTP is a set of rules used to communicate with web servers for the purpose of exchanging web page data — HTML, images, videos, and so on.

**Stateless** means that HTTP does not keep track of previous requests. For this we use cookies, which we'll cover later.

HTTP has largely been replaced by **HTTPS**, a secure variant of HTTP. HTTP is a plain-text protocol, meaning all data travels in an unencrypted form — allowing malicious actors to intercept traffic and view its contents freely.

**HTTPS (Hyper-Text Transfer Protocol Secure)** fixed this by introducing **TLS (Transport Layer Security)** encryption — an asymmetric encryption algorithm that relies on private and public key pairs, also known as asymmetric public key infrastructure.

> **Note:** Asymmetric encryption is used first to establish a secure connection, then symmetric encryption is used for the remainder of the communication. This is because symmetric encryption is significantly faster. Asymmetric, however, is more secure.

- **HTTP** uses port **80**
- **HTTPS** uses port **443**

## The TLS Handshake

HTTPS establishes a secure connection through a TLS handshake. During this process, the client and server do the following:

1. The client browser and web server exchange hello messages
2. Both parties communicate their supported encryption standards
3. The server shares its certificate with the browser
4. The client verifies the certificate's validity
5. The client uses the server's public key to generate a pre-master secret key
6. This secret key is encrypted using the public key and shared with the server
7. Both sides compute the symmetric session key from the pre-master secret
8. Both sides confirm they have computed the correct session key
9. All further data transmission uses symmetric encryption

## URLs (Uniform Resource Locator)

A URL is an instruction on how to access a resource on the internet. It specifies a resource's location so that it can be retrieved. For instance, sharing `youtube.com` will take you to YouTube's home page — not a specific video. You need the full URL to access a specific resource.

> **Note:** A domain name is not the same as a URL, though a domain name is a part of a URL.

A URL is made up of several components:

| Component | Description |
|-----------|-------------|
| **Scheme** | The protocol to use — HTTP, HTTPS, FTP, etc. |
| **Subdomain** | Optional prefix to the domain — e.g. `www`, `mail` |
| **Domain** | The core name — e.g. `r00t26` |
| **Top-Level Domain** | The suffix — e.g. `.com`, `.org` |
| **Port** | The port to connect to — typically 80 or 443 |
| **Path** | The file name or location of the resource |
| **Query String** | Extra parameters passed to the resource — e.g. `?id=1903` |
| **Fragment** | A reference to a specific location on the page — e.g. `#section-2` |

URLs are important for two reasons: they help us organise and find things on the internet, and they define the structure of a website.

## HTTP Requests

When we want to access the contents of a web page, we make a **request**. An HTTP request is made by a client to a server, with the aim of accessing a resource. At its most basic, a request can be a single line:

```
GET / HTTP/1.1
```

In practice, we use **headers** to pass additional context and metadata with requests. An HTTP header consists of its case-insensitive name, followed by a colon and its value. For example:

```
Host: r00t26.com
User-Agent: Mozilla/5.0 Firefox/87.0
Referer: http://r00t26.com
```

## HTTP Methods

HTTP methods tell the server what action the client intends to perform.

| Method | Description |
|--------|-------------|
| **GET** | Retrieve information from the server |
| **POST** | Submit data to the server, creating new records |
| **PUT** | Submit data to the server to update existing information |
| **DELETE** | Delete information or records from the server |
| **HEAD** | Same as GET but without the response body |
| **CONNECT** | Establish a tunnel to the server identified by the target resource |

## HTTP Status Codes

Status codes tell us the result of our request — whether it succeeded, failed, or something in between.

| Range | Category |
|-------|----------|
| **100-199** | Informational — first part of request accepted, continue sending |
| **200-299** | Success — request was completed successfully |
| **300-399** | Redirection — client is redirected to another resource |
| **400-499** | Client Errors — something was wrong with the request |
| **500-599** | Server Errors — something went wrong on the server side |

### Most Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request completed successfully |
| **201** | Created | A new resource was created (e.g. new user or post) |
| **301** | Permanent Redirect | Page has permanently moved — search engines take note |
| **302** | Temporary Redirect | Page has temporarily moved |
| **400** | Bad Request | Something was wrong or missing in the request |
| **401** | Not Authorised | Authentication is required to access this resource |
| **403** | Forbidden | You do not have permission — even if logged in |
| **404** | Not Found | The page or resource does not exist |
| **405** | Method Not Allowed | The resource doesn't support this request method |
| **500** | Internal Server Error | The server encountered an error it doesn't know how to handle |
| **503** | Service Unavailable | The server is overloaded or down for maintenance |

## HTTP Headers

### Common Request Headers

| Header | Description |
|--------|-------------|
| **Host** | Specifies which website to serve when a server hosts multiple sites |
| **User-Agent** | Your browser software and version — helps the server format responses correctly |
| **Content-Length** | How much data to expect in the request body |
| **Accept-Encoding** | What compression methods the browser supports |
| **Cookie** | Previously stored data sent back to the server |

### Common Response Headers

| Header | Description |
|--------|-------------|
| **Set-Cookie** | Instructs the browser to store a cookie |
| **Cache-Control** | How long to store the response in the browser's cache |
| **Content-Type** | What type of data is being returned — HTML, CSS, JSON, etc. |
| **Content-Encoding** | What compression method was used on the response |

## Cookies

Cookies are small pieces of data that a web server sends to a user's browser. The browser stores them and sends them back to the same server on subsequent requests. This is what allows websites to remember you between visits — keeping you logged in, remembering your shopping cart, and so on.

Because HTTP is stateless, cookies are the mechanism used to "remind" the web server who you are.

Cookies are set via the `Set-Cookie` response header. On every subsequent request, the browser sends them back using the `Cookie` request header.

Cookies are primarily used for:

- **Session management** — logins, shopping carts, game scores, anything the server needs to remember
- **Personalisation** — user preferences, themes, and settings
- **Tracking** — recording and analysing user behaviour, commonly used for targeted advertising

## Summary

HTTP and HTTPS are the foundation of all web communication. Understanding how requests are structured, what methods and status codes mean, and how headers and cookies work is essential for both web development and web security. Whether you're hunting for vulnerabilities or analysing traffic in Burp Suite, this knowledge underpins everything you'll encounter on the web.

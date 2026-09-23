---
title: "How to Make a QR Code for Your WiFi Network"
description: "Make a WiFi QR code guests can scan to join instantly — no typing passwords. Works with the standard WIFI:T:WPA format and takes under a minute to create."
keywords: ["qr code for wifi", "wifi qr code generator", "how to make wifi qr code", "scan qr code to join wifi", "share wifi with qr code"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-make-qr-code-for-wifi.jpg"
imageAlt: "A phone scanning a QR code printed on a card that says WiFi Guest Network"
readingMinutes: 5
faqs:
  - q: "How do I create a QR code for my WiFi?"
    a: "Use a QR generator with a Wi-Fi preset. Replace the sample network name and password with your own SSID and password in the format WIFI:T:WPA;S:YourNetwork;P:YourPassword;; then download the code."
  - q: "Do guests need an app to scan a WiFi QR code?"
    a: "No. The camera app on modern iPhones and Android phones recognizes WiFi QR codes natively — they point the camera, tap the prompt, and join."
  - q: "Is it safe to share my WiFi password via QR code?"
    a: "The password is encoded in the QR code, so anyone who scans or photographs it gets the password. For guests, use a separate guest network rather than your main network password."
  - q: "What does WIFI:T:WPA;S:..;P:.. mean?"
    a: "It's the standard WiFi QR format: T is the security type (WPA, WPA2/WPA3, or WEP), S is the network name (SSID), and P is the password. Phones read this format to join automatically."
  - q: "What if my network has no password?"
    a: "Use T:nopass and leave the password empty. Open networks work with QR codes too, though a password-protected guest network is always the safer choice."
related: ["qr-code-for-business-cards-guide", "qr-code-menu-for-restaurants"]
---

The short version: a WiFi QR code encodes your network name and password in a scannable format. Guests point their phone camera at it and join — no hunting for the password on the bottom of the router.

If you've ever watched someone squint at "X7$kQ!2mP" printed in 6-point type under a router, you know the problem. Dictating passwords letter by letter is worse. A printed QR code on the fridge, the guest room wall, or the office reception desk ends the ritual permanently.

## How WiFi QR codes work

Phones understand a standard format for WiFi QR codes:

```
WIFI:T:WPA;S:YourNetworkName;P:YourPassword;;
```

- **T:** security type — WPA, WPA2/WPA3 (just use WPA), WEP, or `nopass` for open networks
- **S:** your network name (SSID), exactly as it appears
- **P:** the password, exactly as typed
- The trailing `;;` closes the format — keep both semicolons

When a phone camera reads this, it doesn't open a website — it recognizes the format and offers to join the network directly. No app needed on modern iPhones or Android devices.

## Create one in under a minute

1. Open the [free QR code generator](/tools/qr-generator) — it runs entirely in your browser.
2. Select the **Wi-Fi Network** preset. It loads the correct format for you.
3. Replace the sample values with your real network name and password. Double-check the spelling — one wrong character and guests connect to nothing.
4. Set the security type to match your router (WPA covers WPA2/WPA3 for this purpose).
5. Customize if you like: colors, size, and margin. Keep good contrast — dark code on a light background scans most reliably.
6. Download as **PNG** for printing or **SVG** for crisp scaling to any size.

Then test it with your own phone before printing. Scan, join, confirm. Only then print and stick it where guests can find it.

## The security question

A QR code is not encryption — **anyone who can see or photograph the code gets your password**. So be smart about it:

**Use a guest network.** Almost every modern router can broadcast a separate guest SSID. Put guests on that, keep your main network (with your computers, printers, and smart-home devices) private. The QR code shares the guest password only.

**Place it thoughtfully.** A code on the wall inside your home is fine. A code visible through the window to the street is not.

**Change the password when it matters.** Airbnb host rotating guests? Change the guest password between stays and reprint the code — it takes a minute.

**Mind special characters.** Some SSIDs and passwords contain semicolons, commas, or backslashes, which need escaping in the QR format. If your password is exotic, test the scan carefully — or simplify the password for the guest network.

## Where to put the code

- **Home:** fridge, guest room, entryway — anywhere visitors naturally wait
- **Office:** reception desk or meeting rooms, on a small tent card
- **Rental properties:** the welcome binder or framed on the wall
- **Cafés and shops:** counter or table tents (pairs well with a [QR menu](/qr-code-menu-for-restaurants) on the same card)

Print at a reasonable size — about 5cm / 2 inches square minimum for reliable scanning from arm's length. SVG downloads scale infinitely, so size is never a quality problem.

## Troubleshooting scans that don't work

If a guest's phone won't read your code, it's almost always one of these:

**Wrong SSID or password.** The most common failure. SSIDs are case-sensitive, and trailing spaces are invisible killers. Copy-paste from your router admin page rather than retyping.

**Hidden SSID.** If your network doesn't broadcast its name, add `H:true` to the format: `WIFI:T:WPA;S:Name;P:Pass;H:true;;`. Some phones handle hidden networks poorly via QR — test before relying on it.

**Special characters.** Semicolons, commas, colons, backslashes, and quotes inside the SSID or password need escaping with a backslash (`\;`). If your password is punctuation-heavy, simplify the guest network password — it's a guest network, not a vault.

**Low contrast or damage.** Faded prints, glossy reflections, or a code printed too small all cause failures. Reprint larger, on matte paper, with strong dark-on-light contrast.

**Old phones.** Very old devices may lack native QR scanning in the camera app. For those guests, print the SSID and password in plain text under the code as a fallback — belt and suspenders.

## Should you hide your main network?

A quick word on a common question: hiding your SSID (not broadcasting it) adds almost no real security — the network name is trivially discoverable by anyone with basic tools — but it does make legitimate joining harder. The better setup: broadcast a guest network with a QR code for visitors, keep your main network's strong password private, and don't worry about hiding anything. Convenience for guests, isolation for your devices.

## One more use: your own devices

WiFi QR codes aren't just for guests. New phone, new laptop, a friend's tablet you're setting up — scanning beats typing a 20-character password every time. Save the PNG somewhere handy (a notes app, a printed card in the router box) and you'll use it more than you expect. Some people also keep a copy in their password manager's notes field alongside the network password — one place for everything WiFi-related.

It takes sixty seconds to make, it never expires, and it retires one of the great small annoyances of modern life. [Generate yours](/tools/qr-generator) and print it today.

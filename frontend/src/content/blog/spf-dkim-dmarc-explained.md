---
title: "SPF, DKIM, and DMARC Explained (Without the Jargon)"
description: "A plain-English guide to SPF, DKIM, and DMARC: what each email authentication record does, why it matters, and how to set them up."
slug: spf-dkim-dmarc-explained
date: 2025-12-12
author: Samuel Malkasian
tags: email deliverability, email authentication, spf, dkim, dmarc
image: https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&q=80&auto=format&fit=crop
imageAlt: "SPF, DKIM, and DMARC Explained (Without the Jargon)"
imageCredit: Unsplash
imageCreditUrl: https://unsplash.com
---
If your emails keep landing in spam, or you have heard that you need to "set up SPF and DMARC" and have no idea what that means, this is for you. SPF, DKIM, and DMARC are three small settings that prove your email is really from you. Set them up and your messages get delivered and trusted. Skip them and inboxes treat you like a stranger. This guide explains all three in plain English, in the order you should set them up, with no networking degree required.

## The Problem These Solve: Anyone Can Fake Your Address

Email was built in a more trusting era. By default, nothing stops a scammer from sending a message that says it is from billing@yourcompany.com, even though they have no connection to you. That is called spoofing, and it is how a lot of phishing works.

Inbox providers like Gmail and Outlook know this, so they have become suspicious. When a message arrives, they ask a quiet question: can this sender prove the mail really came from who it claims? If the answer is no, your legitimate email gets the same treatment as a fake one, which means the spam folder or no delivery at all.

SPF, DKIM, and DMARC are how you answer that question with a confident yes. Think of them as the difference we describe in our guide to [why emails land in spam](/blog/avoid-spam-filters): authentication is the foundation everything else sits on.

## The Doorman Analogy

Picture an exclusive event with a doorman checking everyone who tries to enter claiming to represent your company.

- **SPF is the guest list.** It tells the doorman which servers are allowed to send mail on your behalf. If a message arrives from a server not on the list, that is a red flag.
- **DKIM is the tamper-proof seal.** It is a signature that proves the message really came from your domain and was not altered in transit. The doorman can check the seal and confirm it is genuine.
- **DMARC is the doorman's instructions.** It tells the inbox what to do when a message fails the checks, and it sends you a report on who is trying to send mail in your name.

You want all three working together. SPF and DKIM do the checking. DMARC decides the consequences and gives you visibility.

## SPF: Who Is Allowed to Send Your Mail

SPF stands for Sender Policy Framework. It is a single line of text you add to your domain's DNS settings (the same place your website address points from). That line lists every service permitted to send email using your domain: your email provider, your marketing platform, your invoicing tool, and so on.

A simple SPF record looks like this:

> v=spf1 include:_spf.google.com include:sendgrid.net ~all

You do not need to memorize the syntax. The important ideas are:

- Each `include` adds an authorized sender. Your email host and any tool that sends on your behalf each provide the exact value to add.
- You get **one** SPF record per domain. If you have several, merge them into one, because multiple records break the check.
- Keep it under ten lookups, an SPF technical limit. If you use many sending tools, this can trip you up, and it is the most common SPF mistake.

When you add a new tool that sends email for you, update SPF or that tool's mail will start failing.

## DKIM: The Tamper-Proof Signature

DKIM stands for DomainKeys Identified Mail. Where SPF checks which server sent the mail, DKIM proves the message itself is genuine and unaltered.

Here is how it works without the cryptography lecture. Your email provider holds a secret key and uses it to add an invisible signature to every message you send. You publish the matching public key in your DNS. When a message arrives, the receiving inbox uses the public key to confirm the signature is valid and that nothing was changed along the way.

Setting it up is mostly copy and paste. Your email provider generates the key and gives you a record to add to DNS. You add it once and it works quietly from then on. The two things to watch:

- **Turn it on deliberately.** Some providers enable DKIM by default and some do not. Check your admin settings rather than assume.
- **Do not let the key go stale.** If you ever rotate or regenerate the key, update DNS to match, or signing breaks.

## DMARC: The Policy That Ties It Together

DMARC stands for Domain-based Message Authentication, Reporting, and Conformance. It is the boss of the three. DMARC does two jobs: it tells inboxes what to do with mail that fails SPF and DKIM, and it emails you reports showing who is sending mail in your name.

Your DMARC policy has three possible settings, and you move through them in order:

1. **p=none (monitor):** Inboxes do nothing differently, but you start receiving reports. This is where everyone begins. You watch the reports for a few weeks to confirm your legitimate mail passes and to spot anyone spoofing you.
2. **p=quarantine:** Mail that fails the checks gets sent to spam rather than the inbox. You move here once your real mail consistently passes.
3. **p=reject:** Mail that fails is refused outright and never reaches the recipient. This is the strongest protection and the goal for most established domains.

The mistake to avoid is jumping straight to reject. If your SPF or DKIM is not fully correct yet, you will block your own newsletters and invoices. Start at none, read the reports, fix what fails, then tighten.

## The Order to Set Them Up

Doing this in sequence saves you from blocking your own mail.

1. **Publish SPF first.** List every service that sends on your behalf. Take your time and get the full list.
2. **Turn on DKIM next.** Enable it in your email provider and add the key to DNS.
3. **Add DMARC at p=none.** Include a reporting address so you actually receive the data.
4. **Read the reports for two to four weeks.** Confirm your real mail passes both SPF and DKIM.
5. **Move to quarantine, then reject.** Step up only when the reports are clean.

This pairs naturally with using a proper sending domain in the first place, which we cover in our guide to choosing a [professional email address](/blog/professional-email-address). Authentication on a free consumer address is not something you control the same way. Once your domain is trusted, a clean, consistent signature reinforces that trust on every message, and you can [create a free email signature](/create) in a couple of minutes to match.

## How to Check What You Have Now

You do not need special software to audit your setup. Free DMARC and SPF checker tools let you type in your domain and see, in plain language, whether each record exists and whether it is valid. Many inbox providers also show authentication results when you open a message and view its details, listing "SPF: pass" and "DKIM: pass" or the failures.

If you run any real volume of email, set up a DMARC reporting tool. Raw reports arrive as dense files that are hard to read by eye, and a reporting service turns them into a simple dashboard of who is sending mail as you and whether it passes. That visibility is often where people discover a tool they forgot to authorize, or an actual spoofing attempt.

## Common Mistakes That Quietly Hurt You

- **Multiple SPF records.** Only one is allowed. Two or more, and the check fails for all of them.
- **Forgetting a sending tool.** Add a new marketing or invoicing platform and forget SPF, and that mail starts failing.
- **Jumping to p=reject too soon.** This blocks your own legitimate email. Earn your way up the policy ladder.
- **No reporting address on DMARC.** Without it, you get the policy but none of the visibility, which is half the value.
- **Setting it and never revisiting.** Your sending tools change over time. Review your records when you add or drop a service.

Getting authentication right also helps your timing strategy land, since well-timed mail still has to reach the inbox first. Our piece on the [best time to send email](/blog/best-time-to-send-email) assumes your messages actually arrive, and that starts here.

## Frequently Asked Questions

### Do I really need all three, or is one enough?

You want all three, because they cover different gaps. SPF and DKIM each prove part of the story, and either one alone can be worked around. DMARC is what makes them enforceable and gives you reporting, but DMARC depends on SPF and DKIM being in place to function. Modern inbox providers increasingly expect all three, and some bulk senders now require them, so treat the full set as the baseline rather than optional extras.

### Will setting these up improve my deliverability right away?

It removes a major reason mail gets filtered, which often helps quickly, but authentication is a foundation, not a magic switch. Inboxes also weigh your sending reputation, how recipients engage with your mail, and your content. Think of SPF, DKIM, and DMARC as clearing the bar to be trusted at all. Once you pass, your list hygiene and content determine how well you do.

### What if I use Gmail or Outlook for my business domain?

The setup is the same idea, and your provider gives you the exact records to publish. Google Workspace and Microsoft 365 both document their SPF include value and walk you through generating a DKIM key in the admin console. You then add a DMARC record yourself. Using one of these providers does not authenticate your domain automatically. You still publish the records in your own DNS, but the values are provided for you.

## The Takeaway

SPF, DKIM, and DMARC are not as technical as they sound. SPF is your guest list of approved senders, DKIM is a tamper-proof seal on each message, and DMARC sets the consequences and reports back to you. Set them up in that order, start DMARC in monitor mode, read the reports, then tighten to reject. Do that once and your email stops looking suspicious to the inbox, which is the whole point.

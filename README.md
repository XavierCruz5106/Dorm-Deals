# Purpose

This project was created for the University of Delaware's HenHacks 2026.

# Dorm Deals

## Inspiration

Sources like Facebook Marketplace, eBay, and Poshmark, are free for anyone to use. With that high of a scope, untrustworthy people hoping to prey on desperate college students are prevalent. 
Meeting up with strangers always carries a risk, and they may or may not even show up regardless of if payment was transferred. Graduating, or students that otherwise are no longer in need 
of their supplies (clothes, textbooks, furniture) need somewhere to get rid of their things. Every year, thousands of students are seen dumping their things during move out season. Students 
need a safe alternative that will also redirect the blatant short term waste created. Creating some local exchange will alleviate new student stress revolving buying last minute items as 
well as leaving other students less guilty by repurposing rather than directly trashing their things.

## What it does

Allows UD users (verified through email) to be both sellers and buyers. Anyone can list an item they have for sale and list tags. Users can search via item name or tags (general item word, 
ex: product listed as "Tumbler 20oz" could be tagged as 'bottle' or 'water bottle') and select the desired listing. They can save interested products as favorites and view the favorites as 
a section. Interested buyers can contact sellers and ask inquiries and/or discuss potential meetup locations. Upon payment plans being agreed upon, sellers can mark an item as sold and they 
can arrange a meetup to hand off the product. User profiles and associated rating systems allow for other interested buyers to confirm general satisfaction of previous sales.

## How we built it

We leveraged v0 for creating the initial UI design of the project. From there, we were able to determine and connect endpoints, deal with validation, and query the supabase database for 
user credentials. Our front and back was handled via NextJS which made end-to-end connectivity seamless. Credential verification as well as authentication confirmed only UD students can 
create accounts.

## Challenges we ran into

- Topic changes throughout inception
- Shortened timeline
- Hardware limitations (unable to download certain software on all programmer's devices)

## Accomplishments that we're proud of

- A back and forth messaging system
- Email Verification/Validation

## What we learned

- Time management
- Task delegation
- Team strengths/collaboration
- Persisting database usage

## What's next for Dorm Deals

- Utilizing UDel SSO integration and payment portals
- SMS/Email Notification for messages
- Mobile application
- Campus map support

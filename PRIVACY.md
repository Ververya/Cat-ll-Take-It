# Privacy

Cat'll Take It is designed to minimize collection of
personal information.

## Emotional text

Text entered into the game is processed locally in the
user's browser.

The production version does not intentionally transmit
emotional text to the project owner, an AI service,
analytics provider, or remote database.

Text is held temporarily in browser memory and displayed
on the page during the transaction. It is cleared when the
transaction finishes or the user leaves the stall. The game
does not persist raw emotional text in localStorage,
sessionStorage, IndexedDB, or cookies.

## AI services

Gameplay does not use OpenAI, Anthropic Claude, Gemini,
or another remote LLM API.

## Local storage

Limited non-sensitive game state may be stored locally
in the browser, such as:

- recycle count and today's recycle count
- cat debt
- dates
- the one-time Easter Egg flag

The storage key is `bad-mood-recycling-v1`. Raw emotional
text is not saved. Progress is not synchronized between
browsers or devices.

## Accounts

No account is required.

## Clearing data

Users can remove locally stored game data by clearing
the site's browser storage.

## Hosting and fonts

The game and its font files are served from GitHub Pages.
The production version does not request fonts from Google
Fonts or another external font service. The game does not
include analytics, advertising trackers, session replay,
or a remote error logging service.

Loading static site files sends normal HTTP requests to
GitHub. GitHub may process connection information such as
IP addresses, browser information, and referrers under its
own privacy policy. These requests do not include the
emotional text entered into the game.

An optional telephone link is opened only when chosen by
the user. This document describes the game code; it does
not control browsers, extensions, network providers, or
GitHub's infrastructure.

# SoloStack article writer

Mirror of `/kspellman/sites/cloudflare/solostack.au/scripts/` on the server (that folder is the working copy; paths inside the
scripts point at the server layout). Writes SoloStack posts with ChatGPT into the retained Payload database, publishes them,
then `daily.sh` rebuilds the static export and deploys it to Cloudflare Pages.

- `generate-article.mjs`, `lib/`: the writer (`--plan` and `--mock` are free; real runs cost money). See its header for flags.
- `topics.txt`: `category | type | title | keyword | note`; finished topics are commented out as `# done <date> ...`.
- `run.sh`, `db.sh`, `daily.sh`: run the writer, start/stop the database, and the full publish run.

No secrets are stored here: the OpenAI and fal.ai keys are read from the app's `.env` on the server.

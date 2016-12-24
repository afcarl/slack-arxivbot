# slack-arxivbot
Slack bot which listens for ArXiv paper links and responds with summaries of the papers.

## Setup
Add just the Slack API token to a file called `slack-token`.

## Running with Docker

```sh
docker build -t slack-arxivbot .
docker run -it --rm --env slack_token_path=slack-token --name slack-arxivbot slack-arxivbot
```

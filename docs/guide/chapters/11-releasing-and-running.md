# Releasing and running

## A release

1. Every phase ends with its pull request merged and its definition of done ticked.
2. The version is raised (the API, the web app, and the phone app's version name and integer version code).
3. The API is deployed with its migrations; the web app is built and deployed.
4. The phone app is built signed (the key lives outside the repository), its file is checked (SHA-256), and the download page's `latest.json` is updated; phones update themselves (P79).
5. The release notes go in the guide's "Releases" page.

## Running it

- **Secrets** never go in the repository: `.env` files stay on the servers; only `.env.example` is committed.
- **Logs**: the API's logs and the phone app's log (exported by the person when something goes wrong).
- **Backups** of the database are the server's job, tested by restoring one.

> **Note**: Each product's guide writes down its own servers, addresses and steps in this chapter. The kit cannot know them.

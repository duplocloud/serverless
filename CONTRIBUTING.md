# Contributing  

Follow these steps to be proper. There is a lot of very specific steps and automations, please read this entire document before starting. Many questions will be answered by simply getting everything setup exactly the same way in the instructions.

## Clone the Repo

Clone the repo with the wiki submodule. The wiki submodule contains the static content and templates for mkdocs.

```sh
git clone git@github.com:duplocloud/serverless.git
```

## Direnv Setup

Here is a good start for a decent `.envrc` file.

```sh
source_up .envrc # only when this is under a parent workspace containing a .envrc file
layout python3 # creates the python venv using direnv
PATH_add ./scripts # adds the scripts folder to the path

# this localizes the entire duploctl environment so all is generated within the config folder
# otherwise all of this would default to your home directory, ie $HOME
export DUPLO_HOME="config"
export AWS_CONFIG_FILE="${DUPLO_HOME}/aws"
export DUPLO_CONFIG="${DUPLO_HOME}/duploconfig.yaml"
export DUPLO_CACHE="${DUPLO_HOME}/cache"
```

## Changelog  

Make sure to take note of your changes in the changelog. This is done by updating the `CHANGELOG.md` file. Add any new details under the `## [Unreleased]` section. When a new version is published, the word `Unreleased` will be replaced with the version number and the date. The section will also be the detailed release notes under releases in Github. The checks on the PR will fail if you don't add any notes in the changelog.

## Signed Commits  

This is a public repo, one cannot simply trust that a commit came from who it says it did. To ensure the integrity of the commits, all commits must be signed. Your commits and PR will be rejected if they are not signed. Please read more about how to do this here if you do not know how: [Github Signing Commits](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification/signing-commits). Ideally, if you have 1password, please follow these instructions: [1Password Signing Commits](https://blog.1password.com/git-commit-signing/).

## Installation and Building   

First install the dependencies.  
```sh
npm install
```

Then compile the typescript.  
```sh
npm run build
```

Here is how to build the npm package.  
```sh
npm pack
```

## Debugging  

Use the examples from the examples directory to debug. The vscode launch.json file is already setup to debug the examples. You can also use the `--debug` flag to get more information from the serverless framework.  

"""Build gate: product code may merge only once its requirement and its design are approved.

Sets the commit status `security/build-gate` on a pull request's head commit. The ruleset
on main requires it, so a red status blocks the merge.

A PR that changes product code (under rupi-yeah/) passes only if it closes at least one
requirement ("Closes #N"), and for every one of them:
- the requirement has `security-approved` (Stage 1), and
- a merged design PR refers to it ("Refs #N") and has `threat-model-approved` (Stage 2).

PRs that change no product code pass: they are not development.

Runs on every pull request event, and again whenever a requirement's labels change,
so a reset approval turns an old green check red.
"""
import os
import sys

import requests

GITHUB_API = "https://api.github.com"
STATUS = "security/build-gate"
PRODUCT_DIR = "rupi-yeah/"
REQ_APPROVED = "security-approved"
TM_APPROVED = "threat-model-approved"


def _headers():
    return {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}", "Accept": "application/vnd.github+json"}


def rest(method: str, path: str, **kwargs):
    r = requests.request(method, f"{GITHUB_API}{path}", headers=_headers(), timeout=30, **kwargs)
    r.raise_for_status()
    return r.json() if r.content else None


def graphql(query: str, **variables):
    r = requests.post(f"{GITHUB_API}/graphql", json={"query": query, "variables": variables}, headers=_headers(), timeout=30)
    r.raise_for_status()
    data = r.json()
    if data.get("errors"):
        raise RuntimeError(data["errors"])
    return data["data"]


CLOSING = """
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      headRefOid
      closingIssuesReferences(first: 10) { nodes { number labels(first: 20) { nodes { name } } } }
    }
  }
}"""

OPEN_PRS = """
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    pullRequests(states: OPEN, first: 50) {
      nodes { number closingIssuesReferences(first: 10) { nodes { number } } }
    }
  }
}"""


def design_approved(repo: str, issue: int) -> bool:
    """Is there a merged, threat-model-approved design PR that refers to this requirement?"""
    query = f'repo:{repo} is:pr is:merged label:{TM_APPROVED} "Refs #{issue}" in:body'
    hits = rest("GET", "/search/issues", params={"q": query})["items"]
    return any(f"Refs #{issue}" in (h["body"] or "") for h in hits)


def decide(repo: str, number: int) -> tuple[str, str, str]:
    owner, name = repo.split("/")
    pr = graphql(CLOSING, owner=owner, name=name, number=number)["repository"]["pullRequest"]
    files = rest("GET", f"/repos/{repo}/pulls/{number}/files", params={"per_page": 100})
    sha = pr["headRefOid"]
    if not any(f["filename"].startswith(PRODUCT_DIR) for f in files):
        return sha, "success", "No product code in this PR"
    issues = pr["closingIssuesReferences"]["nodes"]
    if not issues:
        return sha, "failure", "Link the requirement: add 'Closes #N' to the PR description"
    for issue in issues:
        n = issue["number"]
        if REQ_APPROVED not in {l["name"] for l in issue["labels"]["nodes"]}:
            return sha, "failure", f"Requirement #{n} is not security-approved"
        if not design_approved(repo, n):
            return sha, "failure", f"No approved, merged design for #{n}"
    refs = ", ".join(f"#{i['number']}" for i in issues)
    return sha, "success", f"Requirement and design approved for {refs}"


def evaluate_pr(repo: str, number: int):
    sha, state, text = decide(repo, number)
    rest("POST", f"/repos/{repo}/statuses/{sha}", json={"state": state, "context": STATUS, "description": text[:140]})
    print(f"PR #{number}: {STATUS} {state} ({text})")


def refresh_prs_for_issue(repo: str, issue: int):
    owner, name = repo.split("/")
    for pr in graphql(OPEN_PRS, owner=owner, name=name)["repository"]["pullRequests"]["nodes"]:
        if issue in {i["number"] for i in pr["closingIssuesReferences"]["nodes"]}:
            evaluate_pr(repo, pr["number"])


if __name__ == "__main__":
    evaluate_pr(os.environ["GITHUB_REPOSITORY"], int(sys.argv[1]))

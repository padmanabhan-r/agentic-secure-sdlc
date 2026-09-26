"""Build gate: a pull request may merge only if the requirement it closes is security-approved.

Sets a commit status, `security/requirement-approved`, on the PR's head commit.
A ruleset on `main` makes that status required, so a red status blocks the merge.

Called in two places:
- On every pull request event (gate workflow): evaluate that PR.
- After any label change on an issue (requirements workflow): re-evaluate every
  open PR that closes that issue, so a reset approval turns an old green check red.
"""
import os
import sys

import requests

GITHUB_API = "https://api.github.com"
CONTEXT = "security/requirement-approved"
APPROVED = "security-approved"


def _headers():
    return {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}", "Accept": "application/vnd.github+json"}


def graphql(query: str, **variables):
    r = requests.post(f"{GITHUB_API}/graphql", json={"query": query, "variables": variables}, headers=_headers(), timeout=30)
    r.raise_for_status()
    data = r.json()
    if data.get("errors"):
        raise RuntimeError(data["errors"])
    return data["data"]


PR_QUERY = """
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      headRefOid
      closingIssuesReferences(first: 10) { nodes { number labels(first: 20) { nodes { name } } } }
    }
  }
}"""

OPEN_PRS_QUERY = """
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    pullRequests(states: OPEN, first: 50) {
      nodes { number closingIssuesReferences(first: 10) { nodes { number } } }
    }
  }
}"""


def decide(issues: list[dict]) -> tuple[str, str]:
    """Pass only if the PR closes at least one issue and every one is approved."""
    if not issues:
        return "failure", "Link the requirement: add 'Closes #N' to the PR description"
    waiting = [f"#{i['number']}" for i in issues if APPROVED not in {l["name"] for l in i["labels"]["nodes"]}]
    if waiting:
        return "failure", f"Not security-approved yet: {', '.join(waiting)}"
    return "success", "Requirement " + ", ".join(f"#{i['number']}" for i in issues) + " is security-approved"


def evaluate_pr(repo: str, number: int):
    owner, name = repo.split("/")
    pr = graphql(PR_QUERY, owner=owner, name=name, number=number)["repository"]["pullRequest"]
    state, description = decide(pr["closingIssuesReferences"]["nodes"])
    requests.post(
        f"{GITHUB_API}/repos/{repo}/statuses/{pr['headRefOid']}",
        json={"state": state, "context": CONTEXT, "description": description[:140]},
        headers=_headers(),
        timeout=30,
    ).raise_for_status()
    print(f"PR #{number}: {state} ({description})")


def refresh_prs_for_issue(repo: str, issue_number: int):
    owner, name = repo.split("/")
    prs = graphql(OPEN_PRS_QUERY, owner=owner, name=name)["repository"]["pullRequests"]["nodes"]
    for pr in prs:
        if issue_number in {i["number"] for i in pr["closingIssuesReferences"]["nodes"]}:
            evaluate_pr(repo, pr["number"])


if __name__ == "__main__":
    evaluate_pr(os.environ["GITHUB_REPOSITORY"], int(sys.argv[1]))

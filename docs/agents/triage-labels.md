# Triage labels

This repo uses the five canonical triage labels. Each label string is equal to
its role name.

| Label             | Role                                                        |
| ----------------- | ----------------------------------------------------------- |
| `needs-triage`    | Issue has arrived but has not been reviewed yet.            |
| `needs-info`      | Issue is waiting on information from the reporter.          |
| `ready-for-agent` | Issue is clear enough for an agent to act on.               |
| `ready-for-human` | Issue needs a human decision or review.                     |
| `wontfix`         | Issue is valid but will not be addressed.                   |

These are consumed by the `triage` skill when routing issues into the queue.
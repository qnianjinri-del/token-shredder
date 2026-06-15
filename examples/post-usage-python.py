import json
import os
import sys
import urllib.error
import urllib.request


endpoint = os.environ.get("TOKEN_SHREDDER_URL", "http://127.0.0.1:17391/usage")

payload = {
    "source": "python-example",
    "scenarioName": "Python example usage",
    "inputTokens": 125_000,
    "outputTokens": 38_000,
    "cachedInputTokens": 18_000,
    "reasoningTokens": 4_500,
    "directCost": 0,
}

request = urllib.request.Request(
    endpoint,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8")
except urllib.error.HTTPError as error:
    print(f"Token Shredder rejected the event: {error.code}", file=sys.stderr)
    print(error.read().decode("utf-8"), file=sys.stderr)
    raise SystemExit(1)
except urllib.error.URLError as error:
    print(f"Could not reach Token Shredder at {endpoint}: {error}", file=sys.stderr)
    raise SystemExit(1)

print(f"Sent usage to {endpoint}")
print(body)

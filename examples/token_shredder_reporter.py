import json
import os
import sys
import urllib.error
import urllib.request


DEFAULT_ENDPOINT = os.environ.get("TOKEN_SHREDDER_URL", "http://127.0.0.1:17391/usage")


def number_from(*values):
    for value in values:
        if isinstance(value, (int, float)):
            return max(0, value)

        if isinstance(value, str) and value.strip():
            try:
                return max(0, float(value.replace(",", "").strip()))
            except ValueError:
                pass

    return 0


def event_from_openai_usage(
    source="python-agent",
    scenario_name="AI call",
    usage=None,
    direct_cost=0,
):
    usage = usage or {}
    prompt_details = usage.get("prompt_tokens_details") or usage.get("input_tokens_details") or {}
    completion_details = usage.get("completion_tokens_details") or usage.get("output_tokens_details") or {}
    prompt_tokens = number_from(usage.get("prompt_tokens"), usage.get("input_tokens"))
    cached_input_tokens = number_from(
        prompt_details.get("cached_tokens"),
        prompt_details.get("cached_input_tokens"),
    )

    return {
        "source": source,
        "scenarioName": scenario_name,
        "inputTokens": max(0, prompt_tokens - cached_input_tokens),
        "outputTokens": number_from(usage.get("completion_tokens"), usage.get("output_tokens")),
        "cachedInputTokens": cached_input_tokens,
        "reasoningTokens": number_from(completion_details.get("reasoning_tokens")),
        "directCost": number_from(direct_cost),
    }


def report_usage(event, endpoint=DEFAULT_ENDPOINT):
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(event).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def report_openai_usage(response, source="python-agent", scenario_name="AI call", endpoint=DEFAULT_ENDPOINT):
    usage = response.get("usage") if isinstance(response, dict) else getattr(response, "usage", None)
    event = event_from_openai_usage(source=source, scenario_name=scenario_name, usage=usage)
    total = sum(
        event[key]
        for key in [
            "inputTokens",
            "outputTokens",
            "cachedInputTokens",
            "reasoningTokens",
            "directCost",
        ]
    )

    if total <= 0:
        return None

    return report_usage(event, endpoint=endpoint)


if __name__ == "__main__":
    demo_response = {
        "usage": {
            "prompt_tokens": 180_000,
            "completion_tokens": 64_000,
            "prompt_tokens_details": {"cached_tokens": 40_000},
            "completion_tokens_details": {"reasoning_tokens": 9_000},
        }
    }

    try:
        result = report_openai_usage(
            demo_response,
            source="python-reporter-helper",
            scenario_name="Reporter helper demo",
        )
    except urllib.error.HTTPError as error:
        print(f"Token Shredder rejected the event: {error.code}", file=sys.stderr)
        print(error.read().decode("utf-8"), file=sys.stderr)
        raise SystemExit(1)
    except urllib.error.URLError as error:
        print(f"Could not reach Token Shredder at {DEFAULT_ENDPOINT}: {error}", file=sys.stderr)
        raise SystemExit(1)

    print(f"Reported usage to {DEFAULT_ENDPOINT}")
    print(json.dumps(result, indent=2, ensure_ascii=False))

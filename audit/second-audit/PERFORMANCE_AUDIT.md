# Performance and Stability Audit

## Observed behavior

- The 1080p30 proxy test completed successfully.
- A source-quality 2160x3840 HEVC semantic render failed on frame 1 after the Remotion media wait.
- The preview render copies the large public directory and uses the proxy, which avoids the source decode failure but is not a source-quality validation.
- Remotion uses default concurrency (`4x` in the observed render output); no project-level resource policy exists.
- No cache key includes source hash, reference hashes, plan ID, or renderer version.
- The manifest stores hashes, but render-time stale-output validation does not consume them.

## Invalidation and reliability

Changing the primary source requires manually rerunning the manifest and plan scripts. There is no orchestrator that invalidates dependent artifacts. Changing a reference does not automatically regenerate the technique library.

The manifest script has a strict designated path check, which prevents arbitrary primary selection, but it does not reject stale existing analysis when hashes change.

## Verdict

Proxy testing is viable; 4K source rendering is not reliable in the current environment. Cache invalidation, resource limits, failure recovery, and output freshness checks remain unimplemented.


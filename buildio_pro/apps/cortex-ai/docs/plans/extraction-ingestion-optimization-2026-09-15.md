# Extraction and Ingestion Optimization Plan - cortex-ai

**Date:** 2026-09-15
**Status:** Planned
**Scope:** Extracted-content normalization, chunking, embedding, and retrieval quality
**Related plan:** `document-extraction-2026-09-10.md`

## Goal

Improve extraction and ingestion quality without making every document use the same
chunking strategy. Chunks should preserve the meaning and structure of the source,
remain within embedding limits, and provide enough context for retrieval and answer
generation while keeping ingestion cost and latency predictable.

## Current baseline

- Approved extraction content is preferred during ingestion; text files are the fallback.
- `lib/ai/embedding.ts:13` uses a character-based splitter with a `1000` character
  target and `200` character overlap.
- The splitter prefers paragraph and sentence boundaries but has no document-format
  awareness, token counting, section metadata, or table/code handling.
- All chunks are embedded through `embedMany` with at most five parallel calls.
- Chunks are stored as embedding rows under one resource, and retrieval returns the
  top four active chunks by cosine similarity.
- Re-ingestion soft-deletes the old resource, so chunking changes can be rolled out by
  re-ingesting documents without deleting historical rows.

## Decisions

- Start with deterministic, structure-aware chunking. Do not introduce semantic
  chunking or an agentic chunking step until evaluation shows a measurable benefit.
- Use token-aware limits for embedding input, while retaining character limits as a
  defensive bound against unexpectedly large extracted text.
- Keep tables, code blocks, lists, and headings intact when they fit; split oversized
  blocks with format-specific rules rather than arbitrary character cuts.
- Preserve section hierarchy and source position as chunk metadata so retrieval can
  expand a result to its parent section and citations can point back to the source.
- Keep the original extracted content immutable. Normalization and chunking should be
  reproducible from stored content plus a versioned chunking configuration.
- Make chunking configuration explicit and versioned. A re-ingest must be able to
  identify which strategy, model, size, overlap, and parser produced its chunks.

## Chunking strategies

### 1. Structure-aware recursive splitting (default)

Split in this order: document sections/headings, paragraphs, sentences, then words as
a final fallback. Merge adjacent units until the token target is reached. This should
be the first production optimization because it improves the current splitter without
requiring an embedding call for each boundary decision.

### 2. Format-specific splitting

- Markdown/MDX: retain heading ancestry, fenced code blocks, lists, and blockquotes.
- CSV: preserve the header in every row-group chunk; avoid splitting a quoted row.
- HTML: remove navigation and boilerplate, then use heading and content regions.
- PDF extraction output: preserve page, heading, table, and figure-caption markers
  supplied by extraction; do not infer layout from flattened text when metadata exists.
- Plain text: use paragraph and sentence boundaries with the recursive fallback.

### 3. Sliding-window overlap

Retain a small overlap between adjacent chunks for concepts that cross boundaries.
Make overlap token-based and configurable. Prefer section-aware overlap over a fixed
percentage when a heading or list boundary already provides context.

### 4. Semantic chunking (later option)

Compare adjacent sentence groups and start a new chunk when semantic similarity drops
below a configured threshold. Use only for long narrative documents after a benchmark
proves better retrieval or answer grounding; it adds embedding cost and can be less
deterministic than structural splitting.

### 5. Parent-child retrieval (later option)

Index small child chunks for precision, but retain a parent section or page for context
expansion after retrieval. This is preferable to making every indexed chunk large. It
requires retrieval and response-context changes, so it should follow the baseline
quality evaluation rather than be bundled into the first splitter change.

## Target configuration

Use these as starting values, not permanent constants:

| Content | Target chunk size | Overlap | Notes |
| --- | ---: | ---: | --- |
| General prose | 400-700 tokens | 50-100 tokens | Merge complete sentences and paragraphs |
| Technical/manual content | 500-900 tokens | 75-150 tokens | Preserve heading ancestry and lists |
| FAQ | One question-answer pair | None or minimal | Do not combine unrelated answers |
| Tables | One table or row group | Repeat headers | Keep schema/header context in each chunk |
| Code | Function/class/module | Minimal | Preserve language and file metadata |
| Very short documents | Whole document | None | Avoid creating tiny fragments |

Every chunk must also satisfy a maximum token and character bound. If a single
paragraph, table, or code block exceeds the bound, split it using the content-specific
fallback and mark the chunk as a continuation where appropriate.

## Implementation phases

### Phase 1 - Instrument the baseline

- [ ] O1 Record per-ingest metrics: source type, input characters/tokens, chunk count,
  min/average/max chunk size, overlap, embedding latency, and failure reason.
- [ ] O2 Add a chunking configuration object with a version identifier; include the
  resolved configuration in ingestion logs and resource metadata.
- [ ] O3 Add a dry-run/debug path that returns chunk previews and counts without
  creating resources or embeddings.
- [ ] O4 Build a small fixture corpus covering prose, Markdown, CSV, long sections,
  lists, tables, code, and extraction output with headings.

### Phase 2 - Replace the generic splitter

- [ ] O5 Implement token-aware recursive splitting with configurable target, maximum,
  overlap, and separators.
- [ ] O6 Normalize extracted content before splitting: remove repeated whitespace only
  where safe, preserve meaningful newlines, normalize line endings, and retain source
  markers and section boundaries.
- [ ] O7 Add format-aware chunkers for Markdown/MDX, CSV, and structured extraction
  output; keep a deterministic plain-text fallback.
- [ ] O8 Store chunk position and metadata such as section path, page/source marker,
  chunk index, and chunking version. Avoid putting large duplicated metadata into the
  embedding text unless retrieval requires it.
- [ ] O9 Keep the existing resource supersession behavior and make re-ingestion use the
  selected chunking version consistently for every chunk in a run.

### Phase 3 - Improve embedding and retrieval efficiency

- [ ] O10 Validate chunk sizes before embedding and fail with a useful per-document
  error instead of sending an oversized batch to the provider.
- [ ] O11 Tune `embedMany` batch size and concurrency from observed provider limits;
  preserve bounded concurrency and avoid retry storms.
- [ ] O12 Add deterministic content hashing so unchanged chunks can reuse embeddings
  on re-ingestion where the embedding model and chunking version match.
- [ ] O13 Revisit retrieval count, similarity threshold, and diversity handling after
  the new chunk distribution is measured; avoid returning many adjacent duplicates.
- [ ] O14 Add optional parent-section expansion for retrieved chunks when context is
  insufficient, keeping the initial vector search over child chunks.

### Phase 4 - Evaluate advanced strategies

- [ ] O15 Compare structural, sliding-window, semantic, and parent-child variants on
  the fixture corpus and representative user queries.
- [ ] O16 Measure retrieval precision/recall, answer grounding, citation usefulness,
  ingestion latency, embedding calls, storage growth, and failure rate.
- [ ] O17 Adopt semantic chunking only for document classes where it wins clearly;
  retain structural splitting as the default and per-document fallback.
- [ ] O18 Add a controlled re-ingestion mechanism for changing chunking configuration
  or embedding models, with progress, failure reporting, and old-resource retention.

## Acceptance criteria

- Chunk boundaries preserve headings, paragraphs, lists, tables, and code blocks when
  those units fit within configured limits.
- No chunk exceeds the configured token or character safety bound.
- Every chunk can be traced to its document, source position, section path, chunk index,
  and chunking configuration version.
- Re-ingestion remains idempotent from the user's perspective: the active resource is
  replaced only after the new resource and embeddings are successfully created.
- Retrieval quality is evaluated on representative queries rather than judged only by
  chunk count or ingestion success.
- Failed ingestion leaves a visible error and does not silently mark the document as
  successfully ingested.

## Risks and mitigations

- **Too many small chunks:** enforce a minimum merge threshold and inspect chunk-size
  distributions before rollout.
- **Too much overlap:** cap overlap by tokens and measure duplicate retrieval results.
- **Provider token failures:** validate locally and retain a character safety limit.
- **Metadata duplication:** store metadata separately where possible and add only the
  section context needed by the embedding model.
- **Unreliable PDF structure:** use extraction-provided markers and retain the current
  deterministic fallback when layout metadata is unavailable.
- **Migration cost:** version configurations and re-ingest incrementally; do not make
  historical resources active again automatically.

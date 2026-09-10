"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "@workspace/ui/lib/utils";

type ExtraProps = { node?: unknown };

function createMarkdownComponent(
  tag: keyof React.JSX.IntrinsicElements,
  base: string,
) {
  const Tag = tag as React.ElementType;
  return function MarkdownComponent({
    node,
    className,
    ...props
  }: ExtraProps & React.HTMLAttributes<HTMLElement>) {
    void node;
    return <Tag className={cn(base, className)} {...props} />;
  };
}

function MarkdownLink({
  node,
  className,
  ...props
}: ExtraProps & React.ComponentProps<"a">) {
  void node;
  return (
    <a
      className={cn(
        "font-medium text-primary underline underline-offset-4 hover:opacity-80",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}

function MarkdownCode({
  node,
  className,
  children,
  ...props
}: ExtraProps & React.ComponentProps<"code">) {
  void node;
  if (/language-|hljs/.test(className ?? "")) {
    return (
      <code className={cn("font-mono", className)} {...props}>
        {children}
      </code>
    );
  }
  return (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

function MarkdownPre({
  node,
  className,
  children,
  ...props
}: ExtraProps & React.ComponentProps<"pre">) {
  void node;
  const ref = React.useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    const text = ref.current?.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="group/code relative my-4">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md border bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/code:opacity-100"
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </button>
      <pre
        ref={ref}
        className={cn(
          "overflow-x-auto rounded-lg border bg-muted p-4 text-sm leading-relaxed",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}

function MarkdownTable({
  node,
  className,
  ...props
}: ExtraProps & React.ComponentProps<"table">) {
  void node;
  return (
    <div className="my-4 w-full overflow-x-auto rounded-lg border">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

function MarkdownInput({
  node,
  className,
  ...props
}: ExtraProps & React.ComponentProps<"input">) {
  void node;
  return (
    <input
      className={cn(
        "mr-1 size-3.5 translate-y-px accent-primary align-middle",
        className,
      )}
      {...props}
    />
  );
}

const components: Components = {
  h1: createMarkdownComponent(
    "h1",
    "mt-6 mb-4 scroll-m-20 text-2xl font-bold tracking-tight first:mt-0",
  ),
  h2: createMarkdownComponent(
    "h2",
    "mt-6 mb-3 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0",
  ),
  h3: createMarkdownComponent(
    "h3",
    "mt-5 mb-2 scroll-m-20 text-lg font-semibold first:mt-0",
  ),
  h4: createMarkdownComponent(
    "h4",
    "mt-4 mb-2 scroll-m-20 text-base font-semibold first:mt-0",
  ),
  h5: createMarkdownComponent(
    "h5",
    "mt-4 mb-2 text-sm font-semibold first:mt-0",
  ),
  h6: createMarkdownComponent(
    "h6",
    "mt-4 mb-2 text-sm font-semibold text-muted-foreground first:mt-0",
  ),
  p: createMarkdownComponent("p", "my-3 leading-7 first:mt-0 last:mb-0"),
  a: MarkdownLink,
  strong: createMarkdownComponent("strong", "font-semibold"),
  em: createMarkdownComponent("em", "italic"),
  ul: createMarkdownComponent(
    "ul",
    "my-3 ml-5 list-disc space-y-1 [&_ol]:my-1 [&_ul]:my-1",
  ),
  ol: createMarkdownComponent(
    "ol",
    "my-3 ml-5 list-decimal space-y-1 [&_ol]:my-1 [&_ul]:my-1",
  ),
  li: createMarkdownComponent("li", "leading-7 [&>p]:my-0"),
  blockquote: createMarkdownComponent(
    "blockquote",
    "my-4 border-l-2 border-border pl-4 text-muted-foreground italic",
  ),
  hr: createMarkdownComponent("hr", "my-6 border-border"),
  img: createMarkdownComponent("img", "my-3 max-w-full rounded-lg"),
  th: createMarkdownComponent(
    "th",
    "border-b bg-muted/50 px-3 py-2 text-left font-semibold",
  ),
  td: createMarkdownComponent("td", "border-b px-3 py-2 align-top"),
  tr: createMarkdownComponent("tr", "[&:last-child>td]:border-b-0"),
  pre: MarkdownPre,
  code: MarkdownCode,
  table: MarkdownTable,
  input: MarkdownInput,
};

type MarkdownProps = Omit<
  React.ComponentProps<typeof ReactMarkdown>,
  "components"
> & {
  className?: string;
  components?: Components;
};

function Markdown({
  className,
  components: componentsProp,
  ...props
}: MarkdownProps) {
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
        ]}
        components={{ ...components, ...componentsProp }}
        {...props}
      />
    </div>
  );
}

export { Markdown, type MarkdownProps };

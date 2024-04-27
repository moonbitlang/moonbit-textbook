import type { ComponentProps } from 'react';
import React from 'react';
import CopyButton from '@theme/CodeBlock/CopyButton';
import type { Props } from '@theme/MDXComponents/Code';
import codeBlockStyles from './CodeBlock.module.css';
import clsx from 'clsx';

function shouldBeInline(props: Props): boolean {
  return (
    // empty code blocks have no props.children,
    // see https://github.com/facebook/docusaurus/pull/9704
    typeof props.children !== 'undefined' &&
    React.Children.toArray(props.children).every(
      (el) => typeof el === 'string' && !el.includes('\n'),
    )
  );
}

function getTextForCopy(node: React.ReactNode): string {
  if (node === null) return '';

  switch (typeof node) {
    case 'string':
    case 'number':
      return node.toString();
    case 'boolean':
      return '';
    case 'object':
      if (node instanceof Array) return node.map(getTextForCopy).join('');
      if ('props' in node) return getTextForCopy(node.props.children);
    default:
      return '';
  }
}

function CodeBlock(props: ComponentProps<'code'>): JSX.Element {
  const codeRef = React.useRef<HTMLElement>(null);
  const code = getTextForCopy(props.children);

  return (
    <div className={codeBlockStyles.CodeBlock}>
      <pre className={clsx(codeBlockStyles.pre, 'shiki')}>
        <code {...props} ref={codeRef} />
      </pre>
      <CopyButton className={codeBlockStyles.button} code={code} />
    </div>
  );
}

export default function MDXCode(props): JSX.Element {
  return shouldBeInline(props) ? <code {...props} /> : <CodeBlock {...props} />;
}
import type {ComponentProps} from 'react';
import React from 'react';
import CopyButton from '@theme/CodeBlock/CopyButton';
import codeBlockStyles from './CodeBlock.module.css';
import clsx from 'clsx';

function getTextForCopy(node: React.ReactNode): string {
  if (node === null) return '';

  switch (typeof node) {
    case 'string':
    case 'number':
      return node.toString();
    case 'object':
      if (node instanceof Array) return node.map(getTextForCopy).join('');
      if ('props' in node) return getTextForCopy(node.props.children);
    default:
      return '';
  }
}

export default function CodeBlock(props: ComponentProps<'code'>): JSX.Element {
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
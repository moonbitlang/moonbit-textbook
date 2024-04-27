/**
 * Modified from https://github.com/wasmCloud/wasmcloud.com/blob/main/src/theme/MDXComponents/Code/index.tsx
 * 
 * Apache License, Version 2.0
 *
 * Copyright 2023 wasmCloud Maintainers
 * Copyright 2024 MoonBit Open Course Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import React from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useBlogPost} from '@docusaurus/theme-common/internal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import type {Props} from '@theme/BlogPostItem';
import blogPostItemStyles from './BlogPostItem.module.css';
import Link from '@docusaurus/Link';

// apply a bottom margin in list view
function useContainerClassName() {
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

function ShareButtons(): JSX.Element {
  return (
    <BrowserOnly>
      {() => {
        const url = window.location.href;
        return (
          <div className={blogPostItemStyles.SocialButtons}>
            <span className={blogPostItemStyles.FollowButtons}>
              <Link className="button button--secondary" to='https://x.com/moonbitlang'>Follow us on X</Link>
            </span>
            <span className={blogPostItemStyles.ShareButtons}>
              <Link className={blogPostItemStyles.ShareButton} to={'https://x.com/intent/tweet?url=' + url}><FontAwesomeIcon icon={fab.faXTwitter} size='2x' fixedWidth /></Link>
              <Link className={blogPostItemStyles.ShareButton} to={'https://www.facebook.com/sharer/sharer.php?u=' + url}><FontAwesomeIcon icon={fab.faFacebook} size='2x' fixedWidth /></Link>
              <Link className={blogPostItemStyles.ShareButton} to='#' onClick={() => {navigator.clipboard.writeText(url)}}><FontAwesomeIcon icon={fas.faLink} size='2x' fixedWidth /></Link>
            </span>
          </div>
        );
      }}
    </BrowserOnly>
  )
}

export default function BlogPostItem({
  children,
  className,
}: Props): JSX.Element {
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
      <ShareButtons />
    </BlogPostItemContainer>
  );
}


import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {FaXTwitter, FaFacebook, FaLink} from "react-icons/fa6";
import styles from './index.module.css';

export default function ShareButtons(): JSX.Element {
  const url = useDocusaurusContext().siteConfig.url + useBaseUrl(useLocation().pathname);
  return (
    <span className={styles.ShareButtons}>
      <Link className={styles.ShareButton} to={'https://x.com/intent/tweet?url=' + url}><FaXTwitter size='2em' /></Link>
      <Link className={styles.ShareButton} to={'https://www.facebook.com/sharer/sharer.php?u=' + url}><FaFacebook size='2em' /></Link>
      <Link className={styles.ShareButton} to='#' onClick={() => {navigator.clipboard.writeText(url)}}><FaLink size='2em' /></Link>
    </span>
  );
}
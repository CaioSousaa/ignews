import Link from "next/link";
import { SingInButton } from "../SingInButton";
import styles from "../Header/styles.module.scss";
import { useRouter } from "next/router";

export function Header() {
  const { asPath } = useRouter();

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="logo" />

        <nav>
          <Link href="/" className={asPath === "/" ? styles.active : ""}>
            Home
          </Link>
          <Link
            href="/posts"
            className={asPath === "/posts" ? styles.active : ""}
          >
            Posts
          </Link>
        </nav>

        <SingInButton />
      </div>
    </header>
  );
}

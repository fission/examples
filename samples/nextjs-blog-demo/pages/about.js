import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>About</title>
                <meta name="description" content="About" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    About Fission!
                </h1>

                <p className={styles.description}>
                    Fission is a framework for serverless functions on Kubernetes.
                    <br />
                    Write short-lived functions in any language, and map them to HTTP requests (or other event triggers).
                    Deploy functions instantly with one command. There are no containers to build, and no Docker registries to manage.
                </p>
            </main>

            <footer className={styles.footer}>                
                Powered by{' '}
                <span className={styles.logo}>
                    <Image src="/nextapp/vercel.svg" alt="Vercel Logo" width={72} height={20} />
                </span>
                <span className={styles.logo}>
                    <Image src="/nextapp/fission.png" alt="Fission Logo" width={72} height={20} />
                </span>                
            </footer>
        </div>
    )
}

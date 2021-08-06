import Head from 'next/head'
import Image from 'next/image'

import blogs from '../data/blogs.json'
import styles from '../styles/Home.module.css'

export default function Blog({ blog }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Blog - {blog.title}</title>
        <meta name="description" content={blog.title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
          <h2>{blog.title}</h2>

          <p className={styles.description}>          
            {blog.author}
          </p>
          
          <p className={styles.description}>          
            {blog.description}
          </p>
      </main>

      <footer className={styles.footer}>        
        Powered by{' '}
        <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={20} />
        </span>
        <span className={styles.logo}>
            <Image src="/fission.png" alt="Fission Logo" width={72} height={20} />
        </span>        
      </footer>
    </div>
  )
}

export async function getStaticPaths() {
  const paths = blogs.map(blog => ({    
    params: { blog: blog.slug }
  }))

  // Paths will look like this:
  // [
  //   { params: { blog: 'websocket-sample' } },
  //   { params: { blog: 'log-monitoring'} }
  //   ...
  // ]
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
    const blog = blogs.find(blog => blog.slug === params.blog)
    return { props: { blog } }
}
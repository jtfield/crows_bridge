import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Welcome to Crows Bridge! A server for the classic game Myth 2: Soulblighter</p>
        <p>
          (This website and sever is under construction. Coming soon!)</p>
      </section>
    </Layout>
  )
}


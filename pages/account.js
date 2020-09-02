import Head from 'next/head';
import nextCookie from 'next-cookies';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';

export default function Account(props) {
  const { user } = props;

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        {(() => {
          if (user && user.id) {
            return (
              <>
                <p>user id {user.id}</p>
                <p>
                  <a href='/api/auth/logout'>Sign out</a>
                </p>
              </>
            );
          }

          return (
            <>
              <p>Login with Steam to create an account.</p>
              <p>
                <a href='/api/auth/steam'>
                  <img src='/images/steam_login.png' alt='thing' className='logo' />
                </a>
              </p>
            </>
          );
        })()}
      </section>
    </Layout>
  );
}

const getUser = (context) => {
  const { passportSession } = nextCookie(context);
  if (passportSession) {
    const serializedCookie = Buffer.from(passportSession, 'base64').toString();

    const { passport: passportInfo } = JSON.parse(serializedCookie);
    return passportInfo.user;
  }
};

export async function getServerSideProps(context) {
  return {
    props: {
      user: getUser(context) || null,
    },
  };
}

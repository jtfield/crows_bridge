import Head from 'next/head';
import nextCookie from 'next-cookies';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';

export default function Account(props) {
  const { user, authError } = props;
  const router = useRouter();

  useEffect(
    () => {
      // Remove the query parameter so users are not stuck in this state
      // when refreshing.
      if (router.query.authError) {
        router.replace('/account', 'account', { shallow: true });
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [router.query.authError]
  );

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        {(() => {
          if (user && user.steamid) {
            return (
              <>
                <p>user id {user.steamid}</p>
                <p>username {user.uname}</p>
                <p>password {user.upw}</p>
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
              {authError && (
                <p style={{ color: 'red', fontSize: 12 }}>Authentication with Steam failed due to server error.</p>
              )}
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
  const { authError } = context.query;
  return {
    props: {
      user: getUser(context) || null,
      authError: Boolean(authError),
    },
  };
}

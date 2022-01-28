/*
 * Copyright (c) 2022 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { NextPageContext } from 'next';
import { useEffect, useState } from 'react';
import { AppContext } from 'next/app';
import nextCookies from 'next-cookies';
import Router from 'next/router';
import Cookies from 'js-cookie';
import queryString from 'query-string';
import { get, omit } from 'lodash';
import ReactGA from 'react-ga';
import { ServerResponse } from 'http';

import { GqlQueriesToPrefetch, PageWithConfig } from 'global/utils/pages/types';
import { getConfig } from 'global/config';
import { sleep, OAUTH_QUERY_PARAM_NAME } from 'global/utils/common';
import refreshJwt from 'global/utils/refreshJwt';
import { EGO_JWT_KEY } from 'global/constants';
import { decodeToken, isValidJwt, getPermissionsFromToken } from 'global/utils/egoJwt';
import getApolloCacheForQueries from 'global/utils/getApolloCacheForQueries';
import { getDefaultRedirectPathForUser } from 'global/utils/pages';

import DefaultLayout from 'components/pages/DefaultLayout';
import MaintenancePage from 'components/pages/MaintenancePage';
import ApplicationRoot from 'components/ApplicationRoot';

import { ERROR_STATUS_KEY } from './_error';
import FullScreenLoader from 'components/placeholders/FullPageLoader';
import { LOGGED_IN_PATH } from 'global/constants/pages';

interface CustomAppProps {
  apolloCache: any;
  Component: PageWithConfig;
  ctx: NextPageContext;
  egoJwt?: string;
  isOauth: boolean;
  maintenanceModeOn: boolean;
  pageProps: any;
  pathname: string;
  startWithGlobalLoader: boolean;
  unauthorized: boolean;
}

const redirect = (res: ServerResponse, url: string) => {
  if (res) {
    res.writeHead(302, {
      Location: url,
    });
    res.end();
  } else {
    Router.push(url);
  }
};

const getRedirect = (ctxAsPath: string | undefined): string =>
  // login path for redirect may be restored in future, see https://github.com/icgc-argo/platform-ui/issues/1487
  ctxAsPath ? `/?redirect=${encodeURI(ctxAsPath)}` : '/';

const enforceLogin = ({ ctx }: { ctx: NextPageContext }) => {
  const loginRedirect = getRedirect(ctx.asPath);
  redirect(ctx.res as ServerResponse, loginRedirect);
};

const removeCookie = (res: ServerResponse, cookieName: string) => {
  res && res.setHeader('Set-Cookie', `${cookieName}=deleted; expires=${new Date(1).toUTCString()}`);
};

const getMaintenanceProps = (ctx: NextPageContext, MAINTENANCE_MODE_ON: boolean) => {
  return {
    pageProps: {},
    unauthorized: false,
    pathname: ctx.pathname,
    egoJwt: null,
    ctx: {
      pathname: ctx.pathname,
      query: ctx.query,
      asPath: ctx.asPath,
    },
    apolloCache: null,
    startWithGlobalLoader: false,
    maintenanceModeOn: MAINTENANCE_MODE_ON,
  };
};

const getEgoToken = async (ctx: NextPageContext) => {
  const { EGO_TOKEN_URL } = getConfig();
  return await fetch(EGO_TOKEN_URL, {
    credentials: 'include',
    headers: { accept: '*/*' },
    body: null,
    method: 'GET',
    mode: 'cors',
  })
    .then((res) => {
      if (res.status !== 200) {
        enforceLogin({ ctx });
      }
      return res.text();
    })
    .then((egoToken) => {
      if (isValidJwt(egoToken)) {
        return egoToken;
      }
    })
    .catch((err) => {
      console.warn(err);
      enforceLogin({ ctx });
      return err;
    });
};

const checkOauth = (ctx: NextPageContext) => {
  if (ctx.asPath === LOGGED_IN_PATH) {
    return true;
  } else if (get(ctx.query, 'redirect')) {
    const parsed = queryString.parseUrl(decodeURIComponent(ctx.query.redirect as string));
    return get(parsed.query, OAUTH_QUERY_PARAM_NAME) === 'true';
  } else {
    return false;
  }
};

const Root = ({
  apolloCache,
  Component,
  ctx,
  egoJwt,
  isOauth,
  maintenanceModeOn,
  pageProps,
  startWithGlobalLoader,
}: CustomAppProps) => {
  const [isLoadingLoginRedirect, setLoadingLoginRedirect] = useState(isOauth);
  const userModel = decodeToken(egoJwt);
  const { GA_TRACKING_ID } = getConfig();

  useEffect(() => {
    ReactGA.initialize(GA_TRACKING_ID, {
      gaOptions: {
        userId: userModel ? userModel.context.user.email : 'NA',
      },
    });
    ReactGA.pageview(ctx.asPath);
  }, []);

  useEffect(() => {
    async function handleAuth() {
      if (egoJwt) {
        Cookies.set(EGO_JWT_KEY, egoJwt);
      } else {
        if (isLoadingLoginRedirect) {
          const egoToken = await getEgoToken(this.props);
          if (isValidJwt(egoToken)) {
            Cookies.set(EGO_JWT_KEY, egoToken);
            const { redirect } = ctx.query;
            if (redirect) {
              const redirectFromURL = decodeURIComponent(redirect as string);
              const obj = queryString.parseUrl(redirectFromURL || '');
              const target = queryString.stringifyUrl({
                ...obj,
                query: omit(obj.query, OAUTH_QUERY_PARAM_NAME),
              });
              location.assign(target);
            } else {
              const redirectFromPermissions = getDefaultRedirectPathForUser(
                getPermissionsFromToken(egoToken),
              );
              Router.push(redirectFromPermissions);
            }
          } else {
            Cookies.set(EGO_JWT_KEY, null);
            location.assign(getRedirect(ctx.asPath));
          }
          await sleep();
          setLoadingLoginRedirect(false);
        }
      }
    }
    handleAuth();
  }, []);

  return (
    <ApplicationRoot
      apolloCache={apolloCache}
      egoJwt={egoJwt}
      pageContext={ctx}
      startWithGlobalLoader={startWithGlobalLoader}
    >
      {maintenanceModeOn ? (
        <MaintenancePage />
      ) : isLoadingLoginRedirect ? (
        <DefaultLayout>
          <FullScreenLoader />
        </DefaultLayout>
      ) : (
        <Component {...pageProps} />
      )}
    </ApplicationRoot>
  );
};

Root.getInitialProps = async ({ Component, ctx }: AppContext & { Component: PageWithConfig }) => {
  const { AUTH_DISABLED, MAINTENANCE_MODE_ON } = getConfig();
  if (MAINTENANCE_MODE_ON) {
    return getMaintenanceProps(ctx, MAINTENANCE_MODE_ON);
  }

  const egoJwt: string | undefined = nextCookies(ctx)[EGO_JWT_KEY];
  const { res, query } = ctx;
  let refreshedJwt = null;
  let initialPermissions = getPermissionsFromToken(egoJwt);

  const loggingOut = query.loggingOut || false;

  if (loggingOut) {
    if (Component.isPublic) {
      const strippedPath = queryString.exclude(ctx.asPath, ['loggingOut']);
      redirect(res as ServerResponse, strippedPath);
    } else {
      redirect(res as ServerResponse, '/');
    }
  } else if (egoJwt) {
    if (!isValidJwt(egoJwt)) {
      if (res) {
        removeCookie(res as ServerResponse, EGO_JWT_KEY);
        redirect(res as ServerResponse, getRedirect(ctx.asPath));
      } else {
        const forceLogin = () => {
          Cookies.remove(EGO_JWT_KEY);
          redirect(res as ServerResponse, getRedirect(ctx.asPath));
        };
        const newJwt = (await refreshJwt().catch(forceLogin)) as string;
        if (isValidJwt(newJwt)) {
          Cookies.set(EGO_JWT_KEY, newJwt);
          refreshedJwt = newJwt;
          initialPermissions = getPermissionsFromToken(newJwt);
        } else {
          forceLogin();
        }
      }
    }
  } else {
    if (!Component.isPublic) {
      enforceLogin({ ctx });
    }
  }

  const unauthorized = Component.isAccessible
    ? !(await Component.isAccessible({ egoJwt, ctx, initialPermissions }))
    : false;

  if (unauthorized && !AUTH_DISABLED && !loggingOut) {
    const err = new Error('Forbidden') as Error & { statusCode?: number };
    err[ERROR_STATUS_KEY] = 403;
    throw err;
  }

  const pageProps = await Component.getInitialProps({ ...ctx, egoJwt });

  let graphqlQueriesToCache: GqlQueriesToPrefetch;
  let apolloCache = {};
  try {
    graphqlQueriesToCache = Component.getGqlQueriesToPrefetch
      ? await Component.getGqlQueriesToPrefetch({ ...ctx, egoJwt })
      : [];
    apolloCache = graphqlQueriesToCache
      ? await getApolloCacheForQueries(graphqlQueriesToCache)(egoJwt)
      : {};
  } catch (e) {
    console.log(e);
  }

  const startWithGlobalLoader = Component.startWithGlobalLoader || false;

  const isOauth = checkOauth(ctx);

  return {
    apolloCache,
    ctx: {
      asPath: ctx.asPath,
      pathname: ctx.pathname,
      query: ctx.query,
    },
    egoJwt: refreshedJwt || egoJwt,
    isOauth,
    maintenanceModeOn: MAINTENANCE_MODE_ON,
    pageProps,
    pathname: ctx.pathname,
    startWithGlobalLoader,
    unauthorized,
  };
};

export default Root;

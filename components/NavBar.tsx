import { SUBMISSION_PATH, USER_PAGE_PATH, FILE_REPOSITORY_PATH } from 'global/constants/pages';
import useAuthContext from 'global/hooks/useAuthContext';
import usePageContext from 'global/hooks/usePageContext';
import { canReadSomeProgram, isDccMember, isRdpcMember } from 'global/utils/egoJwt';
import { getDefaultRedirectPathForUser } from 'global/utils/pages';
import Link from 'next/link';
import * as React from 'react';
import { css } from 'uikit';
import AppBar, {
  DropdownMenu,
  DropdownMenuItem,
  Logo,
  MenuGroup,
  MenuItem,
  Section,
  UserBadge,
} from 'uikit/AppBar';
import Button from 'uikit/Button';
import Icon from 'uikit/Icon';
import Typography from 'uikit/Typography';
import { getConfig } from 'global/config';
import { createRedirectURL } from 'global/utils/common';
import { get } from 'lodash';
import queryString from 'query-string';
import urlJoin from 'url-join';

const NavBarLoginButton = () => {
  return (
    <Button>
      <span
        css={css`
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <Icon
          name="google"
          css={css`
            margin-right: 5px;
          `}
        />
        Login
      </span>
    </Button>
  );
};

const getUserRole = egoJwt => {
  if (!egoJwt) {
    return null;
  } else if (isDccMember(egoJwt)) {
    return 'DCC Member';
  } else if (isRdpcMember(egoJwt)) {
    return 'RDPC User';
  } else if (canReadSomeProgram(egoJwt)) {
    return 'Program Member';
  } else {
    return null;
  }
};

export default function Navbar({ hideLink }: { hideLink?: boolean }) {
  const { EGO_URL, REPOSITORY_ENABLED } = getConfig();
  const { token: egoJwt, logOut, data: userModel } = useAuthContext();
  const canAccessSubmission = !!egoJwt && (canReadSomeProgram(egoJwt) || isRdpcMember(egoJwt));
  const { asPath: path, query } = usePageContext();

  const [loginPath, setLoginPath] = React.useState('');

  React.useEffect(() => {
    const redirect = get(query, 'redirect') as string;
    if (redirect) {
      const parsedRedirect = queryString.parseUrl(redirect);
      const existingQuery = queryString.stringify(parsedRedirect.query);

      const queryRedirect = createRedirectURL({
        origin: location.origin,
        path: parsedRedirect.url,
        query: existingQuery,
      });
      setLoginPath(urlJoin(EGO_URL, queryRedirect));
    } else if (path === '/' || path === '/login') {
      setLoginPath(EGO_URL);
    } else {
      const redirect = createRedirectURL({
        origin: location.origin,
        path,
      });
      setLoginPath(urlJoin(EGO_URL, redirect));
    }
  }, []);

  return (
    <AppBar
      css={css`
        position: sticky;
        top: 0px;
        z-index: 2;
      `}
    >
      <Section>
        <Logo
          DomComponent={props => (
            <Link prefetch href={`/`}>
              <a {...props} id="home-login" />
            </Link>
          )}
        />
        <MenuGroup>
          {/* need to ensure the path itself doesn't resolve when disabled */}
          {REPOSITORY_ENABLED && (
            <Link href={FILE_REPOSITORY_PATH} as={FILE_REPOSITORY_PATH}>
              <a
                css={css`
                  height: 100%;
                `}
              >
                <MenuItem ref={React.createRef()} active={path.search(FILE_REPOSITORY_PATH) === 0}>
                  <Typography variant={'default'}>File Repository</Typography>
                </MenuItem>
              </a>
            </Link>
          )}
        </MenuGroup>
      </Section>

      <Section />
      {!hideLink && (
        <Section>
          <MenuGroup>
            {egoJwt && canAccessSubmission && (
              <Link
                href={getDefaultRedirectPathForUser(egoJwt, true)}
                as={getDefaultRedirectPathForUser(egoJwt)}
              >
                <a
                  css={css`
                    height: 100%;
                  `}
                >
                  <MenuItem ref={React.createRef()} active={path.search(SUBMISSION_PATH) === 0}>
                    <Typography variant={'default'}>Submission</Typography>
                  </MenuItem>
                </a>
              </Link>
            )}
            {!userModel && (
              <a
                id="link-login"
                href={loginPath}
                css={css`
                  align-self: center;
                  margin-right: 16px;
                  text-decoration: none;
                `}
              >
                <NavBarLoginButton />
              </a>
            )}
            {userModel && (
              <MenuItem
                active={path.search(USER_PAGE_PATH) === 0}
                ref={React.createRef()}
                dropdownMenu={
                  <DropdownMenu>
                    <Link href={USER_PAGE_PATH}>
                      <DropdownMenuItem active={path.search(USER_PAGE_PATH) === 0}>
                        Profile & Token
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => logOut()}>Logout</DropdownMenuItem>
                  </DropdownMenu>
                }
              >
                <UserBadge
                  firstName={userModel.context.user.firstName}
                  lastName={userModel.context.user.lastName}
                  title={getUserRole(egoJwt)}
                />
              </MenuItem>
            )}
          </MenuGroup>
        </Section>
      )}
    </AppBar>
  );
}

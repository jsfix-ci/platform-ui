import React from "react";
import urlJoin from "url-join";
import Router from "next/router";

import GoogleLogin from "uikit/SocialLoginButtons/GoogleLogin";
import { EGO_API_ROOT, EGO_CLIENT_ID } from "global/config";
import { LOCAL_STORAGE_REDIRECT_KEY } from "global/constants";

const Page = ({ redirect, egoJwt }) => {
  React.useEffect(() => {
    if (egoJwt) {
      Router.replace(redirect);
    } else {
      localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, redirect);
    }
  }, []);
  return (
    <div>
      <GoogleLogin
        link={urlJoin(
          EGO_API_ROOT,
          `api/oauth/login/google?client_id=${EGO_CLIENT_ID}`
        )}
      />
    </div>
  );
};

Page.getInitialProps = ({ query, egoJwt, res }) => {
  if (egoJwt) {
    res.redirect(query.redirect || "/");
  }
  return {
    redirect: query.redirect || "/",
    egoJwt
  };
};

export default Page;

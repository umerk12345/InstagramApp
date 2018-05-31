import { AsyncStorage} from 'react-native';
import { Navigation } from 'react-native-navigation';

import { TRY_AUTH, AUTH_SET_TOKEN, AUTH_REMOVE_TOKEN } from './actionTypes';
import {uiStartLoading, uiStopLoading} from './index';
import startMainTabs from '../../screens/MainTabs/startMainTabs';
import App from '../../../App';

export const tryAuth = (authData, authMode) => {
  return dispatch => {
      dispatch(uiStartLoading());
      let url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCQtlITlFlT3BKzeoHdyUQNmqz9G2TTRX8";
    if (authMode === "signup") {
      url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyCQtlITlFlT3BKzeoHdyUQNmqz9G2TTRX8"
      }
    fetch(url,{
      method: "POST",
      body: JSON.stringify({
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .catch(err => {
      console.log(err);
      alert("Authentication Failed");
      dispatch(uiStopLoading());
    })
    .then(res => res.json())
    .then(parsedRes => {
      dispatch(uiStopLoading());
      console.log(parsedRes);
      if (!parsedRes.idToken) {
        alert("Authentication Failed Mam")
      } else{
        console.log("Im Here" + parsedRes.idToken);
        dispatch(authStoreToken(parsedRes.idToken, parsedRes.expiresIn, parsedRes.refreshToken));
        startMainTabs();
      }
    });
  };
};

export const authStoreToken = (token, expiresIn, refreshToken) => {
  return dispatch => {

    const now = new Date();
    const expiryDate = now.getTime() + expiresIn * 1000;
    dispatch(authSetToken(token, expiryDate));
    console.log(now, new Date(expiryDate));

    AsyncStorage.setItem("in:auth:token", token);
    AsyncStorage.setItem("in:auth:expiryDate", expiryDate.toString());
    AsyncStorage.setItem("in:auth:refreshToken", refreshToken);

  };
};

export const authSetToken = (token, expiryDate) => {
  return {
    type: AUTH_SET_TOKEN,
    token: token,
    expiryDate: expiryDate
  };
};

export const authGetToken = () => {
  return (dispatch, getState) => {
      const promise = new Promise((resolve, reject) => {
        const token = getState().auth.token;
        const expiryDate = getState().auth.expiryDate;
        if (!token || new Date(expiryDate) <= new Date()) {
          let fetchedToken;
          AsyncStorage.getItem("in:auth:token")
            .catch(err => reject())
            .then(tokenFromStorage => {
              fetchedToken = tokenFromStorage;
              if (!tokenFromStorage) {
                reject();
                return;
              }
              return AsyncStorage.getItem("in:auth:expiryDate");
            })
            .then(expiryDate => {
              const parsedExpiryDate = new Date(parseInt(expiryDate));
              const now = new Date();
              if (parsedExpiryDate > now ) {
                dispatch(authSetToken(fetchedToken));
                  resolve(fetchedToken);
              } else {
                reject();
              }
            })
            .catch(err => reject());
        } else {
          resolve(token);
        }
      });
    return promise
    .catch(err => {
        return AsyncStorage.getItem("in:auth:refreshToken")
          .then(refreshToken => {
            return fetch("https://securetoken.googleapis.com/v1/token?key=AIzaSyCQtlITlFlT3BKzeoHdyUQNmqz9G2TTRX8",
             {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: "grant_type=refresh_token&refresh_token=" +refreshToken
            });
          })
          .then(res => res.json())
          .then(parsedRes => {
            if (parsedRes.id_token) {
              console.log("Refresh Token Worked");
                dispatch(
                  authStoreToken(
                  parsedRes.id_token,
                  parsedRes.expires_in,
                  parsedRes.refresh_token
                )
              );
              return parsedRes.id_token;
            } else {
              dispatch(authClearStorage());
            }
        });
    })
    .then(token => {
      if (!token) {
        throw(new Error());
      } else {
        return token;
      }
    });
  };
};



export const authAutoSignIn = () => {
  return dispatch => {
    dispatch(authGetToken())
      .then(token => {
        console.log("I have reached here");
        startMainTabs();
      })
      .catch(err => console.log("Failed to fetch token!"));
  };
};

export const authClearStorage = () => {
  return dispatch => {
    AsyncStorage.removeItem("in:auth:token");
    AsyncStorage.removeItem("in:auth:expiryDate");
    return AsyncStorage.removeItem("in:auth:refreshToken");
  };
};

export const authLogout = () => {
  return dispatch => {
    dispatch(authClearStorage())
      .then(() => {
        Navigation.startSingleScreenApp({
          screen: {
            screen: 'instagramapp.AuthScreen',
            title: 'Login'
          }
          });
      });
      dispatch(authRemoveToken());
  };
};

export const authRemoveToken = () => {
  return {
      type: AUTH_REMOVE_TOKEN
  };
};

import { SET_PLACES, REMOVE_PLACE, PLACE_ADDED, START_ADD_PLACE } from './actionTypes';
import {uiStartLoading, uiStopLoading, authGetToken} from './index';

export const startAddPlace = () => {
  return {
    type: START_ADD_PLACE
  };
};


export const addPlace = (placeName, location, image) => {
  return dispatch => {
    let authToken;
    dispatch(uiStartLoading());
    dispatch(authGetToken())
    .catch(() => {
      alert("No Token Found")
    })
      .then(token => {
        authToken = token;
        return fetch("https://us-central1-instagramapp-1527402504760.cloudfunctions.net/storeImage", {
          method: "POST",
          body: JSON.stringify({
            image: image.base64
          }),
          headers: {
            "Authorization" : "Bearer " + authToken
          }
        })
      })
    .catch(err => {
      console.log(err);
      alert("Something Went Wrong, Try Again")
      dispatch(uiStopLoading());
      dispatch(placeAdded());
      console.log("Im on dispatch(placeAdded)")

    })
     .then(res =>  {
       if (res.ok) {
         return res.json();
       } else {
         throw(new Error());
       }
     })
     .then(parsedRes => {
       const placeData = {
         name: placeName,
         location: location,
         image: parsedRes.imageUrl,
         imagePath: parsedRes.imagePath
       };
       return fetch("https://instagramapp-1527402504760.firebaseio.com/places.json?auth=" + authToken, {
         method: "POST",
         body: JSON.stringify(placeData)
       })
     })

      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw(new Error());
        }
      })
      .then(parsedRes => {
        console.log(parsedRes);
        dispatch(uiStopLoading());
        dispatch(placeAdded());
      })
      .catch(err => {
        console.log(err);
        alert("Something Went Wrong, Try Again")
        dispatch(uiStopLoading());
      });
  };
};

export const placeAdded = () => {
  return {
    type: PLACE_ADDED

  };
};

export const getPlaces = () => {
  return dispatch => {
    dispatch(authGetToken())
      .then(token => {
        return fetch("https://instagramapp-1527402504760.firebaseio.com/places.json?auth=" + token)
      })
      .catch(() => {
        alert("No Token Found")
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw(new Error());
        }
      })
      .then(parsedRes => {
        const places = [];
        for (let key in parsedRes) {
          places.push({
            ...parsedRes[key],
            image: {
              uri: parsedRes[key].image
            },
            key: key
          });
        }
        dispatch(setPlaces(places));
      })
      .catch(err => {
        alert("Something went wrong");
        console.log(err);
      });
  };
};

export const setPlaces = places => {
  return {
    type: SET_PLACES,
    places: places //action creator sending it to reducer
  }
}

export const deletePlace = (key) => {
  return dispatch => {
    dispatch(authGetToken())
    .catch(() => {
      alert("No Token Found")
    })
      .then(token => {
        dispatch(removePlace(key));
      return fetch("https://instagramapp-1527402504760.firebaseio.com/places/" + key + ".json?auth=" + token, {
          method: "DELETE"
        });
      })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw(new Error());
      }
    })
    .then(parsedRes => {
      console.log("Done!");
    })
    .catch(err => {
      alert("Something went wrong");
      console.log(err);
    });
  };
};

export const removePlace = key => {
  return {
    type: REMOVE_PLACE,
    key: key
  };
};

//
// export const selectPlace = (key) => {
//   return {
//     type: SELECT_PLACE,
//     placeKey: key
//   };
// };
//
// export const deselectPlace = () => {
//   return {
//     type: DESELECT_PLACE
//   };
// }

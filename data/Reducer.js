
const SET_USER = 'SET_USER';

const _setUser = (state, user) => {
  return {
    ...state,
    currentUser: user
  }
}

const initialState = {
  currentUser: {}
}

function rootReducer(state=initialState, action) {
  switch (action.type) {
    case SET_USER:
      return _setUser(state, action.payload.user);
    default:
      return state;
  }
}

export { rootReducer, SET_USER };
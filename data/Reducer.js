
import { actionTypes } from "./Actions"

const _loadUsers = (state, action) => {
  const {users} = action.payload;
  for (u of users) {
    console.log('loading user', u);
  }
  return {
    ...state,
    users: users
  }
}

const initialState = {
  users: []
}

function rootReducer(state=initialState, action) {
  console.log('in rootReducer, action:', action);
  switch (action.type) {
    case actionTypes.LOAD_USERS:
      return _loadUsers(state, action);
    default:
      console.log('in reducer default, state:', state);
      return state;
  }
}

export { rootReducer };
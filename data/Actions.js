
const actionTypes = {
  LOAD_USERS: 'LOAD_USERS',
  CREATE_USER: 'CREATE_USER',
}

const loadUsers = (users) => {
  return {
    type: actionTypes.LOAD_USERS,
    payload: {
      users: users
    }
  }
}

const createUser = (user) => {
  return {
    type: actionTypes.CREATE_USER,
    payload: {
      user: user
    }
  }
}

export { actionTypes, loadUsers, createUser };
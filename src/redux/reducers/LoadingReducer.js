const initState = false
export default function LoadingReducer(preState = initState, action) {
  const { type } = action
  switch (type) {
    case 'change_loading':
      return !preState
    default:
      return preState
  }
}

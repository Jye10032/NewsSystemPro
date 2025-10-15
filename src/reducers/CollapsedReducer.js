const initState = false
export default function CollapsedReducer(preState = initState, action) {
  const { type } = action
  switch (type) {
    case 'change_collapsed':
      return !preState
    default:
      return preState
  }
}

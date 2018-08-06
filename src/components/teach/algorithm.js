const data = `
rei,zero,nuru (choose one);0
ichi;1
ni;2
san;3
shi,yon (choose one);4
go;5
roku;6
shichi,nana;7
hachi;8
kyuu,ku;9
juu;10
`

const correctAfter = 2
const fromErrorAfter = 3

const prepareInitialState = (data, forward = true) => ({
  initial: data
    .trim()
    .split('\n')
    .filter(row => row.includes(';'))
    .map(row =>
      row
        .trim()
        .replace(/ *\([^)]*\) */g, '')
        .split(';')
        .map(option => option.split(','))
    )
    .map(row => (forward ? row : row.reverse()))
    .map(row => [...row, 0, -1]),
  correct: [],
  corrected: [],
  error: [],
  inError: false,
  show: null,
  answer: null,
  results: false
})

const pickShow = el => [el[0], el[1], el[2] + 1, -1]
const pickErr = el => [el[0], el[1], el[2] + 1, el[3]]
const pickCorrect = el => [el[0], el[1], el[2], el[3] + 1]
const pickIncorrect = el => [el[0], el[1], el[2], 0]

const isTheSame = (a1, a2) => a1[0].map((it, ind) => it === a2[0][ind]).filter(i => i).length === a1[0].length

const compareErr = (a, b) => (a[3] < b[3] ? -1 : a[3] > b[3] ? 1 : compareNor(a, b))
const compareNor = (a, b) => (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : Math.random() <= 0.5 ? 1 : -1)

const pick = (state, answer) => {
  console.table(state)
  if (state.initial.length === 0 && state.error.length === 0) {
    return { ...state, show: null, answer: null, results: true }
  }
  if (state.initial.length > 0 && (state.error.length === 0 || (!state.inError && state.error.length < fromErrorAfter))) {
    return { ...state, initial: state.initial.slice(1), show: pickShow(state.initial[0]), answer, inError: false }
  }
  if (state.inError || state.error.length >= fromErrorAfter || state.initial.length === 0) {
    let errorArr = state.error.slice()
    errorArr.sort(compareErr)
    const errorArrFilter = errorArr.filter(el => !isTheSame(el, state.show))
    const errorArrNegFilter = errorArr.filter(el => isTheSame(el, state.show))

    if (errorArrFilter.length > 0)
      return {
        ...state,
        error: [...errorArrFilter.slice(1), ...errorArrNegFilter],
        show: pickErr(errorArrFilter[0]),
        answer,
        inError: true
      }
    if (state.corrected.length > 0) {
      let arr = state.corrected.slice()
      arr.sort(compareNor)
      return { ...state, corrected: arr.slice(1), show: pickShow(arr[0]), answer, inError: false }
    }
    if (state.correct.length > 0) {
      let arr = state.correct.slice()
      arr.sort(compareNor)
      return { ...state, initial: arr.slice(1), show: pickShow(arr[0]), answer, inError: false }
    }
    return { ...state, error: errorArr.slice(1), show: pickErr(errorArr[0]), answer, inError: true }
  }

  console.log(state)
  throw 'invalid state for transition'
}

const reduceNextState = (state, input = null) => {
  if (state.show === null && state.answer === null) {
    return { ...state, initial: state.initial.slice(1), show: pickShow(state.initial[0]) }
  } else if (state.show !== null && input !== null) {
    if (state.show[1].includes(input)) {
      // User was correct
      if (state.show[3] === -1) {
        // User was correct from the start
        return pick({ ...state, correct: [...state.correct, state.show] }, { correct: true, input, option: state.show })
      } else if (state.show[3] >= correctAfter) {
        // User was correct in repetition enough times
        return pick({ ...state, corrected: [...state.corrected, pickCorrect(state.show)] }, { correct: true, input, option: state.show })
      } else {
        // User was correct but should try more
        return pick({ ...state, error: [...state.error, pickCorrect(state.show)] }, { correct: true, input, option: state.show })
      }
    } else {
      // User was incorrect
      return pick({ ...state, error: [...state.error, pickIncorrect(state.show)] }, { correct: false, input, option: state.show })
    }
  } else {
    throw new Error('Invalid state error!')
  }
}

const prepareCorrectedInitialState = lastState => {
  return {
    initial: lastState.corrected,
    correct: [],
    corrected: [],
    error: [],
    inError: false,
    show: null,
    answer: null,
    results: false
  }
}

export { data, reduceNextState, prepareInitialState, prepareCorrectedInitialState }

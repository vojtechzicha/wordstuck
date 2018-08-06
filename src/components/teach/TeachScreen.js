import React, { Component, Fragment } from 'react'
import moment from 'moment'
import { data, prepareInitialState, reduceNextState, prepareCorrectedInitialState } from './algorithm'

const show = option => option.join(', ')

const StartScreen = ({ state, title, onClick }) => (
  <section className={`download bg-primary text-center`} id="download">
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <h1>
            You're about to learn <code>{title}</code>! Great!
          </h1>
          <a onClick={onClick} className="btn btn-xl btn-outline">
            Let's do it
          </a>
        </div>
        <div className="col-md-6">
          <div>
            <p style={{ fontSize: '12pt' }}>
              There'll be <code>{state.initial.length}</code> words to learn.<br />
              Each block will consists of <code>3</code> words. <br />
              If you make mistake, you'll need to correct yourself at least <code>2</code> times to continue
            </p>
          </div>
          <div>
            <p>Good luck!</p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const EndScreen = ({ state, onClickCorrect, onClickAll }) => (
  <section className={`download bg-primary text-center`} id="download">
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <h1>
            Great work! All <code>{state.correct.length + state.corrected.length}</code> learned!
          </h1>
          <p>
            It took you <code>{[...state.correct, ...state.corrected].map(i => i[2]).reduce((pr, cu) => pr + cu, 0)}</code> attempts. Can
            you do better?
          </p>
        </div>
        <div className="col-md-6">
          {state.corrected.length > 0 ? (
            <div>
              <a onClick={onClickCorrect} className="btn btn-xl btn-outline">
                Again - only the errors
              </a>
            </div>
          ) : null}
          <div>
            <a onClick={onClickAll} className="btn btn-xl btn-outline">
              Again - all words
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const ShowScreen = ({ state, input, onChange, onSubmit }) => (
  <section
    className={`download bg-${state.answer === null ? 'primary' : state.answer.correct ? 'correct' : 'incorrect'} text-center`}
    id="download">
    <div className="container">
      <div className="form-row">
        <div className="col-md-12">
          <div>
            {state.answer === null ? null : state.answer.correct ? (
              <h1>
                You've been right! <code>{show(state.answer.option[0])}</code> really is <code>{show(state.answer.option[1])}</code>!
              </h1>
            ) : (
              <h1>
                Oh no :( <code>{show(state.answer.option[0])}</code> actually means <code>{show(state.answer.option[1])}</code> (not{' '}
                <code>{state.answer.input}</code>)
              </h1>
            )}
          </div>
        </div>
      </div>
      <div className="form-row" style={{ marginTop: '15px' }}>
        <div className="col-md-6">
          <h3>
            What does <code>{show(state.show[0])}</code> mean?
          </h3>
        </div>
        <div className="col-md-6">
          <form
            onSubmit={e => {
              onSubmit()
              e.preventDefault()
              return false
            }}>
            <input type="text" className="form-control" onChange={onChange} value={input} style={{ fontWeight: 'bold' }} autoFocus={true} />
            <br />
            <button type="submit" className="btn btn-xl">
              CHECK
            </button>
          </form>
        </div>
      </div>
      <div className="form-row" style={{ marginTop: '15px' }}>
        {state.answer !== null ? (
          <p>
            So far{' '}
            {state.correct.length > 0 || state.correct.length > 0 ? (
              <Fragment>
                you've learned <code>{state.correct.length + state.corrected.length}</code> words{state.correct.length > 0 ? (
                  <small>
                    {' '}
                    (and of which <code>{state.correct.length}</code> from the top of your head!)
                  </small>
                ) : null}
                {state.error.length > 0 ? (
                  <Fragment>
                    {' '}
                    struggling with <code>{state.error.length}</code> words currently
                  </Fragment>
                ) : null}
              </Fragment>
            ) : (
              <Fragment>you're off to rocky start</Fragment>
            )}.
            {state.initial.length > 0 ? (
              <Fragment>
                {' '}
                Still <code>{state.initial.length}</code> to go!
              </Fragment>
            ) : (
              <Fragment>Nearly there!</Fragment>
            )}
          </p>
        ) : (
          <p>Good luck!</p>
        )}
      </div>
    </div>
  </section>
)

class TeachScreen extends Component {
  state = {
    algorithmState: prepareInitialState(data),
    input: '',
    combo: null
  }

  progress = input => {
    this.setState(({ algorithmState: previousState }) => ({
      algorithmState: reduceNextState(previousState, input),
      input: ''
    }))
  }

  render() {
    const { algorithmState: state, input } = this.state

    if (state.show === null) {
      if (state.results) {
        return (
          <EndScreen
            state={state}
            title=""
            onClick={null}
            onClickCorrect={() => this.setState({ algorithmState: reduceNextState(prepareCorrectedInitialState(state), null), input: '' })}
            onClickAll={() => this.setState({ algorithmState: prepareInitialState(data), input: '' })}
          />
        )
      } else {
        return <StartScreen state={state} title="Japanese - Basic Numbers" onClick={() => this.progress(null)} />
      }
    } else {
      return (
        <ShowScreen
          state={state}
          input={input}
          onChange={e => this.setState({ input: e.currentTarget.value })}
          onSubmit={() => this.progress(input)}
        />
      )
    }
  }
}

export default TeachScreen

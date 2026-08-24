import { useState, useEffect } from 'react'

function Counter({ initialCount, step }) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
  console.log('Count changed:', count)
}, [count])

  return (
    <div>
      <h2>Counter</h2>

      <p>Count: {count}</p>

      <button onClick={() => setCount(count + step)}>
        Increment
      </button>

      <button onClick={() => setCount(count - step)}>
        Decrement
      </button>

      <button onClick={() => setCount(initialCount)}>
        Reset
      </button>
    </div>
  )
}

export default Counter
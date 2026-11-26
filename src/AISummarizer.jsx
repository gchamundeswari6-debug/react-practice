import { useState } from 'react'
import './App.css'

function AISummarizer() {
    const [text, setText] = useState('')
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(false)
    const [usersError, setUsersError] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showCount, setShowCount] = useState(false)
    const [countText, setCountText] = useState('')

    const getUsers = async () => {
        setUsersLoading(true)
        setUsersError('')
        setUsers([])

        try {
            const response = await fetch(
                'https://jsonplaceholder.typicode.com/users'
            )

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data)

        } catch (error) {
            setUsersError(error.message)

        } finally {
            setUsersLoading(false)
        }
    }

    const handleSummarize = async () => {
        if (!text.trim()) {
            setSummary('Please enter some text.')
            return
        }

        setLoading(true)
        setSummary('')
        setError('')
        setSuccess('')

        try {
            const response = await fetch(
                'http://localhost:5000/summarize',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to summarize')
            }
            console.log('data', data)

            setSummary(data.summary)
            setSuccess('Summary generated successfully!')

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    const handleClear = () => {
        setText('')
        setSummary('')
        setUsers([])
        setUsersError('')
        setError('')
        setSuccess('')
        setShowCount(false)
        setCountText('')
    }

    return (
        <div>
            <h1>AI Text Summarizer</h1>

            <textarea
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => {
                    setCountText(text)
                    setShowCount(true)
                }}
                rows={5}
                cols={40}
            />

            {showCount && (
                <p>Characters: {countText.length}</p>
            )}
            {showCount && (
                <p>
                    Words: {countText.trim() ? countText.trim().split(/\s+/).length : 0}
                </p>
            )}
            <br />

            <button onClick={handleSummarize} disabled={loading} className="btn btn-primary m2">
                {loading ? 'Summarizing...' : 'Summarize'}
            </button>
            <button
                onClick={handleClear}
                disabled={loading}
                className="btn btn-primary m2"
            >
                Clear
            </button>
            <button onClick={getUsers} disabled={usersLoading} className="btn btn-primary">
                {usersLoading ? 'Loading...' : 'Get Users'}
            </button>
            {usersLoading && <p>Loading users...</p>}
            {usersError && <p>{usersError}</p>}
            <br />
            {users.length > 0 && (
                <>
                    <h2>Users List</h2>
                    {users.map((user) => (
                        <div key={user.id}>
                            <p>{user.name}</p>
                            <p>{user.email}</p>
                        </div>
                    ))}
                </>
            )}
            {success && (
                <p className="text-success">
                    {success}
                </p>
            )}
            {summary && (
                <>
                    <h2>Summary</h2>
                    <p>{summary}</p>
                </>
            )}

            {error && (
                <p className="text-danger">
                    {error}
                </p>
            )}
        </div>
    )
}

export default AISummarizer
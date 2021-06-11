import React from 'react'
import { useQuery, useMutation } from "@apollo/react-hooks";
import {gql} from 'apollo-boost'

const GET_TODOS = gql`query getTodos {
      todos {
       done
       id
       text
     }
   }`

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
  update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
    returning {
      done
      id
      text
    }
  }
}
`

const ADD_TODO = gql`
mutation addTodo($text: String!) {
  insert_todos(objects: {text: $text}) {
    returning {
      done
      id
      text
    }
  }
}
`

const DELETE_TODO = gql`
mutation deleteTodo($id: uuid!) {
  delete_todos(where: {id: {_eq: $id}}) {
    returning {
      done
      id
      text
    }
  }
}
`

function App() {
  const [todoText, setTodoText] = React.useState('')
  const{data, loading, error} = useQuery(GET_TODOS)
  const [toggleTodo] = useMutation(TOGGLE_TODO)
  const [addTodo] = useMutation(ADD_TODO, {
   onCompleted: () => setTodoText('') 
  })
  const [deleteTodo] = useMutation(DELETE_TODO)


  const handleToggleTodo = async ({id, done}) => {
    const data = await toggleTodo({variables: {id, done: !done}})
    console.log('Toggled todo', data)
  }

  const handleAddTodo = async (event) => {
    event.preventDefault()
    if (!todoText.trim()) return
    const data = await addTodo({variables:{text: todoText},
      refetchQueries: [
        { query: GET_TODOS}
      ]
    })
    console.log('Added todo', data)
    // setTodoText('')
  }

  const handleDeleteTodo = async ({id}) => {
    const isConfirmed = window.confirm('Do you want to delete this todo?')
    if (isConfirmed) {
      const data = await deleteTodo(
        {variables: {id},
        update: cache => {
          const prevData = cache.readQuery({query: GET_TODOS})
          const newTodos = prevData.todos.filter(todo => todo.id !== id)
          cache.writeQuery({query: GET_TODOS, data: {todos: newTodos}})
        }
        })
      console.log('Delete todo', data)
    }
    
  }

  if (loading) return <div>Loading todos...</div>
  if (error) return <div>Error fetching todos</div>
  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-1">GraphQL Checklist {" "}
      <span role="img" aria-label="Checkmark">✅</span>
      </h1>
      <form className="mb3" onSubmit={handleAddTodo}>
        <input 
          className="pa2 f4 b--dashed"
          type="text"
          placeholder="Write your todo"
          onChange={event => setTodoText(event.target.value)}
          value={todoText}
        />
        <button type="submit"
          className="pa2 f4 bg-green"
        >Create</button>
      </form>
      <div className="flex items-center justify-center flex-column">
      {data.todos.map(todo => (
        <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
          <span
            className={`pointer list pa1 f3 ${todo.done && "strike"}`}
          >
            {todo.text}
          </span>
          <button
            onClick={() => handleDeleteTodo(todo)}
            className="bg-transparent bn f4"
          >
            <span className="red">&times;</span>
          </button>
        </p>
      ))}
      </div>
    </div>
  )
}

export default App
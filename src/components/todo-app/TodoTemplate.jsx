{todos.map((todo, index) => (
  <ListGroupItem key={todo.id || index}>
    {todo.title}
  </ListGroupItem>
))}
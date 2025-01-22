import React, { useState, useEffect, useContext } from "react";
import Navbar from "./Navbar"; // Import Navbar
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import {
  Button,
  ListGroup,
  ListGroupItem,
  Form,
  Input,
  Container,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
} from "reactstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const TodoTemplate = () => {
  const { isAuthenticated, userEmail, checkAuthStatus } = useContext(AuthContext);
  const { state } = useLocation(); // Access userId passed from Dashboard
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tasks, setTasks] = useState({}); // Initialize tasks as an empty object
  const [newTask, setNewTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [newListName, setNewListName] = useState(""); // New list name
  const [isLoading, setIsLoading] = useState(true); // Loading indicator
  const [confirmDelete, setConfirmDelete] = useState(null); // To track which todo list is being deleted
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus(); // Check auth status on mount
  }, [checkAuthStatus]);

  useEffect(() => {
    const fetchTodoLists = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/todolist/${state.userId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch todo lists");
        }
        const { todos } = await response.json();
        const transformedData = todos.reduce((acc, todo) => {
          if (!acc[todo.title]) {
            acc[todo.title] = [];
          }
          if (todo.tasks) {
            todo.tasks.forEach((task) => {
              acc[todo.title].push({
                id: task._id || null,
                text: task.title,
                completed: task.completed,
                dueDate: task.due_date,
              });
            });
          }
          return acc;
        }, {});
        setTasks(transformedData);
        if (!selectedCategory && Object.keys(transformedData).length > 0) {
          setSelectedCategory(Object.keys(transformedData)[0]);
        }
      } catch (error) {
        console.error("Error fetching todo lists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && state?.userId) {
      fetchTodoLists();
    }
  }, [isAuthenticated, selectedCategory, state?.userId]);

  if (!isAuthenticated) {
    navigate("/login"); // Redirect to login if not authenticated
    return null;
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch("http://localhost:5000/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: newTask, listName: selectedCategory }),
        });

        if (response.ok) {
          const newTodo = await response.json();
          setTasks((prevTasks) => ({
            ...prevTasks,
            [selectedCategory]: [
              ...prevTasks[selectedCategory],
              {
                id: newTodo._id,
                text: newTodo.text,
                completed: newTodo.completed,
                dueDate: newTodo.dueDate,
              },
            ],
          }));
          setNewTask("");
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/todos/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setTasks((prevTasks) => ({
          ...prevTasks,
          [selectedCategory]: prevTasks[selectedCategory].filter((task) => task.id !== taskId),
        }));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDeleteTodoList = async (todoTitle) => {
    if (window.confirm(`Are you sure you want to delete the todo list: "${todoTitle}"?`)) {
      try {
        const formattedTitle = todoTitle.replace(/\s/g, "%20"); // Replace spaces with %20
        const response = await fetch(`http://localhost:5000/api/todolist/${state.userId}/${formattedTitle}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          setTasks((prevTasks) => {
            const newTasks = { ...prevTasks };
            delete newTasks[todoTitle]; // Remove the deleted todo list from the state
            return newTasks;
          });
        } else {
          console.error("Failed to delete todo list");
        }
      } catch (error) {
        console.error("Error deleting todo list:", error);
      }
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCreateNewList = async () => {
    if (newListName.trim() && !tasks[newListName]) {
      try {
        const response = await fetch(`http://localhost:5000/api/todolist/${state.userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: newListName }),
        });
        if (response.ok) {
          setTasks((prevTasks) => ({
            ...prevTasks,
            [newListName]: [],
          }));
          setSelectedCategory(newListName);
          setNewListName("");
          toggleModal();
        }
      } catch (error) {
        console.error("Error creating new todo list:", error);
      }
    }
  };

  return (
    <div>
      <Navbar username={userEmail} />
      <Container fluid className="mt-4">
        <Row>
          {/* Left Sidebar */}
          <Col md={3} className="bg-light p-4">
            <Button color="danger" className="mb-3 w-100" onClick={toggleModal}>
              + Create New Todo-list
            </Button>
            <ListGroup>
              {Object.keys(tasks).map((category) => (
                <ListGroupItem
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => handleCategoryClick(category)}
                  style={{ cursor: "pointer", backgroundColor: "#f0f8ff", color: "#333333", fontFamily: "Times New Roman", fontWeight:"bold" }} // Change background color for better contrast
                  className="d-flex justify-content-between align-items-center"
                >
                  {category}
                  <div>
                    <FaTrash
                      className="text-danger"
                      onClick={() => handleDeleteTodoList(category)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          {/* Right Content */}
          <Col md={9} className="p-4">
            {isLoading ? (
              <Spinner animation="border" />
            ) : (
              <div>
                <h3>{selectedCategory}</h3>
                <ListGroup>
                  {tasks[selectedCategory]?.map((task) => (
                    <ListGroupItem key={task.id} className="d-flex justify-content-between align-items-center">
                      <span>{task.text}</span>
                      <div>
                        <FaTrash className="text-danger" onClick={() => handleDeleteTask(task.id)} />
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>
                <div className="mt-3">
                  <Input
                    type="text"
                    placeholder="Add new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask();
                    }}
                  />
                  <Button color="primary" className="mt-2" onClick={handleAddTask}>
                    <FaPlus /> Add Task
                  </Button>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal for Creating New List */}
      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Create New Todo List</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Enter List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateNewList}>
            Create List
          </Button>
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TodoTemplate;

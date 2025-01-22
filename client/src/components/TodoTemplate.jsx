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
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCreateNewList = () => {
    if (newListName.trim() && !tasks[newListName]) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [newListName]: [],
      }));
      setSelectedCategory(newListName);
      setNewListName("");
      toggleModal();
    }
  };

  return (
    <div>
      <Navbar username={userEmail} />

      <Container fluid className="mt-4">
        <Row>
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
                  style={{ cursor: "pointer" }}
                >
                  {category}
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          <Col md={9} className="p-4">
            <h2 className="mb-4">{selectedCategory}</h2>
            <Form className="mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-8">
                  <Input
                    type="text"
                    placeholder="Add new..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    style={{ height: "3rem" }}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <Button color="primary" onClick={handleAddTask} className="w-100" style={{ height: "3rem" }}>
                    <FaPlus /> ADD
                  </Button>
                </div>
              </div>
            </Form>

            {isLoading ? (
              <div className="d-flex justify-content-center">
                <Spinner color="primary" />
              </div>
            ) : (
              <ListGroup>
                {tasks[selectedCategory]?.map((task) => (
                  <ListGroupItem key={task.id} className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <Input type="checkbox" checked={task.completed} readOnly />
                      <span className="ml-2">{task.text}</span>
                    </div>
                    <div className="d-flex">
                      <FaEdit className="text-primary mr-3" style={{ cursor: "pointer" }} />
                      <FaTrash
                        className="text-danger"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeleteTask(task.id)}
                      />
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </Col>
        </Row>
      </Container>

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
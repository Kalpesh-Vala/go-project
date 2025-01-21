import React, { useState, useEffect, useContext } from "react";
import Navbar from "../Navbar"; // Import Navbar
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
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
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const TodoTemplate = () => {
  const { isAuthenticated, userEmail, checkAuthStatus } = useContext(AuthContext); // Use context for auth
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [newListName, setNewListName] = useState(""); // State for new list name
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus(); // Check auth status when the component mounts
  }, [checkAuthStatus]);

  useEffect(() => {
    const fetchTodoLists = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/todos', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // Transform the data into the required format
          const transformedData = data.reduce((acc, todo) => {
            if (!acc[todo.listName]) {
              acc[todo.listName] = [];
            }
            acc[todo.listName].push({
              id: todo._id,
              text: todo.text,
              completed: todo.completed,
              dueDate: todo.dueDate
            });
            return acc;
          }, {});
          
          setTasks(transformedData);
          // Set the first list as selected if none is selected
          if (!selectedCategory && Object.keys(transformedData).length > 0) {
            setSelectedCategory(Object.keys(transformedData)[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching todo lists:', error);
      }
    };

    if (isAuthenticated) {
      fetchTodoLists();
    }
  }, [isAuthenticated, selectedCategory]);

  if (!isAuthenticated) {
    navigate("/login"); // Redirect to login if the user is not authenticated
    return null; // Prevent rendering while redirecting
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch('http://localhost:5000/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            text: newTask,
            listName: selectedCategory
          }),
        });

        if (response.ok) {
          const newTodo = await response.json();
          setTasks(prevTasks => ({
            ...prevTasks,
            [selectedCategory]: [...prevTasks[selectedCategory], {
              id: newTodo._id,
              text: newTodo.text,
              completed: newTodo.completed,
              dueDate: newTodo.dueDate
            }],
          }));
          setNewTask("");
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
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
      setSelectedCategory(newListName); // Select the new list
      setNewListName(""); // Reset the input field
      toggleModal(); // Close the modal
    }
  };

  return (
    <div>
      {/* Top Navbar with username */}
      <Navbar username={userEmail} /> {/* Pass userEmail from context to Navbar */}

      {/* Main Content */}
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
                  style={{ cursor: "pointer" }}
                >
                  {category}
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>

          {/* Right Content Area */}
          <Col md={9} className="p-4">
            <h2 className="mb-4">{selectedCategory}</h2>
            <Form className="mb-3">
              <div className="row g-2 align-items-center">
                {/* Input Field */}
                <div className="col-12 col-md-8">
                  <Input
                    type="text"
                    placeholder="Add new..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="form-control"
                    style={{ height: "3rem" }}
                  />
                </div>
                {/* Add Button */}
                <div className="col-6 col-md-3">
                  <Button
                    color="primary"
                    onClick={handleAddTask}
                    className="w-100"
                    style={{ height: "3rem" }}
                  >
                    <FaPlus /> ADD
                  </Button>
                </div>

                {/* Calendar Button */}
                <div className="col-6 col-md-1">
                  <Button
                    color="secondary"
                    className="w-100"
                    style={{ height: "3rem" }}
                  >
                    <FaCalendarAlt />
                  </Button>
                </div>
              </div>
            </Form>
            <ListGroup>
              {tasks[selectedCategory]?.map((task) => (
                <ListGroupItem
                  key={task.id}
                  className="d-flex justify-content-between align-items-center mb-2"
                  style={{ height: "4rem" }}
                >
                  <div className="d-flex align-items-center">
                    <Input
                      type="checkbox"
                      className="mr-2"
                      style={{ paddingRight: "1rem" }}
                      checked={task.completed}
                    />
                    <span>{task.text}</span>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <div className="d-flex mb-2">
                      <FaEdit
                        className="text-primary mr-3"
                        style={{ cursor: "pointer" }}
                      />
                      <FaTrash
                        className="text-danger"
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="text-secondary mr-2" />
                      <small>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</small>
                    </div>
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </Container>

      {/* Modal for New Todo List */}
      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Create New Todo List</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Enter new todo list name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateNewList}>
            Add
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

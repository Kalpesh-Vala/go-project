import React, { useState, useEffect, useContext } from "react";
import Navbar from "../Navbar"; // Import Navbar
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import { Button, ListGroup, ListGroupItem, Form, Input, Container, Row, Col } from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const TodoTemplate = () => {
  const { isAuthenticated, userEmail, checkAuthStatus } = useContext(AuthContext); // Use context for auth
  const [selectedCategory, setSelectedCategory] = useState("Todo-list-1");
  const [tasks, setTasks] = useState({
    "Todo-list-1": ["New Item added", "New Item added", "New Item added"],
    "Todo-list-2": ["New Item added"],
    "Todo-list-3": ["New Item added"],
  });
  const [newTask, setNewTask] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus(); // Check auth status when the component mounts
  }, [checkAuthStatus]);

  if (!isAuthenticated) {
    navigate("/login"); // Redirect to login if the user is not authenticated
    return null; // Prevent rendering while redirecting
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [selectedCategory]: [...prevTasks[selectedCategory], newTask],
      }));
      setNewTask("");
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
            <Button color="danger" className="mb-3 w-100">
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
                {tasks[selectedCategory].map((task, index) => (
                    <ListGroupItem
                    key={index}
                    className="d-flex justify-content-between align-items-center mb-2"
                    style={{ height: "4rem" }}
                    >
                    {/* Left Section: Checkbox and Task */}
                    <div className="d-flex align-items-center">
                        <Input
                        type="checkbox"
                        className="mr-2"
                        style={{ paddingRight: "1rem" }} // Added padding to create gap
                        />
                        <span>{task}</span> {/* Task text */}
                    </div>

                    {/* Right Section: Edit, Delete, Calendar */}
                    <div className="d-flex flex-column align-items-end">
                        {/* Top Row: Edit and Delete Icons */}
                        <div className="d-flex mb-2">
                        <FaEdit
                            className="text-primary mr-3"
                            style={{ cursor: "pointer" }}
                        /> {/* Margin between Edit and Delete icons */}
                        <FaTrash
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                        />
                        </div>

                        {/* Bottom Row: Calendar Icon and Date */}
                        <div className="d-flex align-items-center">
                        <FaCalendarAlt className="text-secondary mr-2" />
                        <small>28th Jan 2020</small>
                        </div>
                    </div>
                    </ListGroupItem>
                ))}
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TodoTemplate;

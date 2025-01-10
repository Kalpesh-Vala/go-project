import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import HomePage from "./components/HomePage";
// import DashboardPage from "./tmp/DashboardPage";

// const App = () => {
//   // Check if the user is logged in
//   const isLoggedIn = localStorage.getItem("token");

//   return (
//     <Router>
//       <div>
//         <Routes>
//           {/* Public routes */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/signup" element={<SignupForm />} />
//           <Route path="/login" element={<LoginForm />} />

//           {/* Protected route */}
//           <Route
//             path="/dashboard"
//             element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />}
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
          {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
};


export default App;

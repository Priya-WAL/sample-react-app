import React, { useEffect, useState } from "react";
import "./LoginForm.css";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../../socket";

const initialValues = {
  email: "",
  password: "",
};

const validate = (values) => {
  let errors = {};
  if (!values.email) {
    errors.email = "Email Required";
  } else if (!values.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    errors.email = "Enter a valid email";
  }
  if (!values.password) {
    errors.password = "Password Required";
  }
  return errors;
};

const LoginForm = () => {
  const [socketId, setSocketId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket.connected) {
      console.log("Socket connected?", socket.id)
      setSocketId(socket.id);
    //   console.log('SocketId', socketId)
    }
    // Listen for the connect event to get the socket.id
    socket.on("connect", () => {
      setSocketId(socket.id); // Save the socket.id when connection is successful
      console.log("Connected with socket ID:", socket.id);
    });
    
    // Clean up when the component unmounts
    return () => {
      socket.off("connect"); // Clean up the 'disconnect' listener
    };
  }, []);

  const login = async (data) => {
    console.log("testing", socketId);
    try {
      if (!socketId) {
        toast.error("Socket not connected yet, please try again");
        return;
      }

      // Add the socketId to the login data
      const loginData = { ...data, socketId };

      const res = await axios.post(
        "http://localhost:3000/user/login",
        loginData, {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const token = res.headers['authorization'];
      console.log('Authtoken', token)
      let userDetails = {
        userName: res.data.data.username,
        email: res.data.data.email
      }

      console.log('token', userDetails)
      localStorage.setItem("user", JSON.stringify(userDetails));
      localStorage.setItem("authToken", token)
      toast.success("Login successful!");

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error("Failed to login!");
    }
  };

  const onSubmit = (values, onSubmitProps) => {
    login(values);
    onSubmitProps.resetForm();
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email!")
      .required("Email is Required!"),
    password: Yup.string().required("Password is Required!"),
  });

  return (
    <div className="Container-login">
      <div className="Container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, onSubmitProps) => onSubmit(values, onSubmitProps)}
        >
          <Form>
            <h1> Login </h1>
            <div className="input-box">
              <Field type="email" placeholder="Email" name="email" />
              <MdEmail className="icon" />
              <div className="error">
                <ErrorMessage name="email" />
              </div>
            </div>
            <div className="input-box">
              <Field type="password" placeholder="Password" name="password" />
              <FaLock className="icon" />
              <div className="error">
                <ErrorMessage name="password" />
              </div>
            </div>
            <div className="remember-forgot">
              <label>
                {" "}
                <input type="checkbox" /> Remember Me{" "}
              </label>
              <a href="#"> Forgot Password?</a>
            </div>

            <div className="register-link">
              <button type="submit">Login</button>
            </div>

            <div className="register-link">
              <p>
                {" "}
                Don't have an account? <Link to="/register"> Register</Link>
              </p>
            </div>
          </Form>
        </Formik>
        <ToastContainer />
      </div>
    </div>
  );
};

export default LoginForm;

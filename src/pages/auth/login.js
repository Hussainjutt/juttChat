import React from "react";
import styled from "styled-components";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
const Container = styled.div`
  width: 100%;
  max-width: 450px;
  margin: 2rem auto;
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0px 0px 9px 2px rgba(0, 0, 0, 0.35);
`;
const H1 = styled.h1`
  font-size: 40px;
  line-height: 53px;
  margin: 1rem 0;
  font-family: cursive;
  text-align: center;
`;
const H2 = styled.h1`
  font-size: 25px;
  line-height: 28px;
  margin: 0.4rem 0;
  text-align: left;
  font-family: cursive;
`;
const InputWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;
const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: none;
  border-bottom: 1px solid ${(props) => (props.error ? "red" : "#ccc")};
  outline: none;
  &:focus {
    outline: 2px solid ${(props) => (props.error ? "red" : "#7489d9")};
    border-radius: 4px;
  }
`;
const Button = styled.button`
  width: 100%;
  padding: 0.7rem;
  font-size: 16px;
  font-family: monospace;
  color: white;
  background: linear-gradient(45deg, #7489d9, #4768e7d6);
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;
const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #ccc;
  text-align: center;
  margin-bottom: 1rem;
`;
const Or = styled.span`
  position: relative;
  color: gray;
  background-color: white;
  padding: 0 3px;
  bottom: -10px;
  font-family: cursive;
`;
const Text = styled.small`
  font-size: 14px;
`;
const Link = styled.span`
  color: #7489d9;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
  }
`;
const Error = ({ isError, error }) => {
  const Message = styled.small`
    color: red;
  `;
  return isError && <Message>{error}</Message>;
};
const Login = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <H1>Jutt Chat&#9996;</H1>
      <H2>LogIn</H2>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          signInWithEmailAndPassword(auth, values.email, values.password)
            .then((res) => {
              toast.success("Sign In successfully");
              setTimeout(() => {
                navigate("/home");
              }, 1000);
            })
            .catch((err) => toast.error(err.message));
        }}
      >
        {({ handleChange, handleSubmit, values, touched, errors }) => (
          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <Input
                type="email"
                placeholder="Email Address"
                name="email"
                onChange={handleChange}
                value={values.email}
                error={errors.email && touched.email}
              />
              <Error
                isError={errors.email && touched.email}
                error={errors.email}
              />
            </InputWrapper>
            <InputWrapper>
              <Input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleChange}
                value={values.password}
                error={errors.password && touched.password}
              />
              <Error
                isError={errors.password && touched.password}
                error={errors.password}
              />
            </InputWrapper>
            <Button type="submit">LogIn</Button>
            <Divider>
              <Or>Or</Or>
            </Divider>
            <Text>
              Not have an account ,{" "}
              <Link onClick={() => navigate("/register")}>Register now</Link>
            </Text>
          </form>
        )}
      </Formik>
    </Container>
  );
};
const schema = yup.object().shape({
  email: yup.string().email("Not an valid Email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "To short atleast have 6 digit"),
});
export default Login;

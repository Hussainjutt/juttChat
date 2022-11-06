import React, { useState } from "react";
import styled from "styled-components";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
const Container = styled.div`
  width: 100%;
  max-width: 450px;
  margin: 2rem auto;
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0px 0px 9px 2px rgba(0, 0, 0, 0.35);
  @media (max-width: 576px) {
    width: 100%;
    height: 100vh;
    max-width: none;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
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
const ConfirmEmail = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  return (
    <Container>
      <H1>Jutt Chat&#9996;</H1>
      <H2>Confirm Email</H2>
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            setLoader(true);
            await sendPasswordResetEmail(auth, values.email);
            toast.success("Reset link has been send to your Email");
            setTimeout(() => {
              setLoader(false);
            }, 100);
          } catch (err) {
            toast.error(err.message);
            setLoader(false);
          }
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
            <Button type="submit" disabled={loader}>
              {loader ? <BeatLoader color="#fff" /> : "Send"}
            </Button>
            <Divider>
              <Or>Or</Or>
            </Divider>
            <Text>
              No need to reset ,{" "}
              <Link onClick={() => navigate("/")}>LogIn now</Link>
            </Text>
          </form>
        )}
      </Formik>
    </Container>
  );
};
const schema = yup.object().shape({
  email: yup.string().email("Not an valid Email").required("Email is required"),
});
export default ConfirmEmail;

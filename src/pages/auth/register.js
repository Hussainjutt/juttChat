import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ImagePicker from "../../components/ImagePicker/ImagePicker";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
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
const Error = ({ isError, error, forAvatar }) => {
  const Message = styled.small`
    color: red;
    position: ${forAvatar && "relative"};
    top: -11px;
  `;
  return isError && <Message>{error}</Message>;
};
const Register = () => {
  const clickRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(null);
  const UploadFile = (file, setVal) => {
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);
    const UploadTask = uploadBytesResumable(storageRef, file);
    UploadTask.on(
      "state_changed",
      (snapShot) => {
        switch (snapShot.state) {
          case "paused":
            setLoading(true);
            break;
          case "running":
            setLoading(true);
            break;
        }
        let progress = (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
        if (progress !== null && progress < 100) {
          setLoading(true);
        } else {
          setLoading(false);
        }
      },
      (errors) => {
        console.error(errors);
      },
      () => {
        getDownloadURL(UploadTask.snapshot.ref).then((res) => {
          setVal("avatar", res);
          setName(file.name);
        });
      }
    );
  };
  const submit = async (values) => {
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(user.user, {
        displayName: values.user_name,
        photoURL: values.avatar,
      });
      await setDoc(doc(db, "users", user.user.uid), {
        uid: user.user.uid,
        ...values,
      });
      await setDoc(doc(db, "userChats", user.user.uid), {});
      toast.success("Registered successfully");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <Container>
      <H1>Jutt Chat&#9996;</H1>
      <H2>Register</H2>
      <Formik
        initialValues={{
          user_name: "",
          email: "",
          password: "",
          avatar: "",
        }}
        enableReinitialize={true}
        validationSchema={schema}
        onSubmit={(values) => {
          submit(values);
        }}
      >
        {({
          handleChange,
          handleSubmit,
          values,
          touched,
          errors,
          setFieldValue,
          setErrors,
        }) => (
          <form onSubmit={handleSubmit}>
            <InputWrapper>
              <Input
                type="text"
                placeholder="Full Name"
                name="user_name"
                onChange={handleChange}
                value={values.user_name}
                error={errors.user_name && touched.user_name}
              />
              <Error
                isError={errors.user_name && touched.user_name}
                error={errors.user_name}
              />
            </InputWrapper>
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
            <InputWrapper>
              <Input
                type="file"
                style={{ display: "none" }}
                ref={clickRef}
                onChange={(e) => {
                  if (e.target.files[0].size <= 160 * 1024) {
                    if (
                      [
                        "image/jpg",
                        "image/jpeg",
                        "image/gif",
                        "image/png",
                      ].includes(e.target.files[0].type)
                    ) {
                      setLoading(true);
                      let file = e.target.files[0];
                      UploadFile(file, setFieldValue);
                      setName(file.name);
                    } else {
                      setErrors({
                        ...errors,
                        avatar: "Please provide an valid format",
                      });
                      setName("Please provide an valid format");
                    }
                  } else {
                    setErrors({ ...errors, avatar: "File is to large" });
                    setName("File is to large");
                  }
                }}
              />
              <ImagePicker
                onClick={() => clickRef.current.click()}
                name={name}
                error={errors.avatar}
              />
              <Error
                isError={errors.avatar}
                error={errors.avatar}
                forAvatar={true}
              />
            </InputWrapper>
            <Button type="submit" disabled={loading}>
              Register
            </Button>
            <Divider>
              <Or>Or</Or>
            </Divider>
            <Text>
              Already have an account ,{" "}
              <Link onClick={() => navigate("/")}>SigIn now</Link>
            </Text>
          </form>
        )}
      </Formik>
    </Container>
  );
};
const schema = yup.object().shape({
  user_name: yup.string().required("Name is required"),
  email: yup.string().email("Not an valid Email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "To short atleast have 6 digit"),
  avatar: yup.string().required("An avatar is required"),
});
export default Register;

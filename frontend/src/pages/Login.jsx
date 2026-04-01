import GoogleLoginButton from "../components/GoogleLoginButton";

function Login() {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >

    <GoogleLoginButton />

    </div>

  );
}

export default Login;
import GoogleLoginButton from "../components/GoogleLoginButton";
import GithubLoginButton from "../components/GithubLoginButton";

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function Login() {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
      </CardHeader>
      <CardFooter className="flex-col gap-2">
        <GoogleLoginButton />
        <GithubLoginButton />
        <br />
        <p>First time here? Just sign in and your account will be created automatically</p>
      </CardFooter>
    </Card>
    </div>
    
  );
}

export default Login;
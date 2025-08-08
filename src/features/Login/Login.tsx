import styles from "./Login.module.scss";

function Login() {
  return (
    <div>
      <form className={styles.loginForm}>
        <input placeholder="Email" />
        <input placeholder="Password" />
        <button name="Log in" />
      </form>
    </div>
  );
}

export default Login;

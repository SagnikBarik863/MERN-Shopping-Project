import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage, loginCustomer } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      // The server sets the HttpOnly cookie in this response
      await loginCustomer(form);
      navigate("/home");
    } catch (err) {
      setError(err?.response?.status === 401 ? "Invalid Credentials" : getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={handleSubmit} noValidate>
        <h1 className="brand">ShopKart</h1>
        <h2>Login</h2>

        {location.state?.message && <p className="alert alert-success">{location.state.message}</p>}
        {error && <p className="alert alert-error">{error}</p>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />

        <button className="btn btn-block" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="muted center">New to ShopKart? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
};

export default Login;

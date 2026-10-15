import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage, registerCustomer } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must contain at least 6 characters";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = "Phone number must contain 10 digits";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await registerCustomer(form);
      navigate("/login", { state: { message: "Account created. Please log in." } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={handleSubmit} noValidate>
        <h1 className="brand">ShopKart</h1>
        <h2>Create Account</h2>

        {serverError && <p className="alert alert-error">{serverError}</p>}

        <label>Full Name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} />
        {errors.fullName && <p className="error-text">{errors.fullName}</p>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <label>Phone Number</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
        {errors.phone && <p className="error-text">{errors.phone}</p>}

        <button className="btn btn-block" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="muted center">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
